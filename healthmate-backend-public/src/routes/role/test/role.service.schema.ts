/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from '../role.service';
import { RoleRepo } from '../role.repo';
import { NotFoundRoleException } from '../role.error';
import { Types, DeleteResult } from 'mongoose';

describe('RoleService', () => {
  let service: RoleService;
  let repo: jest.Mocked<RoleRepo>;

  const mockRole = {
    _id: new Types.ObjectId(),
    name: 'Admin',
    description: 'Administrator role',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: RoleRepo,
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

    service = module.get<RoleService>(RoleService);
    repo = module.get(RoleRepo);
  });

  describe('list', () => {
    it('should call repo.findAll and return roles', async () => {
      const mockQuery = { page: 1, limit: 10 };
      const mockResult = {
        data: [mockRole],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      repo.findAll.mockResolvedValue(mockResult as any);

      const result = await service.list(mockQuery as any);

      expect(repo.findAll).toHaveBeenCalledWith(mockQuery);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findOne', () => {
    it('should return role if found', async () => {
      repo.findOne.mockResolvedValue(mockRole as any);

      const result = await service.findOne(mockRole._id.toString());

      expect(repo.findOne).toHaveBeenCalledWith(mockRole._id);
      expect(result).toEqual(mockRole);
    });

    it('should throw NotFoundRoleException if role not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne(mockRole._id.toString())).rejects.toThrow(
        NotFoundRoleException,
      );
    });
  });

  describe('create', () => {
    it('should create a new role', async () => {
      repo.create.mockResolvedValue(mockRole as any);

      const result = await service.create({
        name: 'Admin',
        description: 'Administrator role',
      } as any);

      expect(repo.create).toHaveBeenCalledWith({
        name: 'Admin',
        description: 'Administrator role',
      });
      expect(result).toEqual(mockRole);
    });
  });

  describe('update', () => {
    it('should update an existing role', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockRole as any);
      repo.update.mockResolvedValue({
        ...mockRole,
        name: 'UpdatedRole',
      } as any);

      const result = await service.update(mockRole._id.toString(), {
        name: 'UpdatedRole',
      } as any);

      expect(service.findOne).toHaveBeenCalledWith(mockRole._id.toString());
      expect(repo.update).toHaveBeenCalledWith(mockRole._id, {
        name: 'UpdatedRole',
      });
      expect(result?.name).toBe('UpdatedRole');
    });

    it('should throw NotFoundRoleException if role not found before update', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValueOnce(NotFoundRoleException);

      await expect(
        service.update(mockRole._id.toString(), { name: 'Fail' } as any),
      ).rejects.toThrow(NotFoundRoleException);
    });
  });

  describe('delete', () => {
    it('should delete an existing role', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockRole as any);
      const mockDeleteResult: DeleteResult = {
        acknowledged: true,
        deletedCount: 1,
      };
      repo.delete.mockResolvedValue(mockDeleteResult);

      const result = await service.delete(mockRole._id.toString());

      expect(service.findOne).toHaveBeenCalledWith(mockRole._id.toString());
      expect(repo.delete).toHaveBeenCalledWith(mockRole._id);
      expect(result).toEqual(mockDeleteResult);
    });

    it('should throw NotFoundRoleException if role not found before delete', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValueOnce(NotFoundRoleException);

      await expect(service.delete(mockRole._id.toString())).rejects.toThrow(
        NotFoundRoleException,
      );
    });
  });
});
