import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { RewardsController } from './rewards.controller';
import { RewardsService } from './rewards.service';
import { LightningService } from './lightning.service';
import { PrismaService } from 'src/database/database.service';
import { ConfigService } from '@nestjs/config';

describe('Rewards Controller (e2e)', () => {
  let app: INestApplication;
  let lightningService: LightningService;
  let prisma: PrismaService;

  const mockLightningService = {
    getStatus: jest.fn(),
    createInvoice: jest.fn(),
    sendPayment: jest.fn(),
    syncPayments: jest.fn(),
    listPayments: jest.fn(),
    getSdkPayment: jest.fn(),
    registerLightningAddress: jest.fn(),
    getLightningAddressInfo: jest.fn(),
    updateLightningAddress: jest.fn(),
    revokeLightningAddress: jest.fn(),
    getAnalytics: jest.fn(),
    getPaymentSummary: jest.fn(),
    recordDailyAnalytics: jest.fn(),
  };

  const mockPrismaService = {};
  const mockConfigService = {};
  const mockRewardsService = {};

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [RewardsController],
      providers: [
        { provide: LightningService, useValue: mockLightningService },
        { provide: RewardsService, useValue: mockRewardsService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    lightningService = moduleFixture.get<LightningService>(LightningService);
    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Lightning Status', () => {
    it('GET /rewards/lightning/status', async () => {
      mockLightningService.getStatus.mockResolvedValue({
        configured: true,
        connected: true,
        network: 'testnet',
        balanceSats: '50000',
      });

      const response = await request(app.getHttpServer())
        .get('/rewards/lightning/status')
        .expect(200);

      expect(response.body.configured).toBe(true);
      expect(response.body.balanceSats).toBe('50000');
    });
  });

  describe('Lightning Address (LUD-16)', () => {
    it('POST /rewards/lightning/address/register', async () => {
      mockLightningService.registerLightningAddress.mockResolvedValue({
        lightningAddress: 'alice@bitpath.com',
        walletPublicKey: 'pk_test',
      });

      const response = await request(app.getHttpServer())
        .post('/rewards/lightning/address/register')
        .send({
          userId: 'user-123',
          username: 'alice',
        })
        .expect(201);

      expect(response.body.lightningAddress).toBe('alice@bitpath.com');
    });

    it('GET /rewards/lightning/address/:userId', async () => {
      mockLightningService.getLightningAddressInfo.mockResolvedValue({
        id: 'user-123',
        lightningAddress: 'alice@bitpath.com',
        walletPublicKey: 'pk_test',
      });

      const response = await request(app.getHttpServer())
        .get('/rewards/lightning/address/user-123')
        .expect(200);

      expect(response.body.lightningAddress).toBe('alice@bitpath.com');
    });

    it('POST /rewards/lightning/address/:userId/update', async () => {
      mockLightningService.updateLightningAddress.mockResolvedValue({
        lightningAddress: 'bob@bitpath.com',
      });

      const response = await request(app.getHttpServer())
        .post('/rewards/lightning/address/user-123/update')
        .send({
          username: 'bob',
        })
        .expect(201);

      expect(response.body.lightningAddress).toBe('bob@bitpath.com');
    });

    it('POST /rewards/lightning/address/:userId/revoke', async () => {
      mockLightningService.revokeLightningAddress.mockResolvedValue({
        message: 'Lightning Address revoked',
        lightningAddress: null,
      });

      const response = await request(app.getHttpServer())
        .post('/rewards/lightning/address/user-123/revoke')
        .expect(201);

      expect(response.body.lightningAddress).toBeNull();
    });
  });

  describe('Analytics & Reporting', () => {
    it('POST /rewards/lightning/analytics/query', async () => {
      mockLightningService.getAnalytics.mockResolvedValue({
        period: {
          startDate: '2026-05-20',
          endDate: '2026-05-26',
        },
        data: [
          {
            date: '2026-05-20',
            incomingCount: 5,
            incomingVolumeSats: '5000',
          },
        ],
        summary: {
          totalIncomingCount: 5,
          totalIncomingVolumeSats: '5000',
          averageSuccessRate: '95.00',
        },
      });

      const response = await request(app.getHttpServer())
        .post('/rewards/lightning/analytics/query')
        .send({
          userId: 'user-123',
          startDate: '2026-05-20',
          endDate: '2026-05-26',
        })
        .expect(201);

      expect(response.body.summary.totalIncomingCount).toBe(5);
    });

    it('GET /rewards/lightning/analytics/summary/:userId', async () => {
      mockLightningService.getPaymentSummary.mockResolvedValue({
        totalPayments: 10,
        succeededCount: 9,
        failedCount: 1,
        incoming: {
          count: 6,
          totalSats: '6000',
        },
        outgoing: {
          count: 4,
          totalSats: '4000',
        },
        successRate: '90.00',
      });

      const response = await request(app.getHttpServer())
        .get('/rewards/lightning/analytics/summary/user-123')
        .expect(200);

      expect(response.body.totalPayments).toBe(10);
      expect(response.body.successRate).toBe('90.00');
    });

    it('POST /rewards/lightning/analytics/record-daily/:userId', async () => {
      mockLightningService.recordDailyAnalytics.mockResolvedValue({
        userId: 'user-123',
        date: '2026-05-26',
        incomingCount: 3,
        incomingVolumeSats: '3000',
        successRate: 100,
      });

      const response = await request(app.getHttpServer())
        .post('/rewards/lightning/analytics/record-daily/user-123')
        .expect(201);

      expect(response.body.incomingCount).toBe(3);
      expect(response.body.successRate).toBe(100);
    });
  });

  describe('Payment Operations', () => {
    it('POST /rewards/lightning/invoices', async () => {
      mockLightningService.createInvoice.mockResolvedValue({
        id: 'payment-123',
        paymentRequest: 'lnbc1000n1p...',
        amountSats: '1000',
      });

      const response = await request(app.getHttpServer())
        .post('/rewards/lightning/invoices')
        .send({
          userId: 'user-123',
          amountSats: 1000,
          description: 'Quiz reward',
        })
        .expect(201);

      expect(response.body.paymentRequest).toBeDefined();
    });

    it('GET /rewards/lightning/payments', async () => {
      mockLightningService.listPayments.mockResolvedValue([
        {
          id: 'payment-1',
          userId: 'user-123',
          amountSats: '1000',
          status: 'SUCCEEDED',
        },
        {
          id: 'payment-2',
          userId: 'user-123',
          amountSats: '500',
          status: 'PENDING',
        },
      ]);

      const response = await request(app.getHttpServer())
        .get('/rewards/lightning/payments')
        .query({ userId: 'user-123' })
        .expect(200);

      expect(response.body).toHaveLength(2);
    });
  });
});
