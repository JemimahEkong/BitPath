/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleDestroy,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import {
  connect,
  defaultConfig,
  defaultServerConfig,
} from '@breeztech/breez-sdk-spark/nodejs';
import type {
  BreezSdk,
  Network,
  Payment,
  PaymentStatus,
  PrepareSendPaymentResponse,
  SendPaymentOptions,
  SdkEvent,
} from '@breeztech/breez-sdk-spark/nodejs';
import {
  LightningPaymentDirection,
  LightningPaymentStatus,
  WithdrawalStatus,
} from 'generated/prisma/client';
import { PrismaService } from 'src/database/database.service';
import { CreateLightningInvoiceDto } from './dto/create-lightning-invoice.dto';
import { SendLightningPaymentDto } from './dto/send-lightning-payment.dto';
import { RegisterLightningAddressDto } from './dto/register-lightning-address.dto';
import { LightningAnalyticsQueryDto } from './dto/lightning-analytics-query.dto';
import { WithdrawDto } from './dto/withdraw.dto';

type SerializablePayment = ReturnType<LightningService['serializeForJson']>;

@Injectable()
export class LightningService implements OnModuleDestroy {
  private readonly logger = new Logger(LightningService.name);
  private sdkPromise?: Promise<BreezSdk>;
  private sdk?: BreezSdk;
  private listenerId?: string;
  private readonly network: Network;
  private readonly storageDir: string;
  private readonly lightningAddressDomain: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.network = this.resolveNetwork();
    this.storageDir =
      this.configService.get<string>('BREEZ_STORAGE_DIR') ||
      join(process.cwd(), '.breez-spark', this.network);
       this.lightningAddressDomain =
         this.configService.get<string>('LIGHTNING_ADDRESS_DOMAIN') ||
         'bitpath.com';
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.sdk) {
      return;
    }

    try {
      if (this.listenerId) {
        await this.sdk.removeEventListener(this.listenerId);
      }
      await this.sdk.disconnect();
    } catch (error) {
      this.logger.warn(
        `Failed to disconnect Breez SDK cleanly: ${this.errorMessage(error)}`,
      );
    }
  }

  isConfigured(): boolean {
    const mnemonic = this.configService.get<string>('BREEZ_MNEMONIC');
    const apiKey = this.configService.get<string>('BREEZ_API_KEY');

    return Boolean(mnemonic && (this.network === 'regtest' || apiKey));
  }

  async getStatus() {
    const status = {
      configured: this.isConfigured(),
      connected: Boolean(this.sdk),
      network: this.network,
      storageDir: this.storageDir,
      requiresApiKey: this.network !== 'regtest',
      balanceSats: undefined as string | undefined,
      sdkNodeId: undefined as string | undefined,
    };

    if (!status.configured) {
      return status;
    }

    const sdk = await this.getSdk();
    const info = await sdk.getInfo({});
    const serializedInfo = this.serializeForJson(info) as {
      balanceSats?: string;
      pubkey?: string;
      nodeId?: string;
    };

    return {
      ...status,
      connected: true,
      balanceSats: serializedInfo.balanceSats,
      sdkNodeId: serializedInfo.pubkey || serializedInfo.nodeId,
    };
  }

  async createInvoice(dto: CreateLightningInvoiceDto) {
    await this.assertUserExists(dto.userId);
    await this.assertConversationAccess(dto.userId, dto.conversationId);

    const sdk = await this.getSdk();
    const expirySecs = dto.expirySecs ?? 3600;
    const amountSats = dto.amountSats ?? this.satsFromXp(dto.xpEarned);
    const description =
      dto.description ||
      `BitPath reward${dto.reason ? `: ${dto.reason}` : ''}`.slice(0, 280);

    const response = await sdk.receivePayment({
      paymentMethod: {
        type: 'bolt11Invoice',
        description,
        amountSats,
        expirySecs,
        paymentHash: undefined,
      },
    });

    const payment = await this.prisma.lightningPayment.create({
      data: {
        userId: dto.userId,
        conversationId: dto.conversationId,
        direction: LightningPaymentDirection.INCOMING,
        status: LightningPaymentStatus.PENDING,
        amountSats: amountSats === undefined ? undefined : BigInt(amountSats),
        feeSats: response.fee,
        paymentRequest: response.paymentRequest,
        description,
        reason: dto.reason,
        expiresAt: new Date(Date.now() + expirySecs * 1000),
      },
    });

    return this.serializeForJson({
      ...payment,
      paymentRequest: response.paymentRequest,
      receiveFeeSats: response.fee,
    });
  }

  async sendPayment(dto: SendLightningPaymentDto) {
    await this.assertUserExists(dto.userId);
    await this.assertConversationAccess(dto.userId, dto.conversationId);

    const sdk = await this.getSdk();
    const existing = dto.idempotencyKey
      ? await this.prisma.lightningPayment.findUnique({
          where: { idempotencyKey: dto.idempotencyKey },
        })
      : null;

    if (existing) {
      return this.serializeForJson(existing);
    }

    const prepareResponse = await sdk.prepareSendPayment({
      paymentRequest: dto.paymentRequest,
      amount: dto.amountSats === undefined ? undefined : BigInt(dto.amountSats),
      tokenIdentifier: undefined,
      conversionOptions: undefined,
      feePolicy: undefined,
    });

    const options = this.optionsForPreparedPayment(
      prepareResponse,
      dto.preferSpark ?? false,
    );

    const sendResponse = await sdk.sendPayment({
      prepareResponse,
      options,
      idempotencyKey: dto.idempotencyKey,
    });

    const savedPayment = await this.prisma.lightningPayment.create({
      data: {
        userId: dto.userId,
        conversationId: dto.conversationId,
        externalPaymentId: sendResponse.payment.id,
        paymentRequest: dto.paymentRequest,
        paymentHash: this.extractPaymentHash(sendResponse.payment),
        idempotencyKey: dto.idempotencyKey,
        direction: LightningPaymentDirection.OUTGOING,
        status: this.mapPaymentStatus(sendResponse.payment.status),
        amountSats: sendResponse.payment.amount,
        feeSats: sendResponse.payment.fees,
        description: this.extractDescription(sendResponse.payment),
        reason: dto.reason,
        settledAt:
          sendResponse.payment.status === 'completed' ? new Date() : undefined,
        sdkPayment: this.serializeForJson(sendResponse.payment),
      },
    });

    return this.serializeForJson({
      payment: savedPayment,
      prepare: this.summarizePrepareResponse(prepareResponse),
      sdkPayment: sendResponse.payment,
    });
  }

  async syncPayments() {
    const sdk = await this.getSdk();
    await sdk.syncWallet({});

    const response = await sdk.listPayments({
      limit: 100,
      sortAscending: false,
    });

    const updates = await Promise.all(
      response.payments.map((payment) => this.updateTrackedPayment(payment)),
    );

    return this.serializeForJson({
      scanned: response.payments.length,
      updated: updates.filter(Boolean).length,
    });
  }

  async listPayments(query: {
    userId?: string;
    status?: LightningPaymentStatus;
    direction?: LightningPaymentDirection;
    limit?: number;
    offset?: number;
  }) {
    const limit = Math.min(query.limit ?? 50, 100);
    const payments = await this.prisma.lightningPayment.findMany({
      where: {
        userId: query.userId,
        status: query.status,
        direction: query.direction,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: query.offset ?? 0,
    });

    return this.serializeForJson(payments);
  }

  async getSdkPayment(paymentId: string) {
    const sdk = await this.getSdk();
    const response = await sdk.getPayment({ paymentId });

    if (response.payment) {
      await this.updateTrackedPayment(response.payment);
    }

    return this.serializeForJson(response);
  }

  private async getSdk(): Promise<BreezSdk> {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException(
        'Breez Spark is not configured. Set BREEZ_MNEMONIC and BREEZ_API_KEY, or use BREEZ_NETWORK=regtest for SDK development.',
      );
    }

    if (!this.sdkPromise) {
      this.sdkPromise = this.connectSdk();
    }

    return this.sdkPromise;
  }

  private async connectSdk(): Promise<BreezSdk> {
    await mkdir(this.storageDir, { recursive: true });

    const config = this.parseBoolean(
      this.configService.get<string>('BREEZ_SERVER_MODE'),
      false,
    )
      ? defaultServerConfig(this.network)
      : defaultConfig(this.network);

    config.apiKey = this.configService.get<string>('BREEZ_API_KEY');
    config.preferSparkOverLightning = this.parseBoolean(
      this.configService.get<string>('BREEZ_PREFER_SPARK_OVER_LIGHTNING'),
      false,
    );

    const sdk = await connect({
      config,
      seed: {
        type: 'mnemonic',
        mnemonic: this.configService.getOrThrow<string>('BREEZ_MNEMONIC'),
        passphrase: this.configService.get<string>('BREEZ_MNEMONIC_PASSPHRASE'),
      },
      storageDir: this.storageDir,
    });

    this.sdk = sdk;
    this.listenerId = await sdk.addEventListener({
      onEvent: (event: SdkEvent) => {
        void this.handleSdkEvent(event);
      },
    });

    this.logger.log(`Connected Breez Spark SDK on ${this.network}`);
    return sdk;
  }

  private async handleSdkEvent(event: SdkEvent): Promise<void> {
    if (
      event.type === 'paymentSucceeded' ||
      event.type === 'paymentPending' ||
      event.type === 'paymentFailed'
    ) {
      await this.updateTrackedPayment(event.payment);
    }
  }

  private async updateTrackedPayment(payment: Payment) {
    const paymentRequest = this.extractPaymentRequest(payment);
    const paymentHash = this.extractPaymentHash(payment);
    const status = this.mapPaymentStatus(payment.status);
    const data = {
      externalPaymentId: payment.id,
      paymentHash,
      status,
      amountSats: payment.amount,
      feeSats: payment.fees,
      description: this.extractDescription(payment),
      settledAt:
        status === LightningPaymentStatus.SUCCEEDED ? new Date() : undefined,
      sdkPayment: this.serializeForJson(payment) as SerializablePayment,
    };

    const paymentFilters: Array<
      | { externalPaymentId: string }
      | { paymentRequest: string }
      | { paymentHash: string }
    > = [{ externalPaymentId: payment.id }];

    if (paymentRequest) {
      paymentFilters.push({ paymentRequest });
    }

    if (paymentHash) {
      paymentFilters.push({ paymentHash });
    }

    const trackedPayment = await this.prisma.lightningPayment.findFirst({
      where: { OR: paymentFilters },
    });

    if (!trackedPayment) {
      return null;
    }

    return this.prisma.lightningPayment.update({
      where: { id: trackedPayment.id },
      data,
    });
  }

  private optionsForPreparedPayment(
    prepareResponse: PrepareSendPaymentResponse,
    preferSpark: boolean,
  ): SendPaymentOptions | undefined {
    if (prepareResponse.paymentMethod.type === 'bolt11Invoice') {
      return { type: 'bolt11Invoice', preferSpark };
    }

    return undefined;
  }

  private summarizePrepareResponse(
    prepareResponse: PrepareSendPaymentResponse,
  ) {
    const method = prepareResponse.paymentMethod;

    return this.serializeForJson({
      amount: prepareResponse.amount,
      feePolicy: prepareResponse.feePolicy,
      paymentMethod: method,
    });
  }

  private extractPaymentRequest(payment: Payment): string | undefined {
    if (payment.details?.type === 'lightning') {
      return payment.details.invoice;
    }

    return undefined;
  }

  private extractPaymentHash(payment: Payment): string | undefined {
    if (
      (payment.details?.type === 'lightning' ||
        payment.details?.type === 'spark') &&
      payment.details.htlcDetails?.paymentHash
    ) {
      return payment.details.htlcDetails.paymentHash;
    }

    return undefined;
  }

  private extractDescription(payment: Payment): string | undefined {
    if (payment.details?.type === 'lightning') {
      return payment.details.description;
    }

    if (payment.details?.type === 'spark') {
      return payment.details.invoiceDetails?.description;
    }

    return undefined;
  }

  private mapPaymentStatus(status: PaymentStatus): LightningPaymentStatus {
    if (status === 'completed') {
      return LightningPaymentStatus.SUCCEEDED;
    }

    if (status === 'failed') {
      return LightningPaymentStatus.FAILED;
    }

    if (status === 'pending') {
      return LightningPaymentStatus.PENDING;
    }

    return LightningPaymentStatus.UNKNOWN;
  }

  private satsFromXp(xpEarned?: number): number | undefined {
    if (!xpEarned || xpEarned <= 0) {
      return undefined;
    }

    const satsPerXp = Number(
      this.configService.get<string>('REWARD_SATS_PER_XP') ?? 1,
    );
    return Math.max(Math.floor(xpEarned * satsPerXp), 1);
  }

  private async assertUserExists(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }
  }

  private async assertConversationAccess(
    userId: string,
    conversationId?: string,
  ): Promise<void> {
    if (!conversationId) {
      return;
    }

    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, userId },
      select: { id: true },
    });

    if (!conversation) {
      throw new BadRequestException('Conversation not found for user');
    }
  }

  private resolveNetwork(): Network {
    const network =
      this.configService.get<string>('BREEZ_NETWORK') || 'regtest';
    const validNetworks = new Set(['mainnet', 'testnet', 'signet', 'regtest']);

    if (!validNetworks.has(network)) {
      throw new Error(`Unsupported BREEZ_NETWORK: ${network}`);
    }

    return network as Network;
  }

  private parseBoolean(
    value: string | undefined,
    defaultValue: boolean,
  ): boolean {
    if (value === undefined) {
      return defaultValue;
    }

    return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
  }

  private serializeForJson(value: unknown): any {
    return JSON.parse(
      JSON.stringify(value, (_key, childValue) =>
        typeof childValue === 'bigint' ? childValue.toString() : childValue,
      ),
    );
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  //////////////////////
  // LIGHTNING ADDRESS (LUD-16)
  //////////////////////

  async registerLightningAddress(dto: RegisterLightningAddressDto) {
    await this.assertUserExists(dto.userId);

    // Check if username is already taken
    const existing = await this.prisma.user.findUnique({
      where: {
        lightningAddress: `${dto.username}@${this.lightningAddressDomain}`,
      },
    });

    if (existing) {
      throw new BadRequestException('Lightning address already taken');
    }

    // Get wallet public key if available
    let walletPublicKey: string | undefined;
    try {
      const sdk = await this.getSdk();
      const info = await sdk.getInfo({});
      walletPublicKey = (this.serializeForJson(info) as any).pubkey;
    } catch (error) {
      this.logger.warn(
        `Could not retrieve wallet public key: ${this.errorMessage(error)}`,
      );
    }

    const lightningAddress = `${dto.username}@${this.lightningAddressDomain}`;
    const user = await this.prisma.user.update({
      where: { id: dto.userId },
      data: {
        lightningAddress,
        walletPublicKey,
      },
    });

    this.logger.log(`Registered Lightning Address: ${lightningAddress}`);
    return this.serializeForJson({
      lightningAddress: user.lightningAddress,
      walletPublicKey: user.walletPublicKey,
    });
  }

  async getLightningAddressInfo(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        lightningAddress: true,
        walletPublicKey: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.lightningAddress) {
      throw new BadRequestException('No Lightning Address registered');
    }

    return this.serializeForJson(user);
  }

  async updateLightningAddress(
    userId: string,
    updates: { username?: string; description?: string },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { lightningAddress: true },
    });

    if (!user || !user.lightningAddress) {
      throw new BadRequestException('No Lightning Address to update');
    }

    if (updates.username) {
      const newAddress = `${updates.username}@${this.lightningAddressDomain}`;
      const existing = await this.prisma.user.findUnique({
        where: { lightningAddress: newAddress },
      });

      if (existing) {
        throw new BadRequestException('Lightning address already taken');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        lightningAddress: updates.username
          ? `${updates.username}@${this.lightningAddressDomain}`
          : undefined,
      },
    });

    return this.serializeForJson({
      lightningAddress: updated.lightningAddress,
    });
  }

  async revokeLightningAddress(userId: string) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { lightningAddress: null },
    });

    return this.serializeForJson({
      message: 'Lightning Address revoked',
      lightningAddress: updated.lightningAddress,
    });
  }

  //////////////////////
  // ANALYTICS & REPORTING
  //////////////////////

  async getAnalytics(dto: LightningAnalyticsQueryDto) {
    await this.assertUserExists(dto.userId);

    const startDate = dto.startDate
      ? new Date(dto.startDate)
      : new Date(new Date().setDate(new Date().getDate() - 30)); // Last 30 days
    const endDate = dto.endDate ? new Date(dto.endDate) : new Date();

    const analytics = await this.prisma.lightningAnalytics.findMany({
      where: {
        userId: dto.userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    return this.serializeForJson({
      period: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      data: analytics,
      summary: this.aggregateAnalytics(analytics),
    });
  }

  async getPaymentSummary(userId: string) {
    await this.assertUserExists(userId);

    const payments = await this.prisma.lightningPayment.findMany({
      where: { userId },
    });

    const incoming = payments.filter(
      (p) => p.direction === LightningPaymentDirection.INCOMING,
    );
    const outgoing = payments.filter(
      (p) => p.direction === LightningPaymentDirection.OUTGOING,
    );
    const succeeded = payments.filter(
      (p) => p.status === LightningPaymentStatus.SUCCEEDED,
    );

    const totalIncomingSats = incoming.reduce((sum, p) => {
      return sum + (p.amountSats ? BigInt(p.amountSats) : BigInt(0));
    }, BigInt(0));

    const totalOutgoingSats = outgoing.reduce((sum, p) => {
      return sum + (p.amountSats ? BigInt(p.amountSats) : BigInt(0));
    }, BigInt(0));

    const totalFeesSats = payments.reduce((sum, p) => {
      return sum + (p.feeSats ? BigInt(p.feeSats) : BigInt(0));
    }, BigInt(0));

    return this.serializeForJson({
      totalPayments: payments.length,
      succeededCount: succeeded.length,
      failedCount: payments.filter(
        (p) => p.status === LightningPaymentStatus.FAILED,
      ).length,
      pendingCount: payments.filter(
        (p) => p.status === LightningPaymentStatus.PENDING,
      ).length,
      incoming: {
        count: incoming.length,
        totalSats: totalIncomingSats.toString(),
      },
      outgoing: {
        count: outgoing.length,
        totalSats: totalOutgoingSats.toString(),
      },
      fees: {
        totalSats: totalFeesSats.toString(),
        averageSats:
          payments.length > 0
            ? (totalFeesSats / BigInt(payments.length)).toString()
            : '0',
      },
      successRate:
        payments.length > 0
          ? (
              (succeeded.length / payments.length) *
              100
            ).toFixed(2)
          : '0',
    });
  }

  async recordDailyAnalytics(userId: string) {
    await this.assertUserExists(userId);

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const startOfDay = new Date(`${today}T00:00:00Z`);
    const endOfDay = new Date(`${today}T23:59:59Z`);

    const payments = await this.prisma.lightningPayment.findMany({
      where: {
        userId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const incoming = payments.filter(
      (p) => p.direction === LightningPaymentDirection.INCOMING,
    );
    const outgoing = payments.filter(
      (p) => p.direction === LightningPaymentDirection.OUTGOING,
    );
    const succeeded = payments.filter(
      (p) => p.status === LightningPaymentStatus.SUCCEEDED,
    );
    const failed = payments.filter(
      (p) => p.status === LightningPaymentStatus.FAILED,
    );

    const incomingVolume = incoming.reduce((sum, p) => {
      return sum + (p.amountSats ? BigInt(p.amountSats) : BigInt(0));
    }, BigInt(0));

    const outgoingVolume = outgoing.reduce((sum, p) => {
      return sum + (p.amountSats ? BigInt(p.amountSats) : BigInt(0));
    }, BigInt(0));

    const incomingFees = incoming.reduce((sum, p) => {
      return sum + (p.feeSats ? BigInt(p.feeSats) : BigInt(0));
    }, BigInt(0));

    const outgoingFees = outgoing.reduce((sum, p) => {
      return sum + (p.feeSats ? BigInt(p.feeSats) : BigInt(0));
    }, BigInt(0));

    const successRate =
      payments.length > 0
        ? (succeeded.length / payments.length) * 100
        : 0;

    const upserted = await this.prisma.lightningAnalytics.upsert({
      where: {
        userId_date: {
          userId,
          date: new Date(today),
        },
      },
      create: {
        userId,
        date: new Date(today),
        incomingCount: incoming.length,
        incomingVolumeSats: incomingVolume,
        incomingFeeSats: incomingFees,
        outgoingCount: outgoing.length,
        outgoingVolumeSats: outgoingVolume,
        outgoingFeeSats: outgoingFees,
        failedCount: failed.length,
        successRate,
        averageFeeSats:
          payments.length > 0
            ? (incomingFees + outgoingFees) / BigInt(payments.length)
            : BigInt(0),
      },
      update: {
        incomingCount: incoming.length,
        incomingVolumeSats: incomingVolume,
        incomingFeeSats: incomingFees,
        outgoingCount: outgoing.length,
        outgoingVolumeSats: outgoingVolume,
        outgoingFeeSats: outgoingFees,
        failedCount: failed.length,
        successRate,
        averageFeeSats:
          payments.length > 0
            ? (incomingFees + outgoingFees) / BigInt(payments.length)
            : BigInt(0),
      },
    });

    return this.serializeForJson(upserted);
  }

  private aggregateAnalytics(
    analytics: Array<{
      incomingCount: number;
      incomingVolumeSats: bigint;
      incomingFeeSats: bigint;
      outgoingCount: number;
      outgoingVolumeSats: bigint;
      outgoingFeeSats: bigint;
      failedCount: number;
      successRate: number;
    }>,
  ) {
    if (analytics.length === 0) {
      return {
        totalIncomingCount: 0,
        totalIncomingVolumeSats: '0',
        totalOutgoingCount: 0,
        totalOutgoingVolumeSats: '0',
        totalFailures: 0,
        averageSuccessRate: '0',
      };
    }

    return {
      totalIncomingCount: analytics.reduce((sum, a) => sum + a.incomingCount, 0),
      totalIncomingVolumeSats: analytics
        .reduce((sum, a) => sum + a.incomingVolumeSats, BigInt(0))
        .toString(),
      totalOutgoingCount: analytics.reduce((sum, a) => sum + a.outgoingCount, 0),
      totalOutgoingVolumeSats: analytics
        .reduce((sum, a) => sum + a.outgoingVolumeSats, BigInt(0))
        .toString(),
      totalFailures: analytics.reduce((sum, a) => sum + a.failedCount, 0),
      averageSuccessRate: (
        analytics.reduce((sum, a) => sum + a.successRate, 0) /
        analytics.length
      ).toFixed(2),
    };
  }

  //////////////////////
  // BALANCE & WITHDRAWAL
  //////////////////////

  async getUserBalance(userId: string) {
    await this.assertUserExists(userId);
    return this.computeUserBalance(userId);
  }

  private async computeUserBalance(userId: string) {
    const rewardAgg = await this.prisma.reward.aggregate({
      where: { userId },
      _sum: { btcReward: true },
    });
    const totalEarnedSats = rewardAgg._sum.btcReward
      ? BigInt(Math.floor(rewardAgg._sum.btcReward))
      : BigInt(0);

    const withdrawalAgg = await this.prisma.withdrawal.aggregate({
      where: { userId, status: WithdrawalStatus.COMPLETED },
      _sum: { amountSats: true },
    });
    const totalWithdrawnSats = withdrawalAgg._sum.amountSats ?? BigInt(0);

    return {
      userId,
      totalEarnedSats: totalEarnedSats.toString(),
      totalWithdrawnSats: totalWithdrawnSats.toString(),
      availableBalance: (totalEarnedSats - totalWithdrawnSats).toString(),
    };
  }

  async withdraw(dto: WithdrawDto) {
    await this.assertUserExists(dto.userId);

    const balance = await this.computeUserBalance(dto.userId);
    if (BigInt(dto.amountSats) > BigInt(balance.availableBalance)) {
      throw new BadRequestException(
        `Insufficient balance. Available: ${balance.availableBalance} sats, Requested: ${dto.amountSats} sats`,
      );
    }

    const withdrawal = await this.prisma.withdrawal.create({
      data: {
        userId: dto.userId,
        amountSats: BigInt(dto.amountSats),
        lightningInvoice: dto.lightningInvoice,
        status: WithdrawalStatus.PROCESSING,
      },
    });

    try {
      const sendResult = await this.sendPayment({
        userId: dto.userId,
        paymentRequest: dto.lightningInvoice,
        amountSats: dto.amountSats,
        idempotencyKey: dto.idempotencyKey,
        conversationId: undefined,
        preferSpark: undefined,
        reason: 'Withdrawal',
      });

      const paymentId = (sendResult as any).payment?.id as string | undefined;
      const paymentHash = (sendResult as any).payment?.paymentHash as string | undefined;

      await this.prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: WithdrawalStatus.COMPLETED,
          paymentHash,
          lightningPaymentId: paymentId,
        },
      });

      await this.prisma.user.update({
        where: { id: dto.userId },
        data: {
          totalSatsWithdrawn: { increment: BigInt(dto.amountSats) },
        },
      });

      return this.serializeForJson({
        success: true,
        withdrawal: { ...withdrawal, status: WithdrawalStatus.COMPLETED },
        payment: sendResult,
      });
    } catch (error) {
      await this.prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: { status: WithdrawalStatus.FAILED },
      });
      throw error;
    }
  }

  async getUserWithdrawals(userId: string) {
    await this.assertUserExists(userId);
    const withdrawals = await this.prisma.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return this.serializeForJson(withdrawals);
  }
}
