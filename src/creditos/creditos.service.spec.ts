import { Test, TestingModule } from '@nestjs/testing';
import { CreditosService } from './creditos.service';

describe('CreditosService', () => {
  let service: CreditosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreditosService],
    }).compile();

    service = module.get<CreditosService>(CreditosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
