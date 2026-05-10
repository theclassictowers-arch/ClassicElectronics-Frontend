'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react';
import { registerUser } from '@/services/api';

const SignupPage = () => {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const user = await registerUser({
        firstName,
        lastName,
        email,
        phone,
        password,
      });
      localStorage.setItem('userToken', user.token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.removeItem('adminToken');
      router.push('/clientSide/account');
    } catch (signupError: unknown) {
      const maybeApiError = signupError as { response?: { data?: { message?: string } } };
      setError(maybeApiError.response?.data?.message || 'Unable to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl rounded-2xl border border-gray-800 bg-[#1e293b] p-6 shadow-2xl md:p-10">
        <div className="mb-8 text-center">
          <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-cyan-400">
            Customer Account
          </span>
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="mt-2 text-sm text-gray-400">Signup creates customer accounts only.</p>
        </div>

        {error ? (
          <div className="mb-6 rounded border border-red-500/50 bg-red-500/10 p-4 text-center text-sm text-red-300">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field icon={User} label="First Name" value={firstName} onChange={setFirstName} required />
            <Field icon={User} label="Last Name" value={lastName} onChange={setLastName} required />
          </div>

          <Field icon={Mail} label="Email Address" value={email} onChange={setEmail} type="email" required />
          <Field icon={Phone} label="Phone" value={phone} onChange={setPhone} />

          <div className="grid gap-4 sm:grid-cols-2">
            <PasswordField
              label="Password"
              value={password}
              onChange={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
            <PasswordField
              label="Confirm Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-cyan-600 py-4 font-bold text-white shadow-lg shadow-cyan-900/20 transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create Customer Account'}
          </button>
        </form>

        <div className="mt-6 border-t border-gray-800 pt-5 text-center text-sm text-gray-400">
          Already have an account?
          <Link href="/admin/login" className="ml-2 font-bold text-cyan-400 hover:text-cyan-300">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

type FieldProps = {
  icon: typeof User;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email';
  required?: boolean;
};

const Field = ({ icon: Icon, label, value, onChange, type = 'text', required = false }: FieldProps) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-gray-400">{label}</span>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="w-full rounded border border-gray-700 bg-[#0b1120] py-3 pl-10 pr-4 text-white transition focus:border-cyan-500 focus:outline-none"
      />
      <Icon size={18} className="absolute left-3 top-3.5 text-gray-500" />
    </div>
  </label>
);

type PasswordFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
};

const PasswordField = ({
  label,
  value,
  onChange,
  showPassword,
  setShowPassword,
}: PasswordFieldProps) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-gray-400">{label}</span>
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        minLength={6}
        className="w-full rounded border border-gray-700 bg-[#0b1120] py-3 pl-10 pr-10 text-white transition focus:border-cyan-500 focus:outline-none"
      />
      <Lock size={18} className="absolute left-3 top-3.5 text-gray-500" />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-300"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </label>
);

export default SignupPage;
