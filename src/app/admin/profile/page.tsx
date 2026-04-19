'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Camera, Save, Lock, User, Mail, Phone, MapPin } from 'lucide-react';
import { getAdminProfile, updateAdminProfile, uploadAdminProfileImage } from '@/services/api';
import { resolveAssetUrl } from '@/lib/apiConfig';

type AdminProfile = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profileImage: string;
  address: string;
};

const AdminProfilePage = () => {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const getToken = () => localStorage.getItem('adminToken') || '';

  const fetchProfile = useCallback(async () => {
    try {
      const data = await getAdminProfile(getToken());
      setProfile(data);
      setName(data.name || '');
      setPhone(data.phone || '');
      setAddress(data.address || '');
    } catch {
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await updateAdminProfile(getToken(), { name, phone, address });
      setProfile(prev => prev ? { ...prev, ...data } : prev);
      if (data.token) {
        localStorage.setItem('adminToken', data.token);
      }
      showMessage('success', 'Profile updated successfully');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to update profile'
        : 'Failed to update profile';
      showMessage('error', msg);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      showMessage('error', 'Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      const data = await updateAdminProfile(getToken(), { currentPassword, newPassword });
      if (data.token) {
        localStorage.setItem('adminToken', data.token);
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showMessage('success', 'Password changed successfully');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to change password'
        : 'Failed to change password';
      showMessage('error', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = await uploadAdminProfileImage(getToken(), file);
      setProfile(prev => prev ? { ...prev, profileImage: data.profileImage } : prev);
      showMessage('success', 'Profile image updated');
    } catch {
      showMessage('error', 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Admin Profile</h1>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
          {message.text}
        </div>
      )}

      {/* Profile Image Section */}
      <div className="bg-[#0b1120] border border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Profile Image</h2>
        <div className="flex items-center gap-6">
          <div className="relative">
            {profile?.profileImage ? (
              <img
                src={resolveAssetUrl(profile.profileImage)}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-700"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-cyan-600 flex items-center justify-center text-2xl font-bold border-2 border-gray-700">
                {profile?.name?.charAt(0)?.toUpperCase() || profile?.email?.charAt(0)?.toUpperCase() || 'A'}
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-cyan-600 hover:bg-cyan-500 rounded-full p-2 cursor-pointer transition-colors">
              <Camera size={16} />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
          <div>
            <p className="font-medium">{profile?.name || 'Admin'}</p>
            <p className="text-sm text-gray-400">{profile?.email}</p>
            {uploading && <p className="text-sm text-cyan-400 mt-1">Uploading...</p>}
          </div>
        </div>
      </div>

      {/* Profile Details Form */}
      <form onSubmit={handleProfileUpdate} className="bg-[#0b1120] border border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Profile Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1 flex items-center gap-2">
              <User size={14} /> Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none transition-colors"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1 flex items-center gap-2">
              <Mail size={14} /> Email
            </label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-gray-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1 flex items-center gap-2">
              <Phone size={14} /> Phone
            </label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none transition-colors"
              placeholder="Phone number"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1 flex items-center gap-2">
              <MapPin size={14} /> Address
            </label>
            <textarea
              value={address}
              onChange={e => setAddress(e.target.value)}
              rows={3}
              className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none transition-colors resize-none"
              placeholder="Your address"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Password Change Form */}
      <form onSubmit={handlePasswordChange} className="bg-[#0b1120] border border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Lock size={18} /> Change Password
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none transition-colors"
              placeholder="Enter current password"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none transition-colors"
              placeholder="Enter new password"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none transition-colors"
              placeholder="Confirm new password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <Lock size={16} />
            {saving ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProfilePage;
