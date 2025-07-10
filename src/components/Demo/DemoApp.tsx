import { useState } from 'react';
import { demoWallet, demoTransactions, demoBusinessRules } from './DemoData';

export default function DemoApp() {
  const [wallet, setWallet] = useState(demoWallet);
  const [transactions, setTransactions] = useState(demoTransactions);
  const [transactionForm, setTransactionForm] = useState({
    amount: '',
    type: 'CREDIT' as 'CREDIT' | 'DEBIT',
    description: '',
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transactionForm.amount || parseFloat(transactionForm.amount) <= 0) {
      alert('Por favor, insira um valor válido');
      return;
    }

    const amount = parseFloat(transactionForm.amount);
    
    // Verificar regras de negócio
    if (amount < demoBusinessRules.minTransactionAmount) {
      alert(`Valor mínimo: ${formatCurrency(demoBusinessRules.minTransactionAmount)}`);
      return;
    }
    
    if (amount > demoBusinessRules.maxTransactionAmount) {
      alert(`Valor máximo: ${formatCurrency(demoBusinessRules.maxTransactionAmount)}`);
      return;
    }

    // Verificar saldo para débito
    if (transactionForm.type === 'DEBIT' && amount > wallet.balance) {
      alert('Saldo insuficiente para esta transação');
      return;
    }

    // Criar nova transação
    const newTransaction = {
      id: `txn-${Date.now()}`,
      walletId: wallet.id,
      amount,
      type: transactionForm.type,
      description: transactionForm.description || `${transactionForm.type === 'CREDIT' ? 'Depósito' : 'Saque'} via Demo`,
      status: 'COMPLETED' as const,
      createdAt: new Date().toISOString(),
    };

    // Atualizar saldo
    const newBalance = transactionForm.type === 'CREDIT' 
      ? wallet.balance + amount 
      : wallet.balance - amount;

    if (newBalance > demoBusinessRules.maxWalletBalance) {
      alert(`Saldo máximo permitido: ${formatCurrency(demoBusinessRules.maxWalletBalance)}`);
      return;
    }

    setWallet(prev => ({ ...prev, balance: newBalance }));
    setTransactions(prev => [newTransaction, ...prev]);
    setTransactionForm({ amount: '', type: 'CREDIT', description: '' });
    alert('Transação criada com sucesso!');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', marginBottom: '2rem' }}>
        <div className="container" style={{ padding: '1.5rem 1rem' }}>
          <h1 style={{ margin: 0, fontSize: '2rem', color: '#1f2937' }}>💰 Carteira Digital (Demo)</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280' }}>
            ⚠️ Modo demonstração - Backend não conectado
          </p>
        </div>
      </header>

      <main className="container">
        <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3">
          {/* Saldo da Carteira */}
          <div className="card">
            <h2 style={{ marginTop: 0, color: '#1f2937' }}>Saldo da Carteira</h2>
            
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#22c55e', marginBottom: '1rem' }}>
              {formatCurrency(wallet.balance)}
            </div>
            <p style={{ color: '#6b7280', margin: 0 }}>
              Moeda: {wallet.currency}
            </p>
            <p style={{ color: '#6b7280', margin: 0 }}>
              ID: {wallet.id}
            </p>
          </div>

          {/* Formulário de Transação */}
          <div className="card" style={{ gridColumn: 'span 2' }}>
            <h2 style={{ marginTop: 0, color: '#1f2937' }}>Nova Transação</h2>
            
            <form onSubmit={handleSubmitTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Tipo de Transação
                </label>
                <select
                  value={transactionForm.type}
                  onChange={(e) => setTransactionForm(prev => ({ ...prev, type: e.target.value as 'CREDIT' | 'DEBIT' }))}
                  className="form-input"
                  style={{ width: '100%' }}
                >
                  <option value="CREDIT">💰 Crédito (Depósito)</option>
                  <option value="DEBIT">💸 Débito (Saque)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Valor
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={demoBusinessRules.minTransactionAmount}
                  max={demoBusinessRules.maxTransactionAmount}
                  value={transactionForm.amount}
                  onChange={(e) => setTransactionForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="form-input"
                  style={{ width: '100%' }}
                  placeholder="0.00"
                  required
                />
                <small style={{ color: '#6b7280' }}>
                  Limite: {formatCurrency(demoBusinessRules.minTransactionAmount)} - {formatCurrency(demoBusinessRules.maxTransactionAmount)}
                </small>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Descrição (opcional)
                </label>
                <input
                  type="text"
                  value={transactionForm.description}
                  onChange={(e) => setTransactionForm(prev => ({ ...prev, description: e.target.value }))}
                  className="form-input"
                  style={{ width: '100%' }}
                  placeholder="Descrição da transação"
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '0.75rem', borderRadius: '0.5rem' }}
              >
                {transactionForm.type === 'CREDIT' ? '💰 Depositar' : '💸 Sacar'}
              </button>
            </form>
          </div>
        </div>

        {/* Lista de Transações */}
        <div className="card" style={{ marginTop: '2rem' }}>
          <h2 style={{ marginTop: 0, color: '#1f2937' }}>Histórico de Transações</h2>
          
          {transactions.length === 0 ? (
            <p style={{ color: '#6b7280' }}>Nenhuma transação encontrada.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    backgroundColor: 'white',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>
                          {transaction.type === 'CREDIT' ? '💰' : '💸'}
                        </span>
                        <span style={{ fontWeight: '500' }}>
                          {transaction.type === 'CREDIT' ? 'Crédito' : 'Débito'}
                        </span>
                        <span
                          style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            backgroundColor: '#22c55e',
                            color: 'white',
                          }}
                        >
                          {transaction.status}
                        </span>
                      </div>
                      {transaction.description && (
                        <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280' }}>
                          {transaction.description}
                        </p>
                      )}
                      <p style={{ margin: '0.5rem 0 0 0', color: '#9ca3af', fontSize: '0.875rem' }}>
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 'bold',
                          color: transaction.type === 'CREDIT' ? '#22c55e' : '#ef4444',
                        }}
                      >
                        {transaction.type === 'CREDIT' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
