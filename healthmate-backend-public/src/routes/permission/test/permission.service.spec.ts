import { PermissionService } from '../permission.service';
import { PermissionRepo } from '../permission.repo';
import { NotFoundPermissionException } from '../permission.error';
import { Types } from 'mongoose';

describe('PermissionService', () => {
  let service: PermissionService;
  let permissionRepo: jest.Mocked<PermissionRepo>;

  beforeEach(() => {
    permissionRepo = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateRolesDiff: jest.fn(),
      getModules: jest.fn(),
    } as any;

    service = new PermissionService(permissionRepo);
  });

  describe('list', () => {
    it('should call findAll with query', async () => {
      const query = { page: 1 } as any;
      await service.list(query);
      expect(permissionRepo.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a permission if found', async () => {
      const id = new Types.ObjectId().toString();
      const fake = { _id: id };
      permissionRepo.findOne.mockResolvedValue(fake as any);

      const result = await service.findOne(id);
      expect(result).toBe(fake);
    });

    it('should throw NotFoundPermissionException if not found', async () => {
      const validId = '507f1f77bcf86cd799439011';
      permissionRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(validId)).rejects.toBe(
        NotFoundPermissionException,
      );
    });
  });

  describe('create', () => {
    it('should call create with empty role array if no roles provided', async () => {
      const body = { name: 'test' } as any;
      await service.create(body);
      expect(permissionRepo.create).toHaveBeenCalledWith({ ...body, role: [] });
    });

    it('should map roles to ObjectIds if roles provided', async () => {
      const body = {
        name: 'test',
        role: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
      } as any;
      await service.create(body);
      expect(permissionRepo.create).toHaveBeenCalledWith({
        ...body,
        role: expect.arrayContaining([expect.any(Types.ObjectId)]),
      });
    });
  });

  describe('update', () => {
    it('should call findOne and then update', async () => {
      const id = new Types.ObjectId().toString();
      const data = { name: 'edit' } as any;
      jest.spyOn(service, 'findOne').mockResolvedValue({ _id: id } as any);

      await service.update(id, data);
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(permissionRepo.update).toHaveBeenCalledWith(
        expect.any(Types.ObjectId),
        data,
      );
    });
  });

  describe('delete', () => {
    it('should call findOne and then delete', async () => {
      const id = new Types.ObjectId().toString();
      jest.spyOn(service, 'findOne').mockResolvedValue({ _id: id } as any);

      await service.delete(id);
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(permissionRepo.delete).toHaveBeenCalledWith(
        expect.any(Types.ObjectId),
      );
    });
  });

  describe('diffRoles', () => {
    it('should return added and removed roles correctly', () => {
      const oldRoles = ['1', '2'];
      const newRoles = ['2', '3'];
      const result = (service as any).diffRoles(oldRoles, newRoles);
      expect(result).toEqual({ added: ['3'], removed: ['1'] });
    });
  });

  describe('updateRoles', () => {
    it('should update roles correctly', async () => {
      const permissionId = new Types.ObjectId().toString();
      const permission = {
        _id: permissionId,
        role: [{ _id: new Types.ObjectId('64b16b90fc13ae5a40000001') }],
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(permission as any);
      permissionRepo.updateRolesDiff.mockResolvedValue({
        _id: new Types.ObjectId(permissionId),
      } as any);

      const result = await service.updateRoles(permissionId, [
        '64b16b90fc13ae5a40000002',
      ]);

      expect(permissionRepo.updateRolesDiff).toHaveBeenCalledWith(
        expect.any(Types.ObjectId),
        expect.any(Array),
        expect.any(Array),
      );

      expect(result.message).toBe('Permission roles updated successfully');
      expect(result.added).toEqual(['64b16b90fc13ae5a40000002']);
      expect(result.removed).toEqual(['64b16b90fc13ae5a40000001']);
    });
  });

  describe('bulkUpdateRoles', () => {
    it('should process multiple role updates', async () => {
      jest.spyOn(service, 'updateRoles').mockResolvedValue({
        added: ['a'],
        removed: ['b'],
      } as any);

      const result = await service.bulkUpdateRoles([
        { permissionId: '1', roleIds: ['a'] },
      ]);

      expect(service.updateRoles).toHaveBeenCalledTimes(1);
      expect(result.message).toBe('Bulk update completed');
      expect(result.results[0]).toEqual({
        permissionId: '1',
        added: ['a'],
        removed: ['b'],
      });
    });
  });

  describe('getModules', () => {
    it('should call permissionRepo.getModules', async () => {
      await service.getModules();
      expect(permissionRepo.getModules).toHaveBeenCalled();
    });
  });
});
