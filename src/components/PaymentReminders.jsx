import React, { useState, useEffect } from 'react';
import { format, parseISO, differenceInDays, addDays, isWithinInterval } from 'date-fns';
import { 
  Bell, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Settings,
  Plus,
  Edit,
  Trash2,
  BellRing
} from 'lucide-react';
import Card from './Card';
import ListItem from './ListItem';
import PrimaryButton from './PrimaryButton';
import NotificationBubble from './NotificationBubble';
import { notificationService, farcasterService } from '../services/api';

const PaymentReminders = ({ walletAddress, upcomingPayments }) => {
  const [reminders, setReminders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: true,
    push: true,
    frame: false,
    advanceDays: [1, 3, 7], // Days before due date to send reminders
  });

  useEffect(() => {
    if (walletAddress) {
      loadReminders();
      checkForDuePayments();
    }
  }, [walletAddress, upcomingPayments]);

  const loadReminders = async () => {
    try {
      // In a real implementation, this would fetch from the API
      const mockReminders = [
        {
          id: '1',
          paymentId: '1',
          serviceName: 'Adobe Creative Cloud',
          amount: 52.99,
          dueDate: '2024-09-10T00:00:00Z',
          reminderDays: [1, 3],
          isActive: true,
          lastNotified: null,
        },
        {
          id: '2',
          paymentId: '2',
          serviceName: 'Internet Bill',
          amount: 79.99,
          dueDate: '2024-09-13T00:00:00Z',
          reminderDays: [1, 7],
          isActive: true,
          lastNotified: null,
        },
      ];
      setReminders(mockReminders);
    } catch (error) {
      console.error('Failed to load reminders:', error);
    }
  };

  const checkForDuePayments = () => {
    const now = new Date();
    const urgentNotifications = [];

    upcomingPayments.forEach(payment => {
      const dueDate = parseISO(payment.dueDate);
      const daysUntilDue = differenceInDays(dueDate, now);

      // Check if payment is due soon and needs notification
      if (daysUntilDue <= 7 && daysUntilDue >= 0) {
        const reminder = reminders.find(r => r.paymentId === payment.id);
        
        if (reminder && reminder.isActive && reminder.reminderDays.includes(daysUntilDue)) {
          urgentNotifications.push({
            id: `reminder_${payment.id}_${daysUntilDue}`,
            type: daysUntilDue <= 1 ? 'warning' : 'info',
            title: daysUntilDue === 0 ? 'Payment Due Today!' : `Payment Due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`,
            message: `${payment.serviceName} payment of $${payment.amount} is due ${daysUntilDue === 0 ? 'today' : `on ${format(dueDate, 'MMM dd')}`}.`,
            payment,
            daysUntilDue,
          });
        }
      }

      // Check for overdue payments
      if (daysUntilDue < 0) {
        urgentNotifications.push({
          id: `overdue_${payment.id}`,
          type: 'error',
          title: 'Payment Overdue!',
          message: `${payment.serviceName} payment of $${payment.amount} was due ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) > 1 ? 's' : ''} ago.`,
          payment,
          daysUntilDue,
        });
      }
    });

    setNotifications(urgentNotifications);
  };

  const createReminder = async (reminderData) => {
    try {
      // In a real implementation, this would call the API
      const newReminder = {
        id: Date.now().toString(),
        ...reminderData,
        isActive: true,
        lastNotified: null,
      };

      setReminders([...reminders, newReminder]);
      
      // Send notification to register the reminder
      if (notificationPreferences.push) {
        await notificationService.sendPaymentReminder({
          walletAddress,
          reminder: newReminder,
          type: 'reminder_created',
        });
      }

      // Create Farcaster frame if enabled
      if (notificationPreferences.frame) {
        await farcasterService.createReminderFrame({
          walletAddress,
          reminder: newReminder,
        });
      }

      setShowReminderForm(false);
      setNotifications([...notifications, {
        id: `created_${newReminder.id}`,
        type: 'success',
        title: 'Reminder Created',
        message: `Payment reminder set for ${reminderData.serviceName}.`,
      }]);
    } catch (error) {
      console.error('Failed to create reminder:', error);
      setNotifications([...notifications, {
        id: `error_${Date.now()}`,
        type: 'error',
        title: 'Failed to Create Reminder',
        message: error.message || 'Please try again.',
      }]);
    }
  };

  const updateReminder = async (reminderId, updates) => {
    try {
      setReminders(reminders.map(r => 
        r.id === reminderId ? { ...r, ...updates } : r
      ));
      setEditingReminder(null);
    } catch (error) {
      console.error('Failed to update reminder:', error);
    }
  };

  const deleteReminder = async (reminderId) => {
    try {
      setReminders(reminders.filter(r => r.id !== reminderId));
      setNotifications([...notifications, {
        id: `deleted_${reminderId}`,
        type: 'info',
        title: 'Reminder Deleted',
        message: 'Payment reminder has been removed.',
      }]);
    } catch (error) {
      console.error('Failed to delete reminder:', error);
    }
  };

  const markAsPaid = async (paymentId) => {
    try {
      // In a real implementation, this would update the payment status
      setNotifications(notifications.filter(n => !n.id.includes(paymentId)));
      
      setNotifications([...notifications.filter(n => !n.id.includes(paymentId)), {
        id: `paid_${paymentId}`,
        type: 'success',
        title: 'Payment Marked as Paid',
        message: 'Thank you! We\'ve updated your payment status.',
      }]);
    } catch (error) {
      console.error('Failed to mark as paid:', error);
    }
  };

  const dismissNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const updateNotificationPreferences = async (preferences) => {
    try {
      await notificationService.updatePreferences(walletAddress, preferences);
      setNotificationPreferences(preferences);
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  const getReminderStatusColor = (reminder) => {
    const dueDate = parseISO(reminder.dueDate);
    const daysUntilDue = differenceInDays(dueDate, new Date());
    
    if (daysUntilDue < 0) return 'text-red-600 bg-red-100';
    if (daysUntilDue <= 1) return 'text-orange-600 bg-orange-100';
    if (daysUntilDue <= 3) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <div className="space-y-6">
      {/* Active Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map(notification => (
            <NotificationBubble
              key={notification.id}
              type={notification.type}
              title={notification.title}
              message={notification.message}
              onClose={() => dismissNotification(notification.id)}
              actions={notification.payment && (
                <div className="flex space-x-2 mt-3">
                  <PrimaryButton 
                    size="sm" 
                    onClick={() => markAsPaid(notification.payment.id)}
                  >
                    Mark as Paid
                  </PrimaryButton>
                  <button 
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                    onClick={() => dismissNotification(notification.id)}
                  >
                    Dismiss
                  </button>
                </div>
              )}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Payment Reminders</h2>
          <p className="text-white/80">Never miss a payment again</p>
        </div>
        <PrimaryButton onClick={() => setShowReminderForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Reminder
        </PrimaryButton>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{reminders.filter(r => r.isActive).length}</p>
              <p className="text-sm text-gray-600">Active Reminders</p>
            </div>
          </div>
        </Card>

        <Card className="text-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.filter(n => n.type === 'warning' || n.type === 'error').length}
              </p>
              <p className="text-sm text-gray-600">Urgent Payments</p>
            </div>
          </div>
        </Card>

        <Card className="text-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {upcomingPayments.length - notifications.filter(n => n.daysUntilDue <= 7).length}
              </p>
              <p className="text-sm text-gray-600">On Track</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Reminders List */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <BellRing className="w-5 h-5 mr-2 text-purple-600" />
            Your Reminders
          </h3>
          <button 
            className="text-sm text-purple-600 hover:text-purple-800 flex items-center"
            onClick={() => setShowReminderForm(true)}
          >
            <Settings className="w-4 h-4 mr-1" />
            Settings
          </button>
        </div>
        
        {reminders.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No payment reminders set up yet.</p>
            <PrimaryButton onClick={() => setShowReminderForm(true)}>
              Create Your First Reminder
            </PrimaryButton>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => {
              const dueDate = parseISO(reminder.dueDate);
              const daysUntilDue = differenceInDays(dueDate, new Date());
              
              return (
                <ListItem key={reminder.id} interactive>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{reminder.serviceName}</p>
                        <div className="flex items-center space-x-3 mt-1">
                          <p className="text-sm text-gray-600">
                            Due {format(dueDate, 'MMM dd, yyyy')}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full ${getReminderStatusColor(reminder)}`}>
                            {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` :
                             daysUntilDue === 0 ? 'Due today' :
                             `${daysUntilDue} days left`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="font-bold text-gray-900">${reminder.amount}</p>
                        <p className="text-xs text-gray-500">
                          Reminders: {reminder.reminderDays.join(', ')} days before
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => setEditingReminder(reminder)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteReminder(reminder.id)}
                          className="p-2 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </ListItem>
              );
            })}
          </div>
        )}
      </Card>

      {/* Reminder Form Modal */}
      {(showReminderForm || editingReminder) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingReminder ? 'Edit Reminder' : 'Create Reminder'}
              </h3>
              <button 
                onClick={() => {
                  setShowReminderForm(false);
                  setEditingReminder(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <ReminderForm
              reminder={editingReminder}
              upcomingPayments={upcomingPayments}
              onSubmit={editingReminder ? 
                (data) => updateReminder(editingReminder.id, data) : 
                createReminder
              }
              onCancel={() => {
                setShowReminderForm(false);
                setEditingReminder(null);
              }}
            />
          </Card>
        </div>
      )}
    </div>
  );
};

