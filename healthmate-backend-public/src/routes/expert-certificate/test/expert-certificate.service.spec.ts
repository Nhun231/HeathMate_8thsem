import { Test, TestingModule } from '@nestjs/testing';
import { ExpertCertificateService } from './expert-certificate.service';

describe('ExpertCertificateService', () => {
  let service: ExpertCertificateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExpertCertificateService],
    }).compile();

    service = module.get<ExpertCertificateService>(ExpertCertificateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
