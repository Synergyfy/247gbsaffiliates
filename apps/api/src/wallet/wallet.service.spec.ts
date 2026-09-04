import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';

const mockWalletRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockTransactionRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
};

describe('WalletService', () => {
  let service: WalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: getRepositoryToken(Wallet), useValue: mockWalletRepo },
        { provide: getRepositoryToken(Transaction), useValue: mockTransactionRepo },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deposit', () => {
    it('should increase balance and create transaction', async () => {
      const userId = 'user-1';
      const wallet = { id: 'wallet-1', userId, balance: 0 };
      
      mockWalletRepo.findOne.mockResolvedValue(wallet);
      mockWalletRepo.save.mockResolvedValue({ ...wallet, balance: 100 });
      mockTransactionRepo.create.mockReturnValue({});
      mockTransactionRepo.save.mockResolvedValue({});

      const result = await service.deposit(userId, 100);
      
      expect(mockWalletRepo.save).toHaveBeenCalled();
      expect(mockTransactionRepo.save).toHaveBeenCalled();
    });
  });
});
