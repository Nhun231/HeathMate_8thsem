/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { UserRepository } from '../user.repo';
import { HashingService } from 'src/shared/services/hashing.service';
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repo';
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo';
import {
  CanNotManipulateHigherRoleException,
  CannotUpdateOrDeleteYourselfException,
  RoleNotFoundException,
  UserAlreadyExistsException,
  UserNotFoundException,
} from '../user.error';

describe('UserService', () => {
  let service: UserService;
  let userRepo: jest.Mocked<UserRepository>;
  let hashingService: jest.Mocked<HashingService>;
  let sharedRoleRepository: jest.Mocked<SharedRoleRepository>;
  let sharedUserRepository: jest.Mocked<SharedUserRepository>;

  const mockUser = {
    _id: 'u1',
    email: 'test@example.com',
    roleId: { _id: 'role1' },
  };

  const mockRole = {
    _id: 'role1',
    name: 'user',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        { provide: HashingService, useValue: { hashPassword: jest.fn() } },
        {
          provide: SharedRoleRepository,
          useValue: { findUnique: jest.fn(), getAdminRoleId: jest.fn() },
        },
        { provide: SharedUserRepository, useValue: { findUnique: jest.fn() } },
      ],
    }).compile();

    service = module.get(UserService);
    userRepo = module.get(UserRepository);
    hashingService = module.get(HashingService);
    sharedRoleRepository = module.get(SharedRoleRepository);
    sharedUserRepository = module.get(SharedUserRepository);
  });

  it('should return users', async () => {
    const mockQuery = { page: 1 } as any;

    userRepo.findAll.mockResolvedValue({
      data: ['user'] as any,
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    const result = await service.getUsers(mockQuery);
    expect(result).toEqual({
      data: ['user'],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    expect(userRepo.findAll).toHaveBeenCalledWith(mockQuery);
  });

  it('should return user if found', async () => {
    userRepo.findOne.mockResolvedValue(mockUser as any);
    const result = await service.getUserById('u1');
    expect(result).toBe(mockUser);
  });

  it('should throw UserNotFoundException if user not found', async () => {
    userRepo.findOne.mockResolvedValue(null);
    await expect(service.getUserById('x')).rejects.toBe(UserNotFoundException);
  });

  it('should throw RoleNotFoundException if role not found', async () => {
    sharedRoleRepository.findUnique.mockResolvedValue(null);
    await expect(
      service.createUser({ role: 'missing' } as any, 'agent'),
    ).rejects.toBe(RoleNotFoundException);
  });

  it('should throw UserAlreadyExistsException if user already exists', async () => {
    sharedRoleRepository.findUnique.mockResolvedValue(mockRole as any);
    sharedRoleRepository.getAdminRoleId.mockResolvedValue('adminRole');
    jest.spyOn(service as any, 'verifyRole').mockResolvedValue(true);
    sharedUserRepository.findUnique.mockResolvedValue(mockUser as any);

    await expect(
      service.createUser(
        { role: 'user', email: 'test@example.com', password: '123' } as any,
        'agent',
      ),
    ).rejects.toBe(UserAlreadyExistsException);
  });

  it('should create user successfully', async () => {
    sharedRoleRepository.findUnique.mockResolvedValue(mockRole as any);
    sharedRoleRepository.getAdminRoleId.mockResolvedValue('adminRole');
    sharedUserRepository.findUnique.mockResolvedValue(null);
    hashingService.hashPassword.mockResolvedValue('hashed');
    jest.spyOn(service as any, 'verifyRole').mockResolvedValue(true);
    userRepo.create.mockResolvedValue(mockUser as any);

    const result = await service.createUser(
      { role: 'user', email: 'test@example.com', password: '123' } as any,
      'agent',
    );
    expect(result).toBe(mockUser);
    expect(userRepo.create).toHaveBeenCalledWith({
      roleId: mockRole._id,
      email: 'test@example.com',
      password: 'hashed',
      role: 'user',
    });
  });

  it('should updateMe with role found', async () => {
    sharedRoleRepository.findUnique.mockResolvedValue(mockRole as any);
    userRepo.update.mockResolvedValue(mockUser as any);

    const result = await service.updateMe('u1', { role: 'user' } as any);
    expect(result).toBe(mockUser);
  });

  it('should throw error if updateMe role not found', async () => {
    sharedRoleRepository.findUnique.mockResolvedValue(null);
    await expect(
      service.updateMe('u1', { role: 'notExist' } as any),
    ).rejects.toThrow('Role not found!');
  });

  it('should updateMe without role', async () => {
    userRepo.update.mockResolvedValue(mockUser as any);
    const result = await service.updateMe('u1', { name: 'New' } as any);
    expect(result).toBe(mockUser);
  });

  it('should throw CannotUpdateOrDeleteYourselfException', async () => {
    await expect(service.updateUser('u1', {} as any, 'u1')).rejects.toBe(
      CannotUpdateOrDeleteYourselfException,
    );
  });

  it('should throw RoleNotFoundException when updating with missing role', async () => {
    jest.spyOn(service as any, 'verifyYourself').mockImplementation(() => {});
    sharedRoleRepository.findUnique.mockResolvedValue(null);
    await expect(
      service.updateUser('target', { role: 'x' } as any, 'agent'),
    ).rejects.toBe(RoleNotFoundException);
  });

  it('should throw UserNotFoundException when user not found', async () => {
    jest.spyOn(service as any, 'verifyYourself').mockImplementation(() => {});
    userRepo.findOne.mockResolvedValue(null);
    await expect(service.updateUser('target', {} as any, 'agent')).rejects.toBe(
      UserNotFoundException,
    );
  });

  it('should updateUser successfully with role', async () => {
    jest.spyOn(service as any, 'verifyYourself').mockImplementation(() => {});
    jest.spyOn(service as any, 'verifyRole').mockResolvedValue(true);
    sharedRoleRepository.findUnique.mockResolvedValue(mockRole as any);
    userRepo.update.mockResolvedValue(mockUser as any);

    const result = await service.updateUser(
      'target',
      { role: 'user' } as any,
      'agent',
    );
    expect(result).toBe(mockUser);
  });

  it('should updateUser successfully without role', async () => {
    jest.spyOn(service as any, 'verifyYourself').mockImplementation(() => {});
    jest.spyOn(service as any, 'verifyRole').mockResolvedValue(true);
    userRepo.findOne.mockResolvedValue(mockUser as any);
    userRepo.update.mockResolvedValue(mockUser as any);

    const result = await service.updateUser('target', {} as any, 'agent');
    expect(result).toBe(mockUser);
  });

  it('should throw CannotUpdateOrDeleteYourselfException', async () => {
    await expect(service.deleteUser('u1', 'u1')).rejects.toBe(
      CannotUpdateOrDeleteYourselfException,
    );
  });

  it('should throw UserNotFoundException if user not found', async () => {
    jest.spyOn(service as any, 'verifyYourself').mockImplementation(() => {});
    userRepo.findOne.mockResolvedValue(null);
    await expect(service.deleteUser('u1', 'agent')).rejects.toBe(
      UserNotFoundException,
    );
  });

  it('should deleteUser successfully', async () => {
    jest.spyOn(service as any, 'verifyYourself').mockImplementation(() => {});
    jest.spyOn(service as any, 'verifyRole').mockResolvedValue(true);
    userRepo.findOne.mockResolvedValue(mockUser as any);
    userRepo.delete.mockResolvedValue({ deletedCount: 1 } as any);

    const result = await service.deleteUser('target', 'agent');
    expect(result).toEqual({ deletedCount: 1 });
  });

  describe('verifyRole', () => {
    it('should allow admin agent', async () => {
      sharedRoleRepository.getAdminRoleId.mockResolvedValue('admin');
      const result = await (service as any).verifyRole({
        roleIdAgent: 'admin',
        roleIdTarget: 'any',
      });
      expect(result).toBe(true);
    });

    it('should throw CanNotManipulateHigherRoleException when target is admin', async () => {
      sharedRoleRepository.getAdminRoleId.mockResolvedValue('admin');
      await expect(
        (service as any).verifyRole({
          roleIdAgent: 'user',
          roleIdTarget: 'admin',
        }),
      ).rejects.toBe(CanNotManipulateHigherRoleException);
    });

    it('should allow when both non-admin', async () => {
      sharedRoleRepository.getAdminRoleId.mockResolvedValue('admin');
      const result = await (service as any).verifyRole({
        roleIdAgent: 'user',
        roleIdTarget: 'role1',
      });
      expect(result).toBe(true);
    });
  });

  it('should throw CannotUpdateOrDeleteYourselfException if same id', () => {
    expect(() =>
      (service as any).verifyYourself({ userAgentId: '1', userTargetId: '1' }),
    ).toThrow(CannotUpdateOrDeleteYourselfException);
  });

  it('should pass verifyYourself if different ids', () => {
    expect(() =>
      (service as any).verifyYourself({ userAgentId: '1', userTargetId: '2' }),
    ).not.toThrow();
  });
});
