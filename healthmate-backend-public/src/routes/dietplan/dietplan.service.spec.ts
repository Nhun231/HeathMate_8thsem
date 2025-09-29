import { Test, TestingModule } from '@nestjs/testing';
import { DietPlanService } from './dietplan.service';

describe('DietplanService', () => {
  let service: DietPlanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DietPlanService],
    }).compile();

    service = module.get<DietPlanService>(DietPlanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
