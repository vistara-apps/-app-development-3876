import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://api.paynoti.app';
const BASE_RPC_URL = process.env.VITE_BASE_RPC_URL || 'https://mainnet.base.org';

// Create API client
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Base blockchain client
const baseClient = axios.create({
  baseURL: BASE_RPC_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API interceptors for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Base Wallet Integration Service
export const baseWalletService = {
  /**
   * Fetch transaction history for a wallet address
   * @param {string} walletAddress - The wallet address to fetch transactions for
   * @param {number} limit - Number of transactions to fetch
   * @returns {Promise<Array>} Array of transactions
   */
  async getTransactionHistory(walletAddress, limit = 50) {
    try {
      // In a real implementation, this would use Base's API or a service like Alchemy
      const response = await baseClient.post('/', {
        jsonrpc: '2.0',
        method: 'eth_getTransactionCount',
        params: [walletAddress, 'latest'],
        id: 1,
      });
      
      // Mock implementation - in production, use proper Base API
      return this.mockTransactionData(walletAddress, limit);
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
      return this.mockTransactionData(walletAddress, limit);
    }
  },

  /**
   * Get wallet balance
   * @param {string} walletAddress - The wallet address
   * @returns {Promise<number>} Balance in ETH
   */
  async getWalletBalance(walletAddress) {
    try {
      const response = await baseClient.post('/', {
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [walletAddress, 'latest'],
        id: 1,
      });
      
      // Convert from wei to ETH
      const balanceWei = parseInt(response.data.result, 16);
      return balanceWei / Math.pow(10, 18);
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
      return 2.425; // Mock balance
    }
  },

  /**
   * Mock transaction data for development
   * @param {string} walletAddress - The wallet address
   * @param {number} limit - Number of transactions
   * @returns {Array} Mock transaction data
   */
  mockTransactionData(walletAddress, limit) {
    const mockTransactions = [];
    const now = new Date();
    
    for (let i = 0; i < limit; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      
      mockTransactions.push({
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        from: walletAddress,
        to: `0x${Math.random().toString(16).substr(2, 40)}`,
        value: (Math.random() * 1000).toFixed(2),
        timestamp: date.toISOString(),
        gasUsed: Math.floor(Math.random() * 100000),
        status: 'success',
      });
    }
    
    return mockTransactions;
  },
};

// Farcaster Frame Actions Service
export const farcasterService = {
  /**
   * Process frame action
   * @param {Object} actionData - Frame action data
   * @returns {Promise<Object>} Action response
   */
  async processFrameAction(actionData) {
    try {
      const response = await apiClient.post('/api/frame/actions', actionData);
      return response.data;
    } catch (error) {
      console.error('Frame action failed:', error);
      throw new Error('Failed to process frame action');
    }
  },

  /**
   * Create payment reminder frame
   * @param {Object} reminderData - Reminder configuration
   * @returns {Promise<Object>} Frame response
   */
  async createReminderFrame(reminderData) {
    try {
      const response = await apiClient.post('/api/frame/reminder', reminderData);
      return response.data;
    } catch (error) {
      console.error('Failed to create reminder frame:', error);
      throw new Error('Failed to create reminder frame');
    }
  },
};

// Push Notification Service
export const notificationService = {
  /**
   * Register device for push notifications
   * @param {string} token - Device token
   * @param {string} walletAddress - User's wallet address
   * @returns {Promise<Object>} Registration response
   */
  async registerDevice(token, walletAddress) {
    try {
      const response = await apiClient.post('/api/notifications/register', {
        token,
        walletAddress,
        platform: 'web',
      });
      return response.data;
    } catch (error) {
      console.error('Failed to register device:', error);
      throw new Error('Failed to register for notifications');
    }
  },

  /**
   * Send payment reminder notification
   * @param {Object} reminderData - Reminder details
   * @returns {Promise<Object>} Notification response
   */
  async sendPaymentReminder(reminderData) {
    try {
      const response = await apiClient.post('/api/notifications/reminder', reminderData);
      return response.data;
    } catch (error) {
      console.error('Failed to send reminder:', error);
      throw new Error('Failed to send payment reminder');
    }
  },

  /**
   * Update notification preferences
   * @param {string} walletAddress - User's wallet address
   * @param {Object} preferences - Notification preferences
   * @returns {Promise<Object>} Update response
   */
  async updatePreferences(walletAddress, preferences) {
    try {
      const response = await apiClient.put(`/api/notifications/preferences/${walletAddress}`, preferences);
      return response.data;
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw new Error('Failed to update notification preferences');
    }
  },
};

// Payment Aggregation Service
export const aggregationService = {
  /**
   * Aggregate payments from multiple sources
   * @param {string} walletAddress - User's wallet address
   * @returns {Promise<Object>} Aggregated payment data
   */
  async aggregatePayments(walletAddress) {
    try {
      const [transactions, subscriptions, upcomingPayments] = await Promise.all([
        baseWalletService.getTransactionHistory(walletAddress),
        this.getSubscriptions(walletAddress),
        this.getUpcomingPayments(walletAddress),
      ]);

      return {
        transactions,
        subscriptions,
        upcomingPayments,
        totalBalance: await baseWalletService.getWalletBalance(walletAddress),
      };
    } catch (error) {
      console.error('Failed to aggregate payments:', error);
      throw new Error('Failed to aggregate payment data');
    }
  },

  /**
   * Get user subscriptions
   * @param {string} walletAddress - User's wallet address
   * @returns {Promise<Array>} User subscriptions
   */
  async getSubscriptions(walletAddress) {
    try {
      const response = await apiClient.get(`/api/subscriptions/${walletAddress}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
      // Return mock data for development
      return [
        {
          id: '1',
          serviceName: 'Netflix',
          amount: 15.99,
          billingCycle: 'monthly',
          nextBillingDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          usageScore: 85,
        },
        {
          id: '2',
          serviceName: 'Spotify Premium',
          amount: 9.99,
          billingCycle: 'monthly',
          nextBillingDate: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          usageScore: 92,
        },
      ];
    }
  },

  /**
   * Get upcoming payments
   * @param {string} walletAddress - User's wallet address
   * @returns {Promise<Array>} Upcoming payments
   */
  async getUpcomingPayments(walletAddress) {
    try {
      const response = await apiClient.get(`/api/payments/upcoming/${walletAddress}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch upcoming payments:', error);
      // Return mock data for development
      return [
        {
          id: '1',
          serviceName: 'Adobe Creative Cloud',
          amount: 52.99,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'Software',
          status: 'upcoming',
        },
        {
          id: '2',
          serviceName: 'Internet Bill',
          amount: 79.99,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'Utility',
          status: 'upcoming',
        },
      ];
    }
  },
};

// Anomaly Detection Service
export const anomalyService = {
  /**
   * Detect spending anomalies
   * @param {Array} transactions - Transaction history
   * @returns {Promise<Array>} Detected anomalies
   */
  async detectAnomalies(transactions) {
    try {
      const response = await apiClient.post('/api/anomalies/detect', { transactions });
      return response.data;
    } catch (error) {
      console.error('Failed to detect anomalies:', error);
      // Fallback to client-side detection
      return this.clientSideAnomalyDetection(transactions);
    }
  },

  /**
   * Client-side anomaly detection
   * @param {Array} transactions - Transaction history
   * @returns {Array} Detected anomalies
   */
  clientSideAnomalyDetection(transactions) {
    const anomalies = [];
    const transactionMap = new Map();

    // Group transactions by merchant/description
    transactions.forEach(tx => {
      const key = tx.description || tx.to;
      if (!transactionMap.has(key)) {
        transactionMap.set(key, []);
      }
      transactionMap.get(key).push(tx);
    });

    // Detect duplicate charges (same amount, same merchant, within 24 hours)
    transactionMap.forEach((txs, merchant) => {
      for (let i = 0; i < txs.length - 1; i++) {
        for (let j = i + 1; j < txs.length; j++) {
          const tx1 = txs[i];
          const tx2 = txs[j];
          const timeDiff = Math.abs(new Date(tx1.timestamp) - new Date(tx2.timestamp));
          
          if (tx1.value === tx2.value && timeDiff < 24 * 60 * 60 * 1000) {
            anomalies.push({
              id: `duplicate_${tx1.hash}_${tx2.hash}`,
              type: 'duplicate_charge',
              description: `Duplicate charge detected at ${merchant}`,
              amount: parseFloat(tx1.value),
              date: tx2.timestamp,
              severity: 'medium',
              transactions: [tx1, tx2],
            });
          }
        }
      }
    });

    // Detect unusual amounts (transactions significantly higher than average)
    transactionMap.forEach((txs, merchant) => {
      if (txs.length < 3) return; // Need at least 3 transactions for comparison
      
      const amounts = txs.map(tx => parseFloat(tx.value));
      const average = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
      const threshold = average * 1.5; // 50% higher than average
      
      txs.forEach(tx => {
        const amount = parseFloat(tx.value);
        if (amount > threshold) {
          anomalies.push({
            id: `unusual_${tx.hash}`,
            type: 'unusual_amount',
            description: `${merchant} charge ${Math.round(((amount - average) / average) * 100)}% higher than usual`,
            amount,
            date: tx.timestamp,
            severity: amount > average * 2 ? 'high' : 'medium',
            transaction: tx,
          });
        }
      });
    });

    return anomalies;
  },
};

export default {
  baseWalletService,
  farcasterService,
  notificationService,
  aggregationService,
  anomalyService,
};
