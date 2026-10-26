import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  User,
  Mail,
  Lock,
  Shield,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Calendar,
  Save,
  Loader2
} from 'lucide-react';

export default function UserProfileModal({ isOpen, onClose }) {
  const { user, updateUserProfile, fetchUserProfile, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password'

  // Form states for profile
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  // Form states for security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: '' });

  // Sync inputs with current user
  useEffect(() => {
    if (user) {
      setFirstName(user.fullName?.firstName || '');
      setLastName(user.fullName?.lastName || '');
      setEmail(user.email || '');
    }
  }, [user, isOpen]);

  // Fetch fresh profile details from API on modal open
  useEffect(() => {
    if (isOpen) {
      fetchUserProfile();
      setFeedback({ type: null, message: '' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const initials = (() => {
    if (!user) return 'U';
    const first = (user.fullName?.firstName || firstName || '').charAt(0);
    const last = (user.fullName?.lastName || lastName || '').charAt(0);
    return (first + last).toUpperCase() || 'U';
  })();

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setFeedback({ type: null, message: '' });

    if (!firstName.trim() || !lastName.trim()) {
      setFeedback({ type: 'error', message: 'First and last name are required.' });
      return;
    }

    if (!email.trim()) {
      setFeedback({ type: 'error', message: 'Email address is required.' });
      return;
    }

    setIsSubmitting(true);
    const res = await updateUserProfile({
      fullName: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      },
      email: email.trim().toLowerCase(),
    });
    setIsSubmitting(false);

    if (res.success) {
      setFeedback({ type: 'success', message: res.message || 'Profile updated successfully!' });
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to update profile.' });
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setFeedback({ type: null, message: '' });

    if (!currentPassword) {
      setFeedback({ type: 'error', message: 'Current password is required.' });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setFeedback({ type: 'error', message: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    setIsSubmitting(true);
    const res = await updateUserProfile({
      currentPassword,
      newPassword,
    });
    setIsSubmitting(false);

    if (res.success) {
      setFeedback({ type: 'success', message: res.message || 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to update password.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      {/* Modal Card */}
      <div
        className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">User Profile & Settings</h3>
              <p className="text-xs text-zinc-400">Manage your credentials and personal info</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Card Summary */}
        <div className="p-5 bg-gradient-to-r from-zinc-950/80 via-zinc-900 to-zinc-950/80 border-b border-zinc-800 flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-400 border-2 border-emerald-500/40 flex items-center justify-center font-bold text-lg shrink-0 shadow-lg shadow-emerald-500/10">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-zinc-100 truncate">
                {user?.fullName?.firstName} {user?.fullName?.lastName}
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                Active Member
              </span>
            </div>
            <p className="text-xs text-zinc-400 truncate mt-0.5">{user?.email}</p>
            <p className="text-[10px] text-zinc-500 font-mono mt-1 truncate">ID: {user?.id || user?._id || 'Standard'}</p>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-zinc-800 px-5 pt-3 gap-4 bg-zinc-950/30">
          <button
            type="button"
            onClick={() => {
              setActiveTab('profile');
              setFeedback({ type: null, message: '' });
            }}
            className={`pb-3 text-xs font-medium border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Profile Details</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('password');
              setFeedback({ type: null, message: '' });
            }}
            className={`pb-3 text-xs font-medium border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'password'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>Change Password</span>
          </button>
        </div>

        {/* Body & Forms */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Feedback Banners */}
          {feedback.message && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2.5 ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First Name"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last Name"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  New Password (min 6 characters)
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="h-3.5 w-3.5" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
