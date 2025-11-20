'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button, Input } from '@/components/ui';
import { BookOpen, Mail, Lock, User, AlertCircle, Check } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      router.push('/login?signup=success');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-editorial-gradient flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <BookOpen className="w-10 h-10 text-ink" strokeWidth={2.5} />
          <h1 className="font-newsreader font-extrabold text-3xl text-ink">
            Journo Journal
          </h1>
        </Link>

        {/* Signup Card */}
        <div className="bg-white rounded-sm shadow-xl border border-ink/10 p-8">
          <div className="mb-8">
            <h2 className="font-crimson font-bold text-3xl text-ink mb-2">
              Start Your Free Trial
            </h2>
            <p className="text-ink/60 font-dm">
              No credit card required • 14 days free
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-highlight-red/10 border border-highlight-red/30 rounded-sm p-4 mb-6 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-highlight-red flex-shrink-0 mt-0.5" />
              <p className="text-sm text-highlight-red font-dm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              name="name"
              type="text"
              placeholder="Jane Reporter"
              value={formData.name}
              onChange={handleChange}
              icon={<User className="w-5 h-5" />}
              required
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="jane@newsroom.com"
              value={formData.email}
              onChange={handleChange}
              icon={<Mail className="w-5 h-5" />}
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={handleChange}
              icon={<Lock className="w-5 h-5" />}
              required
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              icon={<Lock className="w-5 h-5" />}
              required
            />

            <div className="bg-newsprint rounded-sm p-4 space-y-2">
              <p className="text-sm font-dm font-medium text-ink mb-2">What's included:</p>
              {[
                'Unlimited notes and ideas',
                'AI auto-tagging and organization',
                'Browser extension',
                'Semantic search',
                'Team collaboration',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-editorial-green" />
                  <span className="text-sm text-ink/70 font-dm">{feature}</span>
                </div>
              ))}
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-ink/60 font-dm">
              Already have an account?{' '}
              <Link href="/login" className="text-ink font-semibold hover:text-highlight-amber">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-ink/50 font-dm mt-6">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="underline">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline">Privacy Policy</Link>
        </p>
      </motion.div>
    </div>
  );
}
