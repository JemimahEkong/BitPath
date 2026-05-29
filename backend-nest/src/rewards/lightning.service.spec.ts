import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { LightningService } from './lightning.service';
import { PrismaService } from 'src/database/database.service';
import {
  LightningPaymentDirection,
  LightningPaymentStatus,
} from 'generated/prisma/client';

describe('LightningService', () => {
  let service: LightningService;
  let prisma: PrismaService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
    getOrThrow: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    lightningPayment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    conversation: {
      findFirst: jest.fn(),
    },
    lightningAnalytics: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockConfigService.get.mockImplementation((key: string) => {
      const defaults: Record<string, string | undefined> = {
        BREEZ_NETWORK: 'regtest',
        BREEZ_STORAGE_DIR: '/tmp/.breez-spark',
        LIGHTNING_ADDRESS_DOMAIN: 'bitpath.com',
        REWARD_SATS_PER_XP: '1',
      };
      return defaults[key];
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LightningService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<LightningService>(LightningService);
    prisma = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('isConfigured', () => {
    it('should return false when no mnemonic is set', () => {
      mockConfigService.get.mockReturnValue(undefined);
      expect(service.isConfigured()).toBe(false);
    });

    it('should return true when mnemonic is set and network is regtest', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'BREEZ_MNEMONIC') return 'test mnemonic';
        if (key === 'BREEZ_NETWORK') return 'regtest';
        return undefined;
      });

      const freshService = new LightningService(
        mockPrismaService as any,
        mockConfigService as any,
      );
      expect(freshService.isConfigured()).toBe(true);
    });

    it('should require API key for non-regtest networks', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'BREEZ_MNEMONIC') return 'test mnemonic';
        if (key === 'BREEZ_NETWORK') return 'testnet';
        if (key === 'BREEZ_API_KEY') return 'test-api-key';
        return undefined;
      });

      const freshService = new LightningService(
        mockPrismaService as any,
        mockConfigService as any,
      );
      expect(freshService.isConfigured()).toBe(true);
    });
  });

  describe('Lightning Address (LUD-16)', () => {
    const userId = 'user-123';

    describe('registerLightningAddress', () => {
      it('should register a new lightning address', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue({ id: userId });
        mockPrismaService.user.update.mockResolvedValue({
          id: userId,
          lightningAddress: 'alice@bitpath.com',
          walletPublicKey: 'pk_test',
        });

        const result = await service.registerLightningAddress({
          userId,
          username: 'alice',
        });

        expect(result.lightningAddress).toBe('alice@bitpath.com');
        expect(
          mockPrismaService.user.findUnique,
        ).toHaveBeenCalledWith({
          where: { id: userId },
          select: { id: true },
        });
      });

      it('should reject duplicate lightning addresses', async () => {
        mockPrismaService.user.findUnique
          .mockResolvedValueOnce({ id: userId })
          .mockResolvedValueOnce({ id: 'other-user' }); // Already taken

        await expect(
          service.registerLightningAddress({
            userId,
            username: 'alice',
          }),
        ).rejects.toThrow('Lightning address already taken');
      });

      it('should reject non-existent users', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(null);

        await expect(
          service.registerLightningAddress({
            userId,
            username: 'alice',
          }),
        ).rejects.toThrow('User not found');
      });
    });

    describe('getLightningAddressInfo', () => {
      it('should retrieve lightning address info', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue({
          id: userId,
          lightningAddress: 'alice@bitpath.com',
          walletPublicKey: 'pk_test',
        });

        const result = await service.getLightningAddressInfo(userId);

        expect(result.lightningAddress).toBe('alice@bitpath.com');
        expect(result.walletPublicKey).toBe('pk_test');
      });

      it('should throw when user has no lightning address', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue({
          id: userId,
          lightningAddress: null,
          walletPublicKey: null,
        });

        await expect(
          service.getLightningAddressInfo(userId),
        ).rejects.toThrow('No Lightning Address registered');
      });
    });

    describe('revokeLightningAddress', () => {
      it('should revoke a lightning address', async () => {
        mockPrismaService.user.update.mockResolvedValue({
          id: userId,
          lightningAddress: null,
        });

        const result = await service.revokeLightningAddress(userId);

        expect(result.lightningAddress).toBeNull();
        expect(mockPrismaService.user.update).toHaveBeenCalledWith({
          where: { id: userId },
          data: { lightningAddress: null },
        });
      });
    });
  });

  describe('Analytics & Reporting', () => {
    const userId = 'user-123';

    describe('getPaymentSummary', () => {
      it('should calculate payment summary', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue({ id: userId });
        mockPrismaService.lightningPayment.findMany.mockResolvedValue([
          {
            direction: LightningPaymentDirection.INCOMING,
            status: LightningPaymentStatus.SUCCEEDED,
            amountSats: BigInt(1000),
            feeSats: BigInt(10),
          },
          {
            direction: LightningPaymentDirection.OUTGOING,
            status: LightningPaymentStatus.SUCCEEDED,
            amountSats: BigInt(500),
            feeSats: BigInt(5),
          },
          {
            direction: LightningPaymentDirection.INCOMING,
            status: LightningPaymentStatus.FAILED,
            amountSats: BigInt(100),
            feeSats: BigInt(0),
          },
        ]);

        const result = await service.getPaymentSummary(userId);

        expect(result.totalPayments).toBe(3);
        expect(result.succeededCount).toBe(2);
        expect(result.failedCount).toBe(1);
        expect(result.incoming.count).toBe(2);
        expect(result.outgoing.count).toBe(1);
        expect(result.incoming.totalSats).toBe('1100');
        expect(result.outgoing.totalSats).toBe('500');
        expect(result.fees.totalSats).toBe('15');
      });

      it('should handle zero payments', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue({ id: userId });
        mockPrismaService.lightningPayment.findMany.mockResolvedValue([]);

        const result = await service.getPaymentSummary(userId);

        expect(result.totalPayments).toBe(0);
        expect(result.succeededCount).toBe(0);
        expect(result.incoming.totalSats).toBe('0');
        expect(result.successRate).toBe('0');
      });
    });

    describe('getAnalytics', () => {
      it('should retrieve analytics for date range', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue({ id: userId });
        mockPrismaService.lightningAnalytics.findMany.mockResolvedValue([
          {
            date: new Date('2026-05-20'),
            incomingCount: 5,
            incomingVolumeSats: BigInt(5000),
            incomingFeeSats: BigInt(50),
            outgoingCount: 2,
            outgoingVolumeSats: BigInt(2000),
            outgoingFeeSats: BigInt(20),
            failedCount: 1,
            successRate: 85.7,
          },
        ]);

        const result = await service.getAnalytics({
          userId,
          startDate: '2026-05-20',
          endDate: '2026-05-26',
        });

        expect(result.data).toHaveLength(1);
        expect(result.summary.totalIncomingCount).toBe(5);
        expect(result.summary.totalOutgoingCount).toBe(2);
      });
    });

    describe('recordDailyAnalytics', () => {
      it('should upsert daily analytics', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue({ id: userId });
        mockPrismaService.lightningPayment.findMany.mockResolvedValue([
          {
            direction: LightningPaymentDirection.INCOMING,
            status: LightningPaymentStatus.SUCCEEDED,
            amountSats: BigInt(1000),
            feeSats: BigInt(10),
          },
          {
            direction: LightningPaymentDirection.INCOMING,
            status: LightningPaymentStatus.FAILED,
            amountSats: BigInt(500),
            feeSats: BigInt(0),
          },
        ]);
        mockPrismaService.lightningAnalytics.upsert.mockResolvedValue({
          userId,
          incomingCount: 2,
          incomingVolumeSats: BigInt(1500),
        });

        const result = await service.recordDailyAnalytics(userId);

        expect(mockPrismaService.lightningAnalytics.upsert).toHaveBeenCalled();
        expect(result.incomingCount).toBe(2);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.getPaymentSummary('non-existent-user'),
      ).rejects.toThrow('User not found');
    });

    it('should handle missing conversation', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-123',
      });
      mockPrismaService.conversation.findFirst.mockResolvedValue(null);

      // This would be tested in createInvoice/sendPayment
      // Testing assertion methods
      await expect(
        (service as any).assertConversationAccess('user-123', 'non-existent'),
      ).rejects.toThrow('Conversation not found for user');
    });
  });
});
