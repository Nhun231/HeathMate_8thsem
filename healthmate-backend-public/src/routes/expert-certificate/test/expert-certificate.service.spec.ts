import { Test, TestingModule } from '@nestjs/testing';
import { ExpertCertificateService } from './../expert-certificate.service';
import { ExpertCertificateRepo } from './../expert-certificate.repo';
import { NotFoundExpertCertificateException } from './../expert-certificate.error';
import { Types, DeleteResult } from 'mongoose';

describe('ExpertCertificateService', () => {
  let service: ExpertCertificateService;
  let repo: jest.Mocked<ExpertCertificateRepo>;

  const mockCertificate = {
    _id: new Types.ObjectId(),
    user: new Types.ObjectId(),
    certificateURLKey: 'test-cert',
    status: 'Pending',
    submittedAt: new Date(),
    approvesAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpertCertificateService,
        {
          provide: ExpertCertificateRepo,
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

    service = module.get<ExpertCertificateService>(ExpertCertificateService);
    repo = module.get(ExpertCertificateRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return a list of certificates', async () => {
      const query = { limit: 10 } as any;
      const expected = [mockCertificate];
      repo.findAll.mockResolvedValue(expected as any);

      const result = await service.list(query);

      expect(repo.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should return a certificate if found', async () => {
      repo.findOne.mockResolvedValue(mockCertificate as any);

      const result = await service.findOne(mockCertificate._id.toString());

      expect(repo.findOne).toHaveBeenCalledWith(expect.any(Types.ObjectId));
      expect(result).toEqual(mockCertificate);
    });

    it('should throw NotFoundExpertCertificateException if not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(
        service.findOne(new Types.ObjectId().toString()),
      ).rejects.toBe(NotFoundExpertCertificateException);
    });
  });

  describe('create', () => {
    it('should call repo.create with the correct arguments', async () => {
      const userId = new Types.ObjectId().toString();
      const data = { certificateURLKey: 'new-cert', status: 'Pending' } as any;
      const expected = { _id: new Types.ObjectId(), ...data };
      repo.create.mockResolvedValue(expected);

      const result = await service.create({ userId, data });

      expect(repo.create).toHaveBeenCalledWith({
        userId: expect.any(Types.ObjectId),
        data,
      });
      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should find a certificate and call repo.update', async () => {
      repo.findOne.mockResolvedValue(mockCertificate as any);
      const updated = { ...mockCertificate, status: 'Approved' };
      repo.update.mockResolvedValue(updated as any);

      const id = mockCertificate._id.toString();
      const data = { status: 'Approved' } as any;

      const result = await service.update({ id, data });

      expect(repo.findOne).toHaveBeenCalledWith(expect.any(Types.ObjectId));
      expect(repo.update).toHaveBeenCalledWith(mockCertificate._id, data);
      expect(result?.status).toBe('Approved');
    });
  });

  describe('delete', () => {
    it('should find a certificate and call repo.delete', async () => {
      repo.findOne.mockResolvedValue(mockCertificate as any);
      const expected: DeleteResult = { acknowledged: true, deletedCount: 1 };
      repo.delete.mockResolvedValue(expected);

      const result = await service.delete(mockCertificate._id.toString());

      expect(repo.findOne).toHaveBeenCalledWith(expect.any(Types.ObjectId));
      expect(repo.delete).toHaveBeenCalledWith(mockCertificate._id);
      expect(result).toBe(expected);
    });
  });
});
