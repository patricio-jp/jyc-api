import { Test, TestingModule } from '@nestjs/testing';
import { CreditosController } from './creditos.controller';
import { CreditosService } from './creditos.service';

describe('CreditosController', () => {
  let controller: CreditosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreditosController],
      providers: [CreditosService],
    }).compile();

    controller = module.get<CreditosController>(CreditosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
