'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError, apiJson } from '@/lib/api';

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiJson<{ user: { isSuperAdmin?: boolean } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      toast.success('Bem-vindo de volta!');
      router.replace(res.user.isSuperAdmin ? '/admin' : '/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao entrar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.h2
        variants={item}
        className="font-display text-3xl font-semibold tracking-tight text-slate-900"
      >
        Entrar
      </motion.h2>

      <motion.form variants={item} onSubmit={onSubmit} className="mt-8 space-y-5">
        <motion.div variants={item}>
          <Label htmlFor="email">E-mail</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="pl-9"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
            />
          </div>
        </motion.div>

        <motion.div variants={item}>
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
              className="pl-9"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </motion.div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-inset ring-rose-200"
          >
            {error}
          </motion.p>
        )}

        <motion.div variants={item}>
          <Button type="submit" loading={loading} className="w-full">
            Entrar
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </motion.form>

      <motion.p variants={item} className="mt-8 text-center text-sm text-slate-600">
        Não tem conta?{' '}
        <Link
          href="/register"
          className="font-medium text-slate-900 underline-offset-4 hover:underline"
        >
          Criar agora
        </Link>
      </motion.p>
    </motion.div>
  );
}
