import React from 'react';
import { useAppSelector } from '../../hooks/redux';

const WalletBalance: React.FC = () => {
  const { wallet, isLoading } = useAppSelector((state) => state.wallet);
  const { businessRules } = useAppSelector((state) => state.configuration);

  const formatCurrency = (amount: number, currency: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getBalanceColor = (balance: number) => {
    if (balance <= 0) return 'text-red-600';
    if (balance < 1000) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getBalancePercentage = (balance: number) => {
    return (balance / businessRules.maxWalletBalance) * 100;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Saldo da Carteira</h2>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
          <span className="text-sm text-gray-500">Ativo</span>
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      ) : wallet ? (
        <>
          {/* Balance Display */}
          <div className="mb-6">
            <div className={`text-3xl font-bold ${getBalanceColor(wallet.balance)}`}>
              {formatCurrency(wallet.balance, wallet.currency)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Moeda: {wallet.currency}
            </div>
          </div>

          {/* Balance Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Utilização da carteira</span>
              <span>{getBalancePercentage(wallet.balance).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(getBalancePercentage(wallet.balance), 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Limite máximo: {formatCurrency(businessRules.maxWalletBalance)}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-sm text-gray-500">Limite por transação</div>
              <div className="text-sm font-medium">
                {formatCurrency(businessRules.minTransactionAmount)} - {formatCurrency(businessRules.maxTransactionAmount)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Última atualização</div>
              <div className="text-sm font-medium">
                {new Date(wallet.updatedAt).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500">
          <p>Carteira não encontrada</p>
        </div>
      )}
    </div>
  );
};

export default WalletBalance;
