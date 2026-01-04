'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionApi } from '@/lib/api/subscription';
import { useAuth } from '@/lib/hooks/useAuth';
import { Crown, CheckCircle2, Bell, LogOut, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { getInitials } from '@/lib/utils';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch subscription
  const { data: subscriptionData, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => subscriptionApi.getSubscription(),
  });

  const subscription = subscriptionData?.data?.subscription;

  // Update subscription mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => subscriptionApi.updateSubscription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast.success('Settings updated successfully');
    },
    onError: () => {
      toast.error('Failed to update settings');
    },
  });

  // Upgrade mutation
  const upgradeMutation = useMutation({
    mutationFn: () => subscriptionApi.upgradeToPremium(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast.success('🎉 Upgraded to Premium!');
      setShowUpgradeModal(false);
    },
    onError: () => {
      toast.error('Failed to upgrade');
    },
  });

  const handleToggle = (setting: string, value: boolean) => {
    updateMutation.mutate({
      notificationSettings: {
        ...subscription?.notificationSettings,
        [setting]: value,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const isPremium = subscription?.tier === 'premium';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 pt-8 pb-6 px-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-blue-100 text-sm mt-1">Manage your account and preferences</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 pb-8 space-y-4">
        {/* Profile Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xl font-bold">
              {getInitials(user?.fullName || 'U')}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{user?.fullName}</h3>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
            {isPremium && (
              <div className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-yellow-300" />
                <span className="text-xs font-semibold text-white">Premium</span>
              </div>
            )}
            {!isPremium && (
              <div className="px-3 py-1.5 bg-gray-100 rounded-full">
                <span className="text-xs font-medium text-gray-600">Free Plan</span>
              </div>
            )}
          </div>
        </div>

        {/* Subscription Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Current Plan</p>
                <p className="text-sm text-gray-600 capitalize">{subscription?.tier}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Receipt Scans</p>
                <p className="text-sm text-gray-600">
                  {isPremium
                    ? 'Unlimited'
                    : `${subscription?.receiptsScannedThisMonth || 0}/5 this month`}
                </p>
              </div>
            </div>

            {isPremium && (
              <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-purple-900">
                    Premium Benefits Active
                  </p>
                  <ul className="text-xs text-purple-700 mt-1 space-y-0.5">
                    <li>• Unlimited receipt scanning</li>
                    <li>• AI-powered insights</li>
                    <li>• Advanced analytics</li>
                  </ul>
                </div>
              </div>
            )}

            {!isPremium && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Unlock all features for $4.99/month
              </button>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>

          <div className="space-y-4">
            <NotificationToggle
              icon={<Bell className="w-5 h-5 text-blue-600" />}
              title="Spending Alerts"
              description="Get notified for unusual spending"
              enabled={subscription?.notificationSettings?.spendingAlerts ?? true}
              onChange={(value) => handleToggle('spendingAlerts', value)}
            />
            <NotificationToggle
              icon={<Bell className="w-5 h-5 text-purple-600" />}
              title="Weekly Summary"
              description="Receive weekly spending reports"
              enabled={subscription?.notificationSettings?.weeklySummary ?? true}
              onChange={(value) => handleToggle('weeklySummary', value)}
            />
            <NotificationToggle
              icon={<Bell className="w-5 h-5 text-amber-600" />}
              title="Budget Warnings"
              description="Alert when nearing budget limits"
              enabled={subscription?.notificationSettings?.budgetWarnings ?? true}
              onChange={(value) => handleToggle('budgetWarnings', value)}
            />
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => logout()}
          className="w-full py-3 bg-white hover:bg-red-50 border-2 border-red-200 text-red-600 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowUpgradeModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl mb-4">
                <Crown className="w-8 h-8 text-yellow-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Unlock Full Power</h2>
              <p className="text-gray-600">Get unlimited access to all premium features</p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">$4.99</span>
                <span className="text-gray-600">/month</span>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-6">
              {[
                'Unlimited receipt scanning',
                'Advanced AI insights & predictions',
                'Budget planning & tracking',
                'Spending forecasts',
                'Multi-currency support',
                'Custom categories',
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <button
              onClick={() => upgradeMutation.mutate()}
              disabled={upgradeMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-3"
            >
              {upgradeMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Upgrading...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Upgrade Now
                </>
              )}
            </button>

            <p className="text-xs text-center text-gray-500">
              Cancel anytime. No questions asked.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Notification Toggle Component
function NotificationToggle({
  icon,
  title,
  description,
  enabled,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-start gap-3">
        {icon}
        <div>
          <p className="font-medium text-gray-900 text-sm">{title}</p>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          enabled ? 'bg-emerald-500' : 'bg-gray-200'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
            enabled ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </div>
  );
}