// Reminder Form Component
const ReminderForm = ({ reminder, upcomingPayments, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    paymentId: reminder?.paymentId || '',
    serviceName: reminder?.serviceName || '',
    amount: reminder?.amount || '',
    dueDate: reminder?.dueDate || '',
    reminderDays: reminder?.reminderDays || [1, 3],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const toggleReminderDay = (day) => {
    const days = formData.reminderDays.includes(day) 
      ? formData.reminderDays.filter(d => d !== day)
      : [...formData.reminderDays, day].sort((a, b) => a - b);
    
    setFormData({ ...formData, reminderDays: days });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Payment
        </label>
        <select
          value={formData.paymentId}
          onChange={(e) => {
            const payment = upcomingPayments.find(p => p.id === e.target.value);
            setFormData({
              ...formData,
              paymentId: e.target.value,
              serviceName: payment?.serviceName || '',
              amount: payment?.amount || '',
              dueDate: payment?.dueDate || '',
            });
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          required
        >
          <option value="">Choose a payment...</option>
          {upcomingPayments.map(payment => (
            <option key={payment.id} value={payment.id}>
              {payment.serviceName} - ${payment.amount}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reminder Days (days before due date)
        </label>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 5, 7, 14].map(day => (
            <button
              key={day}
              type="button"
              onClick={() => toggleReminderDay(day)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                formData.reminderDays.includes(day)
                  ? 'bg-purple-100 border-purple-300 text-purple-700'
                  : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {day} day{day > 1 ? 's' : ''}
            </button>
          ))}
        </div>
      </div>

      <div className="flex space-x-3 pt-4">
        <PrimaryButton type="submit" className="flex-1">
          {reminder ? 'Update Reminder' : 'Create Reminder'}
        </PrimaryButton>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default PaymentReminders;
