const request = require('supertest');
const app = require('../server');
const Transaction = require('../models/Transaction');

describe('Payment Gateway API', () => {
  beforeAll(async () => {
    await Transaction.deleteMany({});
  });

  test('Process card payment', async () => {
    const res = await request(app)
      .post('/api/payments/process')
      .send({
        paymentMethod: 'card',
        amount: 100,
        currency: 'USD'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toMatch(/^stripe_/);
    expect(res.body.data.transactionId).toBeDefined();
  });

  test('Process crypto payment', async () => {
    const res = await request(app)
      .post('/api/payments/process')
      .send({
        paymentMethod: 'crypto',
        amount: 50,
        currency: 'USD',
        cryptoNetwork: 'ETH'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toMatch(/^crypto_/);
    expect(res.body.data.walletAddress).toBeDefined();
    expect(res.body.data.transactionId).toBeDefined();
  });

  test('Get crypto rates', async () => {
    const res = await request(app)
      .get('/api/payments/crypto/rates');

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.rates.BTC).toBeDefined();
    expect(res.body.rates.ETH).toBeDefined();
    expect(res.body.rates.USDT).toBeDefined();
  });
});