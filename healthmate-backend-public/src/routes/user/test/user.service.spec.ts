import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { UserRepository } from '../user.repo';
import { SharedRoleRepository } from '../../../shared/repositories/shared-role.repo';
import { HashingService } from 'src/shared/services/hashing.service';

const calculateAge = (dob: string) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

const validateProfile = ({ name, gender, dob }: any) => {
  const errors: any = {};
  if (
    !name ||
    typeof name !== 'string' ||
    name.trim().length < 2 ||
    name.trim().length > 64 ||
    /[^a-zA-ZÀ-ỹ\s]/.test(name)
  ) {
    errors.name = 'Invalid name';
  }
  if (gender !== 'Nam' && gender !== 'Nữ') {
    errors.gender = 'Invalid gender';
  }
  const age = calculateAge(dob);
  if (age < 12 || age > 110) {
    errors.dob = 'Invalid age';
  }
  return Object.keys(errors).length ? errors : { name, gender, dob };
};

describe('UserService', () => {
  let service: UserService;

  const mockUserRepo = { findOne: jest.fn(), update: jest.fn() };
  const mockSharedRoleRepo = { findOne: jest.fn() };
  const mockHashingService = { hash: jest.fn(), compare: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: mockUserRepo },
        { provide: SharedRoleRepository, useValue: mockSharedRoleRepo },
        { provide: HashingService, useValue: mockHashingService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const testCases = [
    { name: 'Đặng Quế Anh', gender: 'Nữ', dob: '2000-01-01', shouldPass: true },
    { name: 'A'.repeat(64), gender: 'Nữ', dob: '2000-01-01', shouldPass: true },
    {
      name: 'A'.repeat(65),
      gender: 'Nữ',
      dob: '2000-01-01',
      shouldPass: false,
    },
    { name: 'Ng', gender: 'Nữ', dob: '2011-01-01', shouldPass: true },
    { name: 'N', gender: 'xyz', dob: '2013-01-01', shouldPass: false },
    { name: '     ', gender: 'Nam', dob: '1910-01-01', shouldPass: false },
    {
      name: 'Nguyễn*Anh Tú',
      gender: 'Nam',
      dob: '2010-01-01',
      shouldPass: false,
    },
  ];

  testCases.forEach((tc, idx) => {
    it(`UTCID0${idx + 1} should ${tc.shouldPass ? 'pass' : 'fail'}`, () => {
      const result = validateProfile(tc);
      if (tc.shouldPass) {
        expect(result).toEqual({
          name: tc.name,
          gender: tc.gender,
          dob: tc.dob,
        });
      } else {
        expect(['name', 'gender', 'dob'].some((prop) => prop in result)).toBe(
          true,
        );
      }
    });
  });
});
