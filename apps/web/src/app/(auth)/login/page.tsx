'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ApiError, apiJson } from '@/lib/api';

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
      await apiJson('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      router.replace('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao entrar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2 className="mb-1 text-lg font-semibold text-slate-900">Entrar</h2>
      <p className="mb-6 text-sm text-slate-500">Acesse sua casa financeira.</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="password">
            Senha
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        Não tem conta?{' '}
        <Link href="/register" className="font-medium text-slate-900 underline-offset-4 hover:underline">
          Criar agora
        </Link>
      </p>
    </div>
  );
}
