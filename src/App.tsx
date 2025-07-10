import { useAppDispatch, useAppSelector } from './hooks/redux';
import { useEffect, useState } from 'react';
import { fetchUserWallets, fetchWalletBalance, fetchWalletTransactions, createTransaction } from './store/slices/walletSlice';
import { fetchBusinessRules } from './store/slices/configurationSlice';
import type { CreateTransactionRequest, WalletState, ConfigurationState } from './types';
import DemoApp from './components/Demo/DemoApp';
import './App.css';

function App() {
  const dispatch = useAppDispatch();
  const walletState = useAppSelector((state) => state.wallet) as WalletState;
  const configState = useAppSelector((state) => state.configuration) as ConfigurationState;
  
  const [transactionForm, setTransactionForm] = useState({
    amount: '',
    type: 'CREDIT' as 'CREDIT' | 'DEBIT',
    description: '',
  });
  
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);

  const userId = 'demo-user-id';

  useEffect(() => {
    // Teste de conectividade com o backend
    const checkBackend = async () => {
      try {
        await dispatch(fetchBusinessRules()).unwrap();
        const result = await dispatch(fetchUserWallets(userId));
        if (result.payload) {
          dispatch(fetchWalletBalance());
          dispatch(fetchWalletTransactions({ filters: { page: 1, limit: 10 } }));
          setBackendAvailable(true);
        }
      } catch {
        console.log('Backend não disponível, usando modo demo');
        setBackendAvailable(false);
      }
    };

    checkBackend();
  }, [dispatch, userId]);

  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transactionForm.amount || parseFloat(transactionForm.amount) <= 0) {
      alert('Por favor, insira um valor válido');
      return;
    }

    const transactionData: CreateTransactionRequest = {
      amount: parseFloat(transactionForm.amount),
      type: transactionForm.type,
      description: transactionForm.description || undefined,
    };

    try {
      await dispatch(createTransaction(transactionData)).unwrap();
      setTransactionForm({ amount: '', type: 'CREDIT', description: '' });
      alert('Transação criada com sucesso!');
      
      // Atualizar dados
      dispatch(fetchWalletBalance());
      dispatch(fetchWalletTransactions({ filters: { page: 1, limit: 10 } }));
    } catch (error) {
      alert(`Erro ao criar transação: ${error}`);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  // Se ainda estamos verificando a conectividade
  if (backendAvailable === null) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1>💰 Carteira Digital</h1>
          <p>Verificando conectividade...</p>
        </div>
      </div>
    );
  }

  // Se o backend não está disponível, mostrar o demo
  if (backendAvailable === false) {
    return <DemoApp />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', marginBottom: '2rem' }}>
        <div className="container" style={{ padding: '1.5rem 1rem' }}>
          <h1 style={{ margin: 0, fontSize: '2rem', color: '#1f2937' }}>💰 Carteira Digital</h1>
        </div>
      </header>

      <main className="container">
        <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3">
          {/* Saldo da Carteira */}
          <div className="card">
            <h2 style={{ marginTop: 0, color: '#1f2937' }}>Saldo da Carteira</h2>
            
            {walletState.isLoading && !walletState.wallet ? (
              <p>Carregando...</p>
            ) : walletState.wallet ? (
              <>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#22c55e', marginBottom: '1rem' }}>
                  {formatCurrency(walletState.wallet.balance)}
                </div>
                <p style={{ color: '#6b7280', margin: 0 }}>
                  Moeda: {walletState.wallet.currency}
                </p>
                <p style={{ color: '#6b7280', margin: 0 }}>
                  ID: {walletState.wallet.id}
                </p>
              </>
            ) : (
              <p style={{ color: '#ef4444' }}>Erro: {walletState.error}</p>
            )}
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
                  min="0.01"
                  value={transactionForm.amount}
                  onChange={(e) => setTransactionForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  className="form-input"
                  required
                />
                <small style={{ color: '#6b7280' }}>
                  Limite: {formatCurrency(configState.businessRules.minTransactionAmount)} - {formatCurrency(configState.businessRules.maxTransactionAmount)}
                </small>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Descrição (Opcional)
                </label>
                <textarea
                  value={transactionForm.description}
                  onChange={(e) => setTransactionForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição da transação..."
                  className="form-input"
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                className={`btn ${transactionForm.type === 'CREDIT' ? 'btn-success' : 'btn-danger'}`}
                disabled={walletState.isLoading}
                style={{ alignSelf: 'flex-end' }}
              >
                {walletState.isLoading ? 'Processando...' : (transactionForm.type === 'CREDIT' ? '💰 Depositar' : '💸 Sacar')}
              </button>
            </form>
          </div>

          {/* Lista de Transações */}
          <div className="card" style={{ gridColumn: 'span 3' }}>
            <h2 style={{ marginTop: 0, color: '#1f2937' }}>Histórico de Transações</h2>
            
            {walletState.isLoading && walletState.transactions.length === 0 ? (
              <p>Carregando transações...</p>
            ) : walletState.transactions.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6b7280' }}>
                📄 Nenhuma transação encontrada
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {walletState.transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      backgroundColor: '#f9fafb',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>
                        {transaction.type === 'CREDIT' ? '💰' : '💸'}
                      </span>
                      <div>
                        <div style={{ fontWeight: '500' }}>
                          {transaction.type === 'CREDIT' ? 'Crédito' : 'Débito'}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {formatDate(transaction.timestamp)}
                        </div>
                        {transaction.description && (
                          <div style={{ fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic' }}>
                            {transaction.description}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontWeight: 'bold',
                        color: transaction.type === 'CREDIT' ? '#22c55e' : '#ef4444'
                      }}>
                        {transaction.type === 'DEBIT' ? '-' : '+'}
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {transaction.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
