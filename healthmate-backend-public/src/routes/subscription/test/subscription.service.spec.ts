/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionService } from '../subscription.service';
import { SubscriptionRepository } from '../subscription.repo';
import { NotFoundSubscriptionException } from '../subscription.error';
import { Types, DeleteResult } from 'mongoose';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let repo: jest.Mocked<SubscriptionRepository>;

  const mockSubscription = {
    _id: new Types.ObjectId(),
    name: 'Premium Plan',
    price: 100,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        {
          provide: SubscriptionRepository,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
    repo = module.get(SubscriptionRepository);
  });

  describe('findAll', () => {
    it('should call repository and return all subscriptions', async () => {
      const mockQuery = { page: 1, limit: 10 };
      const mockResult = {
        data: [mockSubscription],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      repo.findAll.mockResolvedValue(mockResult as any);

      const result = await service.findAll(mockQuery as any);

      expect(repo.findAll).toHaveBeenCalledWith(mockQuery);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findOne', () => {
    it('should return a subscription if found', async () => {
      repo.findOne.mockResolvedValue(mockSubscription as any);

      const result = await service.findOne(mockSubscription._id.toString());
      expect(result).toEqual(mockSubscription);
    });

    it('should throw NotFoundSubscriptionException if not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(
        service.findOne(mockSubscription._id.toString()),
      ).rejects.toThrow(NotFoundSubscriptionException);
    });
  });

  describe('create', () => {
    it('should create a new subscription', async () => {
      repo.create.mockResolvedValue(mockSubscription as any);

      const result = await service.create({
        name: 'Premium Plan',
        price: 100,
      } as any);

      expect(repo.create).toHaveBeenCalledWith({
        name: 'Premium Plan',
        price: 100,
      });
      expect(result).toEqual(mockSubscription);
    });
  });

  describe('update', () => {
    it('should update an existing subscription', async () => {
      repo.findOne.mockResolvedValue(mockSubscription as any);
      repo.update.mockResolvedValue({
        ...mockSubscription,
        name: 'Updated Plan',
      } as any);

      const result = await service.update(mockSubscription._id.toString(), {
        name: 'Updated Plan',
      } as any);

      expect(repo.update).toHaveBeenCalledWith(mockSubscription._id, {
        name: 'Updated Plan',
      });
      expect(result?.name).toBe('Updated Plan');
    });

    it('should throw if subscription does not exist before update', async () => {
      repo.findOne.mockResolvedValueOnce(null);

      await expect(
        service.update(mockSubscription._id.toString(), {
          name: 'Test',
        } as any),
      ).rejects.toThrow(NotFoundSubscriptionException);
    });

    it('should throw if subscription exists but findOne inside update returns null (edge case)', async () => {
      repo.findOne.mockResolvedValueOnce(null);

      await expect(
        service.update(mockSubscription._id.toString(), {
          name: 'Edge Case',
        } as any),
      ).rejects.toThrow(NotFoundSubscriptionException);
    });
  });

  describe('delete', () => {
    it('should delete an existing subscription', async () => {
      repo.findOne.mockResolvedValue(mockSubscription as any);
      const mockDeleteResult: DeleteResult = {
        acknowledged: true,
        deletedCount: 1,
      };
      repo.delete.mockResolvedValue(mockDeleteResult);

      const result = await service.delete(mockSubscription._id.toString());

      expect(repo.delete).toHaveBeenCalledWith(mockSubscription._id);
      expect(result).toEqual(mockDeleteResult);
    });

    it('should throw NotFoundSubscriptionException if subscription not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(
        service.delete(mockSubscription._id.toString()),
      ).rejects.toThrow(NotFoundSubscriptionException);
    });
  });
});
