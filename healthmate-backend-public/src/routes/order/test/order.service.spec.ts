import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from '../order.service';
import { OrderRepo } from '../order.repo';
import { Types } from 'mongoose';
import { QueryType } from 'src/shared/schemas/request/request.schema';
import { CreateOrderBodyType } from '../schema/request/order.request.schema';
import { NotFoundOrderException } from '../order.error';

describe('OrderService', () => {
  let service: OrderService;
  let repo: jest.Mocked<OrderRepo>;

  const mockOrder = {
    _id: new Types.ObjectId(),
    userId: new Types.ObjectId(),
    total: 500,
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: OrderRepo,
          useValue: {
            findAll: jest.fn(),
            detail: jest.fn(),
            create: jest.fn(),
            cancel: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    repo = module.get(OrderRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should call orderRepository.findAll and return result', async () => {
      const query = { page: 1 } as QueryType;
      const expected = [{ id: 1 }];
      repo.findAll.mockResolvedValue(expected as any);

      const result = await service.list(query);

      expect(repo.findAll).toHaveBeenCalledWith(query);
      expect(result).toBe(expected);
    });
  });

  describe('detail', () => {
    it('should return order if found', async () => {
      repo.detail.mockResolvedValue(mockOrder);

      const result = await service.detail(
        mockOrder.userId.toString(),
        mockOrder._id.toString(),
      );

      expect(repo.detail).toHaveBeenCalledWith(
        expect.any(Types.ObjectId),
        expect.any(Types.ObjectId),
      );
      expect(result).toBe(mockOrder);
    });

    it('should throw NotFoundOrderException if order not found', async () => {
      (repo.detail as jest.Mock).mockResolvedValue(null as any);

      await expect(
        service.detail(mockOrder.userId.toString(), mockOrder._id.toString()),
      ).rejects.toBe(NotFoundOrderException);

      expect(repo.detail).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should call orderRepository.create with correct args', async () => {
      const userId = new Types.ObjectId().toString();
      const orderData = {
        item: 'Laptop',
        quantity: 2,
      } as unknown as CreateOrderBodyType;
      const expected = { _id: new Types.ObjectId(), ...orderData };

      repo.create.mockResolvedValue(expected as any);

      const result = await service.create(userId, orderData);

      expect(repo.create).toHaveBeenCalledWith(
        expect.any(Types.ObjectId),
        orderData,
      );
      expect(result).toBe(expected);
    });
  });

  describe('cancel', () => {
    it('should cancel order if it exists', async () => {
      repo.detail.mockResolvedValue(mockOrder);
      const expected = { acknowledged: true };
      repo.cancel.mockResolvedValue(expected as any);

      const result = await service.cancel(
        mockOrder.userId.toString(),
        mockOrder._id.toString(),
      );

      expect(repo.detail).toHaveBeenCalledWith(
        expect.any(Types.ObjectId),
        expect.any(Types.ObjectId),
      );
      expect(repo.cancel).toHaveBeenCalledWith(
        expect.any(Types.ObjectId),
        mockOrder._id,
      );
      expect(result).toBe(expected);
    });

    it('should throw NotFoundOrderException if order not found', async () => {
      (repo.detail as jest.Mock).mockResolvedValue(null as any);

      await expect(
        service.cancel(mockOrder.userId.toString(), mockOrder._id.toString()),
      ).rejects.toBe(NotFoundOrderException);

      expect(repo.detail).toHaveBeenCalledTimes(1);
      expect(repo.cancel).not.toHaveBeenCalled();
    });
  });
});
