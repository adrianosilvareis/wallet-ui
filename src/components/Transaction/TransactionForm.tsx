import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { createTransaction } from '../../store/slices/walletSlice';
import type { CreateTransactionRequest } from '../../types';

const TransactionForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { wallet, isLoading } = useAppSelector((state) => state.wallet);
  const { businessRules } = useAppSelector((state) => state.configuration);

  const [formData, setFormData] = useState({
    amount: '',
    type: 'CREDIT' as 'CREDIT' | 'DEBIT',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate amount
    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount)) {
      newErrors.amount = 'Valor é obrigatório';
    } else if (amount < businessRules.minTransactionAmount) {
      newErrors.amount = `Valor mínimo é ${businessRules.minTransactionAmount}`;
    } else if (amount > businessRules.maxTransactionAmount) {
      newErrors.amount = `Valor máximo é ${businessRules.maxTransactionAmount}`;
    } else if (formData.type === 'DEBIT' && wallet && amount > wallet.balance) {
      newErrors.amount = 'Saldo insuficiente';
    } else if (formData.type === 'CREDIT' && wallet && (wallet.balance + amount) > businessRules.maxWalletBalance) {
      newErrors.amount = 'Depósito excede o limite máximo da carteira';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet) {
      alert('Carteira não encontrada');
      return;
    }

    if (!validateForm()) {
      return;
    }

    const transactionData: CreateTransactionRequest = {
      amount: parseFloat(formData.amount),
      type: formData.type,
      description: formData.description || undefined,
    };

    try {
      await dispatch(createTransaction(transactionData)).unwrap();
      
      // Reset form on success
      setFormData({
        amount: '',
        type: 'CREDIT',
        description: '',
      });
      setErrors({});
      
      alert('Transação criada com sucesso!');
    } catch (error) {
      alert(`Erro ao criar transação: ${error}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Nova Transação</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            Saldo: {wallet ? formatCurrency(wallet.balance) : 'Carregando...'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Transaction Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Transação
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            disabled={isLoading}
          >
            <option value="CREDIT">💰 Crédito (Depósito)</option>
            <option value="DEBIT">💸 Débito (Saque)</option>
          </select>
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Valor
          </label>
          <div className="relative">
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              step="0.01"
              min={businessRules.minTransactionAmount}
              max={businessRules.maxTransactionAmount}
              placeholder="0,00"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.amount ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">R$</span>
            </div>
          </div>
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Limite: {formatCurrency(businessRules.minTransactionAmount)} - {formatCurrency(businessRules.maxTransactionAmount)}
          </p>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Descrição (Opcional)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            placeholder="Descrição da transação..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            disabled={isLoading}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !wallet}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              isLoading || !wallet
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : formData.type === 'CREDIT'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processando...
              </div>
            ) : (
              <>
                {formData.type === 'CREDIT' ? '💰 Depositar' : '💸 Sacar'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
