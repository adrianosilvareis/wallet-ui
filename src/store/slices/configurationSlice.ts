import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { ConfigurationState } from '../../types';
import { configurationApi } from '../../services/api';

const initialState: ConfigurationState = {
  configurations: [],
  businessRules: {
    defaultCurrency: 'BRL',
    minTransactionAmount: 0.01,
    maxTransactionAmount: 10000,
    maxWalletBalance: 1000000,
  },
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchPublicConfigurations = createAsyncThunk(
  'configuration/fetchPublicConfigurations',
  async (_, { rejectWithValue }) => {
    try {
      const configurations = await configurationApi.getPublicConfigurations();
      return configurations;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch configurations';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchBusinessRules = createAsyncThunk(
  'configuration/fetchBusinessRules',
  async (_, { rejectWithValue }) => {
    try {
      const businessRules = await configurationApi.getBusinessRules();
      return businessRules;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch business rules';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchHealthStatus = createAsyncThunk(
  'configuration/fetchHealthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const status = await configurationApi.getHealthStatus();
      return status;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch health status';
      return rejectWithValue(errorMessage);
    }
  }
);

const configurationSlice = createSlice({
  name: 'configuration',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetConfiguration: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch public configurations
      .addCase(fetchPublicConfigurations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPublicConfigurations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.configurations = action.payload;
      })
      .addCase(fetchPublicConfigurations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch business rules
      .addCase(fetchBusinessRules.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBusinessRules.fulfilled, (state, action) => {
        state.isLoading = false;
        state.businessRules = action.payload;
      })
      .addCase(fetchBusinessRules.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch health status
      .addCase(fetchHealthStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHealthStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        // Health status could be stored in configurations or handled separately
        console.log('Health status:', action.payload);
      })
      .addCase(fetchHealthStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetConfiguration } = configurationSlice.actions;
export default configurationSlice.reducer;
