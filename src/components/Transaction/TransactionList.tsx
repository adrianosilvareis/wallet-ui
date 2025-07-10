import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchWalletTransactions } from '../../store/slices/walletSlice';
import type { TransactionFilters, Transaction } from '../../types';

const TransactionList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { wallet, transactions, isLoading, hasMore, currentPage } = useAppSelector((state) => state.wallet);

  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    if (wallet) {
      dispatch(fetchWalletTransactions({ 
        filters: { ...filters, page: 1 } 
      }));
    }
  }, [dispatch, wallet?.id, filters.type, filters.status]);

  const handleLoadMore = () => {
    if (wallet && hasMore && !isLoading) {
      const nextPage = currentPage + 1;
      dispatch(fetchWalletTransactions({ 
        filters: { ...filters, page: nextPage } 
      }));
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value || undefined,
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'CREDIT':
        return '💰';
      case 'DEBIT':
        return '💸';
      default:
        return '📄';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'CREDIT':
        return 'text-green-600';
      case 'DEBIT':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    switch (status) {
      case 'COMPLETED':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'PENDING':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'FAILED':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (!wallet) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          <p>Carteira não encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Histórico de Transações</h2>
        <div className="text-sm text-gray-500">
          Total: {transactions.length} transações
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo
          </label>
          <select
            id="type-filter"
            name="type"
            value={filters.type || ''}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Todos os tipos</option>
            <option value="CREDIT">Créditos</option>
            <option value="DEBIT">Débitos</option>
          </select>
        </div>

        <div className="flex-1">
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status-filter"
            name="status"
            value={filters.status || ''}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Todos os status</option>
            <option value="COMPLETED">Concluídas</option>
            <option value="PENDING">Pendentes</option>
            <option value="FAILED">Falharam</option>
          </select>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-4">
        {isLoading && transactions.length === 0 ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="text-lg">📄 Nenhuma transação encontrada</p>
            <p className="text-sm">Faça sua primeira transação acima!</p>
          </div>
        ) : (
          <>
            {transactions.map((transaction: Transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">
                        {transaction.type === 'CREDIT' ? 'Crédito (Depósito)' :
                         transaction.type === 'DEBIT' ? 'Débito (Saque)' : 'Desconhecido'}
                      </h3>
                      <span className={getStatusBadge(transaction.status)}>
                        {transaction.status === 'COMPLETED' ? 'Concluída' :
                         transaction.status === 'PENDING' ? 'Pendente' : 'Falhou'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>{formatDate(transaction.timestamp)}</p>
                      {transaction.description && (
                        <p className="italic">{transaction.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                    {transaction.type === 'DEBIT' ? '-' : '+'}
                    {formatCurrency(transaction.amount)}
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: {transaction.id.slice(0, 8)}...
                  </div>
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Carregando...
                    </div>
                  ) : (
                    'Carregar Mais'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
