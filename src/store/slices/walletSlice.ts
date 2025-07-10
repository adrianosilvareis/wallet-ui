import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { 
  WalletState, 
  CreateTransactionRequest,
  TransactionFilters 
} from '../../types';
import { walletApi } from '../../services/api';

const initialState: WalletState = {
  wallet: null,
  transactions: [],
  balanceHistory: [],
  totalTransactions: 0,
  currentPage: 1,
  hasMore: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchUserWallets = createAsyncThunk(
  'wallet/fetchUserWallets',
  async (userId: string, { rejectWithValue }) => {
    try {
      const wallets = await walletApi.getUserWallets(userId);
      return wallets[0] || null; // Assuming one wallet per user for now
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch wallet';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchWalletBalance = createAsyncThunk(
  'wallet/fetchWalletBalance',
  async (_, { rejectWithValue }) => {
    try {
      const balanceData = await walletApi.getWalletBalance();
      return balanceData;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch balance';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchWalletTransactions = createAsyncThunk(
  'wallet/fetchWalletTransactions',
  async ({ filters }: { filters?: TransactionFilters }, { rejectWithValue }) => {
    try {
      const response = await walletApi.getWalletTransactions(filters);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch transactions';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createTransaction = createAsyncThunk(
  'wallet/createTransaction',
  async (transactionData: CreateTransactionRequest, { rejectWithValue }) => {
    try {
      const transaction = await walletApi.createTransaction(transactionData);
      return transaction;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create transaction';
      return rejectWithValue(errorMessage);
    }
  }
);

// Remove balance history for now since it's not in the API
export const fetchBalanceHistory = createAsyncThunk(
  'wallet/fetchBalanceHistory',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      // Mock implementation for now
      return {
        data: [],
        total: 0,
        page,
        limit,
        hasMore: false,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch balance history';
      return rejectWithValue(errorMessage);
    }
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetWallet: () => initialState,
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user wallets
      .addCase(fetchUserWallets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserWallets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wallet = action.payload;
      })
      .addCase(fetchUserWallets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch wallet balance
      .addCase(fetchWalletBalance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWalletBalance.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.wallet) {
          state.wallet.balance = action.payload.balance;
          state.wallet.currency = action.payload.currency;
        }
      })
      .addCase(fetchWalletBalance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch wallet transactions
      .addCase(fetchWalletTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWalletTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        const { data, total, page, hasMore } = action.payload;
        
        if (page === 1) {
          state.transactions = data;
        } else {
          state.transactions = [...state.transactions, ...data];
        }
        
        state.totalTransactions = total;
        state.currentPage = page;
        state.hasMore = hasMore;
      })
      .addCase(fetchWalletTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create transaction
      .addCase(createTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = [action.payload, ...state.transactions];
        
        // Update wallet balance if available
        if (state.wallet && action.payload.status === 'COMPLETED') {
          const amount = action.payload.amount;
          if (action.payload.type === 'CREDIT') {
            state.wallet.balance += amount;
          } else if (action.payload.type === 'DEBIT') {
            state.wallet.balance -= amount;
          }
        }
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch balance history
      .addCase(fetchBalanceHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBalanceHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        const { data, page } = action.payload;
        
        if (page === 1) {
          state.balanceHistory = data;
        } else {
          state.balanceHistory = [...state.balanceHistory, ...data];
        }
      })
      .addCase(fetchBalanceHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetWallet, setCurrentPage } = walletSlice.actions;
export default walletSlice.reducer;
