'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button, Input } from '@/components/ui';
import { BookOpen, Mail, Lock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
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

        {/* Login Card */}
        <div className="bg-white rounded-sm shadow-xl border border-ink/10 p-8">
          <div className="mb-8">
            <h2 className="font-crimson font-bold text-3xl text-ink mb-2">
              Welcome Back
            </h2>
            <p className="text-ink/60 font-dm">
              Sign in to continue to your newsroom
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="journalist@newsroom.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-5 h-5" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-5 h-5" />}
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-ink/20" />
                <span className="text-sm text-ink/60 font-dm">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-ink hover:text-highlight-amber font-dm">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-ink/60 font-dm">
              Don't have an account?{' '}
              <Link href="/signup" className="text-ink font-semibold hover:text-highlight-amber">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-ink/50 font-dm mt-6">
          Protected by enterprise-grade security
        </p>
      </motion.div>
    </div>
  );
}
