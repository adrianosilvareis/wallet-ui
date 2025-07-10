// Dados de demonstração para quando o backend não estiver disponível
export const demoWallet = {
  id: 'demo-wallet-123',
  balance: 1234.56,
  currency: 'USD',
  userId: 'demo-user-id',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const demoTransactions = [
  {
    id: 'txn-001',
    walletId: 'demo-wallet-123',
    amount: 100.00,
    type: 'CREDIT' as const,
    description: 'Depósito inicial',
    status: 'COMPLETED' as const,
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
  {
    id: 'txn-002',
    walletId: 'demo-wallet-123',
    amount: 25.50,
    type: 'DEBIT' as const,
    description: 'Compra no supermercado',
    status: 'COMPLETED' as const,
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
  },
  {
    id: 'txn-003',
    walletId: 'demo-wallet-123',
    amount: 500.00,
    type: 'CREDIT' as const,
    description: 'Transferência recebida',
    status: 'COMPLETED' as const,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: 'txn-004',
    walletId: 'demo-wallet-123',
    amount: 75.25,
    type: 'DEBIT' as const,
    description: 'Pagamento de conta',
    status: 'COMPLETED' as const,
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
];

export const demoBusinessRules = {
  defaultCurrency: 'USD',
  minTransactionAmount: 0.01,
  maxTransactionAmount: 10000,
  maxWalletBalance: 1000000,
};
