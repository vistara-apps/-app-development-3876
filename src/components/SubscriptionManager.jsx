import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { 
  CreditCard, 
  TrendingDown, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  BarChart3,
  Settings
} from 'lucide-react';
import Card from './Card';
import ListItem from './ListItem';
import PrimaryButton from './PrimaryButton';
import { aggregationService } from '../services/api';

const SubscriptionManager = ({ walletAddress, isPremium }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState([]);

  useEffect(() => {
    if (walletAddress && isPremium) {
      loadSubscriptions();
    }
  }, [walletAddress, isPremium]);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await aggregationService.getSubscriptions(walletAddress);
      setSubscriptions(data);
      generateOptimizationSuggestions(data);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateOptimizationSuggestions = (subscriptions) => {
    const suggestions = [];
    
    subscriptions.forEach(sub => {
      // Low usage score suggestions
      if (sub.usageScore < 30) {
        suggestions.push({
          id: `low_usage_${sub.id}`,
          type: 'cancel',
          severity: 'high',
          title: `Consider canceling ${sub.serviceName}`,
          description: `Only ${sub.usageScore}% usage in the last month. You could save $${sub.amount}/month.`,
          savings: sub.amount,
          subscription: sub,
        });
      } else if (sub.usageScore < 50) {
        suggestions.push({
          id: `moderate_usage_${sub.id}`,
          type: 'downgrade',
          severity: 'medium',
          title: `Consider downgrading ${sub.serviceName}`,
          description: `${sub.usageScore}% usage suggests you might benefit from a lower tier.`,
          savings: sub.amount * 0.3, // Estimated 30% savings
          subscription: sub,
        });
      }

      // Billing cycle optimization
      if (sub.billingCycle === 'monthly' && sub.usageScore > 80) {
        suggestions.push({
          id: `annual_${sub.id}`,
          type: 'annual',
          severity: 'low',
          title: `Switch ${sub.serviceName} to annual billing`,
          description: `High usage (${sub.usageScore}%) suggests annual billing could save you money.`,
          savings: sub.amount * 2, // Estimated 2 months savings per year
          subscription: sub,
        });
      }
    });

    // Duplicate service detection
    const serviceCategories = {};
    subscriptions.forEach(sub => {
      const category = categorizeService(sub.serviceName);
      if (!serviceCategories[category]) {
        serviceCategories[category] = [];
      }
      serviceCategories[category].push(sub);
    });

    Object.entries(serviceCategories).forEach(([category, subs]) => {
      if (subs.length > 1 && category !== 'utility') {
        const totalCost = subs.reduce((sum, sub) => sum + sub.amount, 0);
        suggestions.push({
          id: `duplicate_${category}`,
          type: 'consolidate',
          severity: 'medium',
          title: `Multiple ${category} subscriptions detected`,
          description: `You have ${subs.length} ${category} services costing $${totalCost.toFixed(2)}/month total.`,
          savings: totalCost * 0.4, // Estimated 40% savings by consolidating
          subscriptions: subs,
        });
      }
    });

    setOptimizationSuggestions(suggestions.sort((a, b) => b.savings - a.savings));
  };

  const categorizeService = (serviceName) => {
    const categories = {
      streaming: ['netflix', 'spotify', 'hulu', 'disney', 'amazon prime', 'youtube'],
      productivity: ['adobe', 'microsoft', 'google', 'notion', 'slack'],
      fitness: ['gym', 'peloton', 'fitness', 'yoga'],
      utility: ['internet', 'phone', 'electricity', 'water', 'gas'],
    };

    const name = serviceName.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => name.includes(keyword))) {
        return category;
      }
    }
    return 'other';
  };

  const getUsageScoreColor = (score) => {
    if (score >= 70) return 'text-green-600 bg-green-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!isPremium) {
    return (
      <Card className="text-center py-12">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Premium Feature</h3>
        <p className="text-gray-600 mb-6">
          Subscription management and optimization is available with Premium.
        </p>
        <PrimaryButton>Upgrade to Premium</PrimaryButton>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Subscription Manager</h2>
          <p className="text-white/80">Optimize your recurring payments</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
            Premium
          </span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{subscriptions.length}</p>
              <p className="text-sm text-gray-600">Active Subscriptions</p>
            </div>
          </div>
        </Card>

        <Card className="text-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                ${subscriptions.reduce((sum, sub) => sum + sub.amount, 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">Monthly Total</p>
            </div>
          </div>
        </Card>

        <Card className="text-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                ${optimizationSuggestions.reduce((sum, suggestion) => sum + suggestion.savings, 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">Potential Savings</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Optimization Suggestions */}
      {optimizationSuggestions.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
              Optimization Suggestions
            </h3>
          </div>
          
          <div className="space-y-3">
            {optimizationSuggestions.slice(0, 3).map((suggestion) => (
              <ListItem key={suggestion.id} interactive>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getSeverityIcon(suggestion.severity)}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{suggestion.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">Save ${suggestion.savings.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">per month</p>
                  </div>
                </div>
              </ListItem>
            ))}
          </div>
        </Card>
      )}

      {/* Subscriptions List */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">All Subscriptions</h3>
          <PrimaryButton size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Manage
          </PrimaryButton>
        </div>
        
        <div className="space-y-3">
          {subscriptions.map((subscription) => (
            <ListItem 
              key={subscription.id} 
              interactive
              onClick={() => setSelectedSubscription(subscription)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{subscription.serviceName}</p>
                    <div className="flex items-center space-x-3 mt-1">
                      <p className="text-sm text-gray-600">
                        Next billing: {format(parseISO(subscription.nextBillingDate), 'MMM dd, yyyy')}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getUsageScoreColor(subscription.usageScore)}`}>
                        {subscription.usageScore}% usage
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">${subscription.amount}</p>
                  <p className="text-sm text-gray-600 capitalize">{subscription.billingCycle}</p>
                </div>
              </div>
            </ListItem>
          ))}
        </div>
      </Card>

      {/* Subscription Detail Modal */}
      {selectedSubscription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">{selectedSubscription.serviceName}</h3>
              <button 
                onClick={() => setSelectedSubscription(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="font-bold text-gray-900">${selectedSubscription.amount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Billing Cycle</p>
                  <p className="font-medium text-gray-900 capitalize">{selectedSubscription.billingCycle}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Usage Score</p>
                  <p className={`font-medium ${selectedSubscription.usageScore >= 70 ? 'text-green-600' : selectedSubscription.usageScore >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {selectedSubscription.usageScore}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium text-green-600 capitalize">{selectedSubscription.status}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-2">Next Billing Date</p>
                <p className="font-medium text-gray-900">
                  {format(parseISO(selectedSubscription.nextBillingDate), 'MMMM dd, yyyy')}
                </p>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <PrimaryButton size="sm" className="flex-1">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage
                </PrimaryButton>
                <button className="flex-1 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManager;
