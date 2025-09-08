import React, { useState, useEffect } from 'react';
import { format, parseISO, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Calendar,
  DollarSign,
  AlertTriangle,
  Target,
  Filter,
  Download
} from 'lucide-react';
import Card from './Card';
import PrimaryButton from './PrimaryButton';
import { aggregationService, anomalyService } from '../services/api';

const Analytics = ({ walletAddress, isPremium }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d'); // 7d, 30d, 90d, 1y
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [spendingTrends, setSpendingTrends] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [anomalies, setAnomalies] = useState([]);

  useEffect(() => {
    if (walletAddress && isPremium) {
      loadAnalytics();
    }
  }, [walletAddress, isPremium, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch aggregated payment data
      const paymentData = await aggregationService.aggregatePayments(walletAddress);
      
      // Process analytics
      const analytics = processAnalyticsData(paymentData, timeRange);
      setAnalyticsData(analytics);
      
      // Generate spending trends
      const trends = generateSpendingTrends(paymentData.transactions, timeRange);
      setSpendingTrends(trends);
      
      // Generate category breakdown
      const categories = generateCategoryBreakdown(paymentData.transactions);
      setCategoryBreakdown(categories);
      
      // Detect anomalies
      const detectedAnomalies = await anomalyService.detectAnomalies(paymentData.transactions);
      setAnomalies(detectedAnomalies);
      
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (paymentData, timeRange) => {
    const { transactions, subscriptions } = paymentData;
    const now = new Date();
    const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const startDate = subDays(now, daysBack);
    
    // Filter transactions by time range
    const filteredTransactions = transactions.filter(tx => 
      new Date(tx.timestamp) >= startDate
    );
    
    // Calculate metrics
    const totalSpent = filteredTransactions.reduce((sum, tx) => sum + parseFloat(tx.value), 0);
    const avgDailySpend = totalSpent / daysBack;
    const transactionCount = filteredTransactions.length;
    
    // Calculate previous period for comparison
    const prevStartDate = subDays(startDate, daysBack);
    const prevTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.timestamp);
      return txDate >= prevStartDate && txDate < startDate;
    });
    const prevTotalSpent = prevTransactions.reduce((sum, tx) => sum + parseFloat(tx.value), 0);
    const spendingChange = prevTotalSpent > 0 ? ((totalSpent - prevTotalSpent) / prevTotalSpent) * 100 : 0;
    
    // Subscription metrics
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
    const monthlyRecurring = activeSubscriptions.reduce((sum, sub) => sum + sub.amount, 0);
    const annualProjection = monthlyRecurring * 12;
    
    return {
      totalSpent,
      avgDailySpend,
      transactionCount,
      spendingChange,
      monthlyRecurring,
      annualProjection,
      activeSubscriptions: activeSubscriptions.length,
      timeRange: daysBack,
    };
  };

  const generateSpendingTrends = (transactions, timeRange) => {
    const now = new Date();
    const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const startDate = subDays(now, daysBack);
    
    // Create daily spending data
    const dailySpending = {};
    const dateRange = eachDayOfInterval({ start: startDate, end: now });
    
    // Initialize all dates with 0
    dateRange.forEach(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      dailySpending[dateKey] = 0;
    });
    
    // Aggregate spending by day
    transactions.forEach(tx => {
      const txDate = new Date(tx.timestamp);
      if (txDate >= startDate) {
        const dateKey = format(txDate, 'yyyy-MM-dd');
        dailySpending[dateKey] += parseFloat(tx.value);
      }
    });
    
    // Convert to chart data
    return Object.entries(dailySpending).map(([date, amount]) => ({
      date,
      amount: parseFloat(amount.toFixed(2)),
      formattedDate: format(parseISO(date), 'MMM dd'),
    }));
  };

  const generateCategoryBreakdown = (transactions) => {
    const categories = {};
    
    transactions.forEach(tx => {
      const category = categorizeTransaction(tx);
      if (!categories[category]) {
        categories[category] = {
          name: category,
          amount: 0,
          count: 0,
          color: getCategoryColor(category),
        };
      }
      categories[category].amount += parseFloat(tx.value);
      categories[category].count += 1;
    });
    
    // Convert to array and sort by amount
    return Object.values(categories)
      .sort((a, b) => b.amount - a.amount)
      .map(cat => ({
        ...cat,
        percentage: 0, // Will be calculated after we have total
      }));
  };

  const categorizeTransaction = (transaction) => {
    const description = (transaction.description || transaction.to || '').toLowerCase();
    
    if (description.includes('netflix') || description.includes('spotify') || description.includes('hulu')) {
      return 'Entertainment';
    }
    if (description.includes('grocery') || description.includes('food') || description.includes('restaurant')) {
      return 'Food & Dining';
    }
    if (description.includes('gas') || description.includes('fuel') || description.includes('uber') || description.includes('lyft')) {
      return 'Transportation';
    }
    if (description.includes('electricity') || description.includes('water') || description.includes('internet') || description.includes('phone')) {
      return 'Utilities';
    }
    if (description.includes('amazon') || description.includes('shopping') || description.includes('store')) {
      return 'Shopping';
    }
    if (description.includes('gym') || description.includes('fitness') || description.includes('health')) {
      return 'Health & Fitness';
    }
    
    return 'Other';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Entertainment': '#8B5CF6',
      'Food & Dining': '#10B981',
      'Transportation': '#F59E0B',
      'Utilities': '#EF4444',
      'Shopping': '#3B82F6',
      'Health & Fitness': '#EC4899',
      'Other': '#6B7280',
    };
    return colors[category] || '#6B7280';
  };

  const exportData = () => {
    const data = {
      analytics: analyticsData,
      trends: spendingTrends,
      categories: categoryBreakdown,
      anomalies,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paynoti-analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isPremium) {
    return (
      <Card className="text-center py-12">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Premium Feature</h3>
        <p className="text-gray-600 mb-6">
          Advanced analytics and spending insights are available with Premium.
        </p>
        <PrimaryButton>Upgrade to Premium</PrimaryButton>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate category percentages
  const totalCategorySpending = categoryBreakdown.reduce((sum, cat) => sum + cat.amount, 0);
  const categoriesWithPercentages = categoryBreakdown.map(cat => ({
    ...cat,
    percentage: totalCategorySpending > 0 ? (cat.amount / totalCategorySpending) * 100 : 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
          <p className="text-white/80">Insights into your spending patterns</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
            Premium
          </span>
          <PrimaryButton size="sm" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </PrimaryButton>
        </div>
      </div>

      {/* Time Range Filter */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Time Range</h3>
          <div className="flex space-x-2">
            {[
              { value: '7d', label: '7 Days' },
              { value: '30d', label: '30 Days' },
              { value: '90d', label: '90 Days' },
              { value: '1y', label: '1 Year' },
            ].map(range => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  timeRange === range.value
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${analyticsData?.totalSpent.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Total Spent</p>
              <div className="flex items-center justify-center mt-1">
                {analyticsData?.spendingChange > 0 ? (
                  <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
                )}
                <span className={`text-xs ${analyticsData?.spendingChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {Math.abs(analyticsData?.spendingChange || 0).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="text-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${analyticsData?.avgDailySpend.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Daily Average</p>
            </div>
          </div>
        </Card>

        <Card className="text-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{analyticsData?.transactionCount}</p>
              <p className="text-sm text-gray-600">Transactions</p>
            </div>
          </div>
        </Card>

        <Card className="text-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{anomalies.length}</p>
              <p className="text-sm text-gray-600">Anomalies</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Spending Trends Chart */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
            Spending Trends
          </h3>
        </div>
        
        <div className="h-64 flex items-end space-x-1">
          {spendingTrends.map((day, index) => {
            const maxAmount = Math.max(...spendingTrends.map(d => d.amount));
            const height = maxAmount > 0 ? (day.amount / maxAmount) * 100 : 0;
            
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-purple-500 to-purple-300 rounded-t-sm transition-all duration-300 hover:from-purple-600 hover:to-purple-400"
                  style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0px' }}
                  title={`${day.formattedDate}: $${day.amount}`}
                />
                {index % Math.ceil(spendingTrends.length / 7) === 0 && (
                  <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
                    {day.formattedDate}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-purple-600" />
              Spending by Category
            </h3>
          </div>
          
          <div className="space-y-4">
            {categoriesWithPercentages.slice(0, 6).map((category) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium text-gray-900">{category.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">${category.amount.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">{category.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Subscription Analysis */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Subscription Analysis</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Monthly Recurring</span>
              <span className="font-bold text-gray-900">${analyticsData?.monthlyRecurring.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Annual Projection</span>
              <span className="font-bold text-gray-900">${analyticsData?.annualProjection.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Active Subscriptions</span>
              <span className="font-bold text-gray-900">{analyticsData?.activeSubscriptions}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Anomalies */}
      {anomalies.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
              Recent Anomalies
            </h3>
          </div>
          
          <div className="space-y-3">
            {anomalies.slice(0, 5).map((anomaly) => (
              <div key={anomaly.id} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  anomaly.severity === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{anomaly.description}</p>
                  <p className="text-sm text-gray-600">
                    ${anomaly.amount} • {format(parseISO(anomaly.date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Analytics;
