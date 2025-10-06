import { Test, TestingModule } from '@nestjs/testing';
import { IngredientController } from './ingredient.controller';
import { IngredientService } from './ingredient.service';
import { IngredientDocument } from './schema/ingredient.schema';
import { Rolename } from '../../shared/constants/role.constant';
import { Types } from 'mongoose';
import { 
  createMockIngredient, 
  createMockPaginatedResult, 
  SAMPLE_USER_IDS,
  ADMIN_USER_ID
} from './mock-data';

describe('IngredientController', () => {
  let controller: IngredientController;
  let service: IngredientService;

  // Use realistic mock data
  const mockIngredient = createMockIngredient({ type: 'meat' });
  const mockPaginatedResult = createMockPaginatedResult([mockIngredient]);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngredientController],
      providers: [
        {
          provide: IngredientService,
          useValue: {
            importFromExcel: jest.fn(),
            findAllPaginate: jest.fn(),
            findUserCustomIngredients: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<IngredientController>(IngredientController);
    service = module.get<IngredientService>(IngredientService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('importIngredients', () => {
    it('should import ingredients from Excel', async () => {
      const mockResult = { success: true, imported: 5 };

      jest.spyOn(service, 'importFromExcel').mockResolvedValue(mockResult as any);

      const result = await controller.importIngredients();

      expect(service.importFromExcel).toHaveBeenCalledWith();
      expect(result).toEqual(mockResult);
    });
  });

  describe('getMyIngredients', () => {
    it('should return user custom ingredients', async () => {
      jest.spyOn(service, 'findUserCustomIngredients').mockResolvedValue(mockPaginatedResult as any);

      const result = await controller.getMyIngredients(
        { page: 1, limit: 10, search: 'test' },
        SAMPLE_USER_IDS[0]
      );

      expect(service.findUserCustomIngredients).toHaveBeenCalledWith(
        { page: 1, limit: 10, search: 'test' },
        SAMPLE_USER_IDS[0]
      );
      expect(result).toEqual(mockPaginatedResult);
    });
  });

  describe('findAllIngredient', () => {
    it('should return all ingredients with pagination for admin', async () => {
      jest.spyOn(service, 'findAllPaginate').mockResolvedValue(mockPaginatedResult as any);

      const result = await controller.findAllIngredient(
        { page: 1, limit: 10, type: 'meat', search: 'chicken' },
        ADMIN_USER_ID,
        Rolename.Admin
      );

      expect(service.findAllPaginate).toHaveBeenCalledWith(
        { page: 1, limit: 10, type: 'meat', search: 'chicken' },
        ADMIN_USER_ID,
        Rolename.Admin
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should return all ingredients with pagination for customer', async () => {
      jest.spyOn(service, 'findAllPaginate').mockResolvedValue(mockPaginatedResult as any);

      const result = await controller.findAllIngredient(
        { page: 1, limit: 10, type: 'vegetable', search: 'broccoli' },
        SAMPLE_USER_IDS[0],
        Rolename.Customer
      );

      expect(service.findAllPaginate).toHaveBeenCalledWith(
        { page: 1, limit: 10, type: 'vegetable', search: 'broccoli' },
        SAMPLE_USER_IDS[0],
        Rolename.Customer
      );
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should return all ingredients with pagination when userId is undefined', async () => {
      jest.spyOn(service, 'findAllPaginate').mockResolvedValue(mockPaginatedResult as any);

      const result = await controller.findAllIngredient(
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

    it('should return all ingredients with pagination when only userId is provided', async () => {
      jest.spyOn(service, 'findAllPaginate').mockResolvedValue(mockPaginatedResult as any);

      const result = await controller.findAllIngredient(
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

    it('should return all ingredients with pagination when only roleName is provided', async () => {
      jest.spyOn(service, 'findAllPaginate').mockResolvedValue(mockPaginatedResult as any);

      const result = await controller.findAllIngredient(
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

  describe('createIngredient', () => {
    it('should create new ingredient for customer', async () => {
      const createDto = {
        name: 'New Ingredient',
        type: 'vegetable',
        caloPer100g: 50,
        carbsPer100g: 5,
        proteinPer100g: 10,
        fatPer100g: 2,
        fiberPer100g: 3,
        sugarPer100g: 2,
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockIngredient as IngredientDocument);

      const result = await controller.createIngredient(
        createDto,
        SAMPLE_USER_IDS[0],
        Rolename.Customer
      );

      expect(service.create).toHaveBeenCalledWith(createDto, SAMPLE_USER_IDS[0], Rolename.Customer);
      expect(result).toEqual(mockIngredient);
    });

    it('should create new ingredient for admin', async () => {
      const createDto = {
        name: 'New Public Ingredient',
        type: 'meat',
        caloPer100g: 200,
        carbsPer100g: 0,
        proteinPer100g: 25,
        fatPer100g: 10,
        fiberPer100g: 0,
        sugarPer100g: 0,
        isPublic: true,
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockIngredient as IngredientDocument);

      const result = await controller.createIngredient(
        createDto,
        ADMIN_USER_ID,
        Rolename.Admin
      );

      expect(service.create).toHaveBeenCalledWith(createDto, ADMIN_USER_ID, Rolename.Admin);
      expect(result).toEqual(mockIngredient);
    });
  });

  describe('updateIngredient', () => {
    it('should update ingredient for admin', async () => {
      const updateDto = { name: 'Updated Ingredient' };
      const updatedIngredient = { ...mockIngredient, ...updateDto };

      jest.spyOn(service, 'update').mockResolvedValue(updatedIngredient as IngredientDocument);

      const result = await controller.updateIngredient(
        { ingredientId: '507f1f77bcf86cd799439014' },
        updateDto,
        ADMIN_USER_ID,
        Rolename.Admin
      );

      expect(service.update).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439014',
        updateDto,
        ADMIN_USER_ID,
        Rolename.Admin
      );
      expect(result).toEqual(updatedIngredient);
    });

    it('should update ingredient for customer', async () => {
      const updateDto = { name: 'Updated Custom Ingredient', caloPer100g: 75 };
      const updatedIngredient = { ...mockIngredient, ...updateDto };

      jest.spyOn(service, 'update').mockResolvedValue(updatedIngredient as IngredientDocument);

      const result = await controller.updateIngredient(
        { ingredientId: '507f1f77bcf86cd799439015' },
        updateDto,
        SAMPLE_USER_IDS[0],
        Rolename.Customer
      );

      expect(service.update).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439015',
        updateDto,
        SAMPLE_USER_IDS[0],
        Rolename.Customer
      );
      expect(result).toEqual(updatedIngredient);
    });
  });

  describe('deleteIngredient', () => {
    it('should delete ingredient for admin', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue(undefined);

      const result = await controller.deleteIngredient(
        { ingredientId: '507f1f77bcf86cd799439014' },
        ADMIN_USER_ID,
        Rolename.Admin
      );

      expect(service.delete).toHaveBeenCalledWith('507f1f77bcf86cd799439014', ADMIN_USER_ID, Rolename.Admin);
      expect(result).toBeUndefined(); // delete method returns void
    });

    it('should delete ingredient for customer', async () => {
      jest.spyOn(service, 'delete').mockResolvedValue(undefined);

      const result = await controller.deleteIngredient(
        { ingredientId: '507f1f77bcf86cd799439015' },
        SAMPLE_USER_IDS[0],
        Rolename.Customer
      );

      expect(service.delete).toHaveBeenCalledWith('507f1f77bcf86cd799439015', SAMPLE_USER_IDS[0], Rolename.Customer);
      expect(result).toBeUndefined(); // delete method returns void
    });
  });
});