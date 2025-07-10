import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchUserWallets, fetchWalletBalance } from '../../store/slices/walletSlice';
import { fetchBusinessRules } from '../../store/slices/configurationSlice';
import WalletBalance from './WalletBalance';
import TransactionForm from '../Transaction/TransactionForm';
import TransactionList from '../Transaction/TransactionList';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { wallet, isLoading, error } = useAppSelector((state) => state.wallet);
  
  // For demo purposes, using a hardcoded user ID
  // In a real app, this would come from authentication
  const userId = 'demo-user-id';

  useEffect(() => {
    // Fetch initial data
    dispatch(fetchBusinessRules());
    dispatch(fetchUserWallets(userId)).then((result) => {
      if (result.payload && typeof result.payload === 'object' && 'id' in result.payload) {
        dispatch(fetchWalletBalance());
      }
    });
  }, [dispatch, userId]);

  if (isLoading && !wallet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-red-600 text-center">
            <h2 className="text-xl font-semibold mb-2">Erro</h2>
            <p>{error}</p>
            <button
              onClick={() => dispatch(fetchUserWallets(userId))}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">💰 Carteira Digital</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {wallet ? `Carteira: ${wallet.id.slice(0, 8)}...` : 'Carregando...'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Wallet Balance - Takes full width on mobile, 1 column on large screens */}
          <div className="lg:col-span-1">
            <WalletBalance />
          </div>

          {/* Transaction Form - Takes full width on mobile, 2 columns on large screens */}
          <div className="lg:col-span-2">
            <TransactionForm />
          </div>

          {/* Transaction List - Takes full width on both mobile and desktop */}
          <div className="lg:col-span-3">
            <TransactionList />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
