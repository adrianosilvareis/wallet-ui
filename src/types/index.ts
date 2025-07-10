export interface User {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  currency: string;
  description?: string;
  reference?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  timestamp: string;
}

export interface WalletBalanceHistory {
  id: string;
  walletId: string;
  transactionId: string;
  previousBalance: number;
  newBalance: number;
  changeAmount: number;
  timestamp: string;
}

export interface SystemConfiguration {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description: string;
  isPublic: boolean;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  error: string;
  statusCode: number;
}

export interface CreateTransactionRequest {
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface TransactionFilters {
  type?: 'CREDIT' | 'DEBIT';
  status?: 'PENDING' | 'COMPLETED' | 'FAILED';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface WalletState extends LoadingState {
  wallet: Wallet | null;
  transactions: Transaction[];
  balanceHistory: WalletBalanceHistory[];
  totalTransactions: number;
  currentPage: number;
  hasMore: boolean;
}

export interface ConfigurationState extends LoadingState {
  configurations: SystemConfiguration[];
  businessRules: {
    defaultCurrency: string;
    minTransactionAmount: number;
    maxTransactionAmount: number;
    maxWalletBalance: number;
  };
}

export interface UserState extends LoadingState {
  user: User | null;
  isAuthenticated: boolean;
}
