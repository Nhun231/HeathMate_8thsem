import { PaymentService } from '../payment.service';
import { PaymentRepo } from '../payment.repo';
import envConfig from 'src/shared/utils/config';
import { PREFIX_PAYMENT_CODE } from 'src/shared/constants/payment.constant';

jest.mock('../payment.repo');
jest.mock('src/shared/utils/config', () => ({
  __esModule: true,
  default: {
    SEPAY_BANK_ACCOUNT: '123456',
    SEPAY_BANK: 'TPBank',
  },
}));
jest.mock('src/shared/constants/payment.constant', () => ({
  PREFIX_PAYMENT_CODE: 'HM',
}));

describe('PaymentService', () => {
  let service: PaymentService;
  let paymentRepo: jest.Mocked<PaymentRepo>;

  beforeEach(() => {
    const mockPaymentTransactionModel: any = {};
    const mockOrderModel: any = {};
    const mockSubscriptionModel: any = {};
    const mockUserModel: any = {};
    const mockConnection: any = {};

    paymentRepo = new PaymentRepo(
      mockPaymentTransactionModel,
      mockOrderModel,
      mockSubscriptionModel,
      mockUserModel,
      mockConnection,
    ) as jest.Mocked<PaymentRepo>;

    paymentRepo.receiver = jest.fn();

    service = new PaymentService(paymentRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('receiver', () => {
    it('should return message from paymentRepo.receiver()', async () => {
      const body = { orderId: 'order123', amount: 1000 } as any;
      const mockResponse = { message: 'Payment received successfully' };

      paymentRepo.receiver = jest.fn().mockResolvedValue(mockResponse);

      const result = await service.receiver(body);

      expect(paymentRepo.receiver).toHaveBeenCalledWith(body);
      expect(result).toEqual({ message: 'Payment received successfully' });
    });
  });

  describe('generateQrCode', () => {
    it('should generate a valid QR code URL', () => {
      const body = { amount: 20000, orderId: 'order789' };

      const result = service.generateQrCode(body);

      const expectedUrl = `https://qr.sepay.vn/img?acc=${envConfig.SEPAY_BANK_ACCOUNT}&bank=${envConfig.SEPAY_BANK}&amount=${body.amount}&des=${PREFIX_PAYMENT_CODE}${body.orderId}`;

      expect(result).toEqual({ url: expectedUrl });
      expect(result.url).toContain(envConfig.SEPAY_BANK_ACCOUNT);
      expect(result.url).toContain(envConfig.SEPAY_BANK);
      expect(result.url).toContain(PREFIX_PAYMENT_CODE);
      expect(result.url).toContain(body.orderId);
    });
  });
});
