import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { LightningService } from './lightning.service';
import { CreateLightningInvoiceDto } from './dto/create-lightning-invoice.dto';
import { SendLightningPaymentDto } from './dto/send-lightning-payment.dto';
import { RegisterLightningAddressDto } from './dto/register-lightning-address.dto';
import { UpdateLightningAddressDto } from './dto/register-lightning-address.dto';
import { LightningAnalyticsQueryDto } from './dto/lightning-analytics-query.dto';
import {
  LightningPaymentDirection,
  LightningPaymentStatus,
} from 'generated/prisma/client';

@Controller('rewards')
export class RewardsController {
  constructor(
    private readonly rewardsService: RewardsService,
    private readonly lightningService: LightningService,
  ) {}

  @Get('lightning/status')
  getLightningStatus() {
    return this.lightningService.getStatus();
  }

  @Post('lightning/invoices')
  createLightningInvoice(@Body() dto: CreateLightningInvoiceDto) {
    return this.lightningService.createInvoice(dto);
  }

  @Post('lightning/send')
  sendLightningPayment(@Body() dto: SendLightningPaymentDto) {
    return this.lightningService.sendPayment(dto);
  }

  @Post('lightning/sync')
  syncLightningPayments() {
    return this.lightningService.syncPayments();
  }

  @Get('lightning/payments')
  listLightningPayments(
    @Query('userId') userId?: string,
    @Query('status') status?: LightningPaymentStatus,
    @Query('direction') direction?: LightningPaymentDirection,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.lightningService.listPayments({
      userId,
      status,
      direction,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Get('lightning/sdk-payments/:paymentId')
  getSdkPayment(@Param('paymentId') paymentId: string) {
    return this.lightningService.getSdkPayment(paymentId);
  }

  //////////////////////
  // LIGHTNING ADDRESS (LUD-16)
  //////////////////////

  @Post('lightning/address/register')
  registerLightningAddress(@Body() dto: RegisterLightningAddressDto) {
    return this.lightningService.registerLightningAddress(dto);
  }

  @Get('lightning/address/:userId')
  getLightningAddressInfo(@Param('userId') userId: string) {
    return this.lightningService.getLightningAddressInfo(userId);
  }

  @Post('lightning/address/:userId/update')
  updateLightningAddress(
    @Param('userId') userId: string,
    @Body() dto: UpdateLightningAddressDto,
  ) {
    return this.lightningService.updateLightningAddress(userId, {
      username: dto.username,
      description: dto.description,
    });
  }

  @Post('lightning/address/:userId/revoke')
  revokeLightningAddress(@Param('userId') userId: string) {
    return this.lightningService.revokeLightningAddress(userId);
  }

  //////////////////////
  // ANALYTICS & REPORTING
  //////////////////////

  @Post('lightning/analytics/query')
  getAnalytics(@Body() dto: LightningAnalyticsQueryDto) {
    return this.lightningService.getAnalytics(dto);
  }

  @Get('lightning/analytics/summary/:userId')
  getPaymentSummary(@Param('userId') userId: string) {
    return this.lightningService.getPaymentSummary(userId);
  }

  @Post('lightning/analytics/record-daily/:userId')
  recordDailyAnalytics(@Param('userId') userId: string) {
    return this.lightningService.recordDailyAnalytics(userId);
  }
}
