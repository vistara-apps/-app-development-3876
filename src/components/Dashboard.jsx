import React, { useState, useEffect } from 'react';
import { format, parseISO, isWithinInterval, addDays } from 'date-fns';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Calendar,
  CreditCard,
  Bell,
  Settings,
  Target,
  Zap
} from 'lucide-react';
import Card from './Card';
import ListItem from './ListItem';
import PrimaryButton from './PrimaryButton';
import NotificationBubble from './NotificationBubble';
import { mockTransactions, mockUpcomingPayments, mockSubscriptions, mockAnomalies } from '../data/mockData';
import { usePaymentContext } from '../hooks/usePaymentContext';

const Dashboard = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { createSession } = usePaymentContext();

  const totalBalance = 2425.00;
  const monthlySpending = mockTransactions
    .filter(t => t.type === 'subscription')
    .reduce((sum, t) => sum + t.amount, 0);

  const upcomingCount = mockUpcomingPayments.length;
  const anomalyCount = mockAnomalies.length;

  useEffect(() => {
    // Simulate payment due notifications
    const urgentPayments = mockUpcomingPayments.filter(payment => {
      const dueDate = parseISO(payment.dueDate);
      const twoDaysFromNow = addDays(new Date(), 2);
      return isWithinInterval(dueDate, { start: new Date(), end: twoDaysFromNow });
    });

    if (urgentPayments.length > 0) {
      setNotifications([
        {
          id: '1',
          type: 'warning',
          title: 'Payment Due Soon',
          message: `${urgentPayments[0].serviceName} payment of $${urgentPayments[0].amount} is due in 2 days.`,
        }
      ]);
    }
  }, []);

  const handleUpgradeToPremium = async () => {
    try {
      setLoading(true);
      await createSession();
      setIsPremium(true);
      setNotifications([
        {
          id: '2',
          type: 'success',
          title: 'Welcome to Premium!',
          message: 'You now have access to advanced analytics and subscription optimization.',
        }
      ]);
    } catch (error) {
      setNotifications([
        {
          id: '3',
          type: 'error',
          title: 'Payment Failed',
          message: error.message || 'Please try again or contact support.',
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const dismissNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map(notification => (
            <NotificationBubble
              key={notification.id}
              type={notification.type}
              title={notification.title}
              message={notification.message}
              onClose={() => dismissNotification(notification.id)}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          Welcome back!
        </h1>
        <p className="text-white/80 text-lg">
          Track everything, pay smarter.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="text-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${totalBalance.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total Balance</p>
            </div>
          </div>
        </Card>

        <Card className="text-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${monthlySpending.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Monthly Spending</p>
            </div>
          </div>
        </Card>

        <Card className="text-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{upcomingCount}</p>
              <p className="text-sm text-gray-600">Upcoming Bills</p>
            </div>
          </div>
        </Card>

        <Card className="text-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{anomalyCount}</p>
              <p className="text-sm text-gray-600">Anomalies</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Payments */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                Upcoming Payments
              </h2>
              <PrimaryButton size="sm">View All</PrimaryButton>
            </div>
            
            <div className="space-y-3">
              {mockUpcomingPayments.slice(0, 3).map((payment) => (
                <ListItem key={payment.id} interactive>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{payment.serviceName}</p>
                        <p className="text-sm text-gray-600">
                          Due {format(parseISO(payment.dueDate), 'MMM dd')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">${payment.amount}</p>
                      <p className="text-sm text-gray-600">{payment.category}</p>
                    </div>
                  </div>
                </ListItem>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions & Premium */}
        <div className="space-y-6">
          {/* Premium Upgrade */}
          {!isPremium && (
            <Card variant="default" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <div className="text-center">
                <Zap className="w-8 h-8 mx-auto mb-3" />
                <h3 className="text-lg font-bold mb-2">Upgrade to Premium</h3>
                <p className="text-sm text-white/80 mb-4">
                  Unlock advanced analytics, subscription optimization, and anomaly detection.
                </p>
                <PrimaryButton 
                  variant="secondary" 
                  size="sm" 
                  className="w-full"
                  loading={loading}
                  onClick={handleUpgradeToPremium}
                >
                  Upgrade for $5/month
                </PrimaryButton>
              </div>
            </Card>
          )}

          {/* Recent Anomalies */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                Recent Anomalies
              </h3>
              {isPremium && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  Premium
                </span>
              )}
            </div>
            
            {isPremium ? (
              <div className="space-y-3">
                {mockAnomalies.slice(0, 2).map((anomaly) => (
                  <ListItem key={anomaly.id}>
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        anomaly.severity === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {anomaly.description}
                        </p>
                        <p className="text-xs text-gray-600">
                          ${anomaly.amount} • {format(parseISO(anomaly.date), 'MMM dd')}
                        </p>
                      </div>
                    </div>
                  </ListItem>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600">
                  Upgrade to Premium to detect spending anomalies
                </p>
              </div>
            )}
          </Card>

          {/* Subscription Health */}
          {isPremium && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Subscription Health</h3>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  Premium
                </span>
              </div>
              
              <div className="space-y-3">
                {mockSubscriptions.slice(0, 2).map((subscription) => (
                  <ListItem key={subscription.subscriptionId}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {subscription.serviceName}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className={`w-2 h-2 rounded-full ${
                            subscription.usageScore > 70 ? 'bg-green-500' : 
                            subscription.usageScore > 40 ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <span className="text-xs text-gray-600">
                            {subscription.usageScore}% usage score
                          </span>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        ${subscription.amount}
                      </p>
                    </div>
                  </ListItem>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;