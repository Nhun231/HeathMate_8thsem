import { Test, TestingModule } from '@nestjs/testing';
import { DishController } from './dish.controller';
import { DishService } from './dish.service';
import { DishDocument } from './schema/dish.schema';
import { Rolename } from '../../shared/constants/role.constant';
import { Types } from 'mongoose';
import {
  SAMPLE_USER_IDS,
  ADMIN_USER_ID,
  SAMPLE_DISHES,
  createMockPaginatedResult,
  createMockDishData,
  createMockDishUpdateData,
} from './mock-data';

describe('DishController', () => {
  let controller: DishController;
  let service: DishService;

  const mockPaginatedResult = createMockPaginatedResult([SAMPLE_DISHES.CHICKEN_RICE]);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DishController],
      providers: [
        {
          provide: DishService,
          useValue: {
            findAllPaginate: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DishController>(DishController);
    service = module.get<DishService>(DishService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllDish', () => {
    it('should return paginated dishes for admin', async () => {
      jest.spyOn(service, 'findAllPaginate').mockResolvedValue(mockPaginatedResult as any);

      const result = await controller.findAllDish(
        { page: 1, limit: 10 },
        ADMIN_USER_ID,
        Rolename.Admin
      );

      expect(service.findAllPaginate).toHaveBeenCalledWith(
        { page: 1, limit: 10 },
        ADMIN_USER_ID,
        Rolename.Admin
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should return paginated dishes for customer', async () => {
      jest.spyOn(service, 'findAllPaginate').mockResolvedValue(mockPaginatedResult as any);

      const result = await controller.findAllDish(
        { page: 1, limit: 10 },
        SAMPLE_USER_IDS[0],
        Rolename.Customer
      );

      expect(service.findAllPaginate).toHaveBeenCalledWith(
        { page: 1, limit: 10 },
        SAMPLE_USER_IDS[0],
        Rolename.Customer
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should return paginated dishes with type filter', async () => {
      jest.spyOn(service, 'findAllPaginate').mockResolvedValue(mockPaginatedResult as any);

      const result = await controller.findAllDish(
        { page: 1, limit: 10, type: 'main' },
        SAMPLE_USER_IDS[0],
        Rolename.Customer
      );

      expect(service.findAllPaginate).toHaveBeenCalledWith(
        { page: 1, limit: 10, type: 'main' },
        SAMPLE_USER_IDS[0],
        Rolename.Customer
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should return paginated dishes when userId is undefined', async () => {
      jest.spyOn(service, 'findAllPaginate').mockResolvedValue(mockPaginatedResult as any);

      const result = await controller.findAllDish(
        { page: 1, limit: 10 },
        undefined,
        undefined
      );

      expect(service.findAllPaginate).toHaveBeenCalledWith(
        { page: 1, limit: 10 },
        undefined,
        undefined
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should return paginated dishes when only userId is provided', async () => {
      jest.spyOn(service, 'findAllPaginate').mockResolvedValue(mockPaginatedResult as any);

      const result = await controller.findAllDish(
        { page: 1, limit: 10 },
        SAMPLE_USER_IDS[0],
        undefined
      );

      expect(service.findAllPaginate).toHaveBeenCalledWith(
        { page: 1, limit: 10 },
        SAMPLE_USER_IDS[0],
        undefined
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should return paginated dishes when only roleName is provided', async () => {
      jest.spyOn(service, 'findAllPaginate').mockResolvedValue(mockPaginatedResult as any);

      const result = await controller.findAllDish(
        { page: 1, limit: 10 },
        undefined,
        Rolename.Admin
      );

      expect(service.findAllPaginate).toHaveBeenCalledWith(
        { page: 1, limit: 10 },
        undefined,
        Rolename.Admin
      );
      expect(result).toEqual(mockPaginatedResult);
    });
  });

  describe('findDishById', () => {
    it('should return dish by id for admin', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(SAMPLE_DISHES.CHICKEN_RICE as DishDocument);

      const result = await controller.findDishById(
        { dishId: '507f1f77bcf86cd799439031' },
        ADMIN_USER_ID,
        Rolename.Admin
      );

      expect(service.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439031',
        ADMIN_USER_ID,
        Rolename.Admin
      );
      expect(result).toEqual(SAMPLE_DISHES.CHICKEN_RICE);
    });

    it('should return dish by id for customer', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(SAMPLE_DISHES.CUSTOM_DISH as DishDocument);

      const result = await controller.findDishById(
        { dishId: '507f1f77bcf86cd799439032' },
        SAMPLE_USER_IDS[0],
        Rolename.Customer
      );

      expect(service.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439032',
        SAMPLE_USER_IDS[0],
        Rolename.Customer
      );
      expect(result).toEqual(SAMPLE_DISHES.CUSTOM_DISH);
    });
  });

  describe('createDish', () => {
    it('should create new dish for admin', async () => {
      const createDto = createMockDishData({
        name: 'Admin Special Dish',
        type: 'main',
      });

      jest.spyOn(service, 'create').mockResolvedValue(SAMPLE_DISHES.ADMIN_DISH as DishDocument);

      const result = await controller.createDish(
        createDto,
        ADMIN_USER_ID,
        Rolename.Admin
      );

      expect(service.create).toHaveBeenCalledWith(createDto, ADMIN_USER_ID, Rolename.Admin);
      expect(result).toEqual(SAMPLE_DISHES.ADMIN_DISH);
    });

    it('should create new dish for customer', async () => {
      const createDto = createMockDishData({
        name: 'My Custom Dish',
        type: 'appetizer',
      });

      jest.spyOn(service, 'create').mockResolvedValue(SAMPLE_DISHES.CUSTOM_DISH as DishDocument);

      const result = await controller.createDish(
        createDto,
        SAMPLE_USER_IDS[0],
        Rolename.Customer
      );

      expect(service.create).toHaveBeenCalledWith(createDto, SAMPLE_USER_IDS[0], Rolename.Customer);
      expect(result).toEqual(SAMPLE_DISHES.CUSTOM_DISH);
    });
  });

  describe('updateDish', () => {
    it('should update dish for admin', async () => {
      const updateDto = createMockDishUpdateData({
        name: 'Updated Admin Dish',
      });

      const updatedDish = { ...SAMPLE_DISHES.ADMIN_DISH, ...updateDto };

      jest.spyOn(service, 'update').mockResolvedValue(updatedDish as DishDocument);

      const result = await controller.updateDish(
        { dishId: '507f1f77bcf86cd799439033' },
        updateDto,
        ADMIN_USER_ID,
        Rolename.Admin
      );

      expect(service.update).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439033',
        updateDto,
        ADMIN_USER_ID,
        Rolename.Admin
      );
      expect(result).toEqual(updatedDish);
    });

    it('should update dish for customer', async () => {
      const updateDto = createMockDishUpdateData({
        name: 'Updated Custom Dish',
      });

      const updatedDish = { ...SAMPLE_DISHES.CUSTOM_DISH, ...updateDto };

      jest.spyOn(service, 'update').mockResolvedValue(updatedDish as DishDocument);

      const result = await controller.updateDish(
        { dishId: '507f1f77bcf86cd799439032' },
        updateDto,
        SAMPLE_USER_IDS[0],
        Rolename.Customer
      );

      expect(service.update).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439032',
        updateDto,
        SAMPLE_USER_IDS[0],
        Rolename.Customer
      );
      expect(result).toEqual(updatedDish);
    });
  });

  describe('deleteDish', () => {
    it('should delete dish for admin', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue(undefined);

      const result = await controller.deleteDish(
        { dishId: '507f1f77bcf86cd799439033' },
        ADMIN_USER_ID,
        Rolename.Admin
      );

      expect(service.delete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439033',
        ADMIN_USER_ID,
        Rolename.Admin
      );
      expect(result).toBeUndefined();
    });

    it('should delete dish for customer', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue(undefined);

      const result = await controller.deleteDish(
        { dishId: '507f1f77bcf86cd799439032' },
        SAMPLE_USER_IDS[0],
        Rolename.Customer
      );

      expect(service.delete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439032',
        SAMPLE_USER_IDS[0],
        Rolename.Customer
      );
      expect(result).toBeUndefined();
    });
  });
});
