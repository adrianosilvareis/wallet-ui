import axios, { type AxiosResponse } from 'axios';
import type {
  ApiResponse,
  Wallet,
  Transaction,
  SystemConfiguration,
  CreateTransactionRequest,
  TransactionFilters,
  User,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Wallet API
export const walletApi = {
  getWalletBalance: async (): Promise<{ balance: number; currency: string; id: string; name: string }> => {
    const response = await apiClient.get<ApiResponse<{ balance: number; currency: string; id: string; name: string }>>(
      '/wallet/balance'
    );
    return response.data.data;
  },

  getWalletTransactions: async (
    filters?: TransactionFilters
  ): Promise<{ data: Transaction[]; total: number; page: number; limit: number; hasMore: boolean }> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const url = queryString ? `/wallet/transactions?${queryString}` : '/wallet/transactions';
    
    const response = await apiClient.get<ApiResponse<Transaction[]>>(url);
    
    // Convert simple array response to paginated format
    const transactions = response.data.data;
    return {
      data: transactions,
      total: transactions.length,
      page: filters?.page || 1,
      limit: filters?.limit || 10,
      hasMore: false,
    };
  },

  createTransaction: async (transactionData: CreateTransactionRequest): Promise<Transaction> => {
    const response = await apiClient.post<ApiResponse<Transaction>>('/wallet/transactions', transactionData);
    return response.data.data;
  },

  getTransaction: async (transactionId: string): Promise<Transaction> => {
    const response = await apiClient.get<ApiResponse<Transaction>>(`/wallet/transactions/${transactionId}`);
    return response.data.data;
  },

  // For demo purposes - mock wallet data
  getUserWallets: async (userId: string): Promise<Wallet[]> => {
    // Get the actual wallet from the balance endpoint
    try {
      const balanceData = await apiClient.get<ApiResponse<{ balance: number; currency: string; id: string; name: string }>>('/wallet/balance');
      const wallet: Wallet = {
        id: balanceData.data.data.id,
        userId: userId,
        balance: balanceData.data.data.balance,
        currency: balanceData.data.data.currency,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return [wallet];
    } catch {
      // Fallback to mock wallet
      const mockWallet: Wallet = {
        id: 'demo-wallet-id',
        userId: userId,
        balance: 0,
        currency: 'BRL',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return [mockWallet];
    }
  },
};

// Configuration API
export const configurationApi = {
  getBusinessRules: async (): Promise<{
    defaultCurrency: string;
    minTransactionAmount: number;
    maxTransactionAmount: number;
    maxWalletBalance: number;
  }> => {
    const response = await apiClient.get<ApiResponse<{
      defaultCurrency: string;
      minTransactionAmount: number;
      maxTransactionAmount: number;
      maxWalletBalance: number;
    }>>('/config/business');
    return response.data.data;
  },

  getPublicConfigurations: async (): Promise<SystemConfiguration[]> => {
    const response = await apiClient.get<ApiResponse<SystemConfiguration[]>>(
      '/config/public'
    );
    return response.data.data;
  },

  getHealthStatus: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await apiClient.get<ApiResponse<{ status: string; timestamp: string }>>(
      '/config/health'
    );
    return response.data.data;
  },
};

// User API (if needed for authentication)
export const userApi = {
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/users/me');
    return response.data.data;
  },

  loginUser: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await apiClient.post<ApiResponse<{ user: User; token: string }>>(
      '/auth/login',
      { email, password }
    );
    return response.data.data;
  },

  registerUser: async (userData: { name: string; email: string; password: string }): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>('/auth/register', userData);
    return response.data.data;
  },
};

export default apiClient;
