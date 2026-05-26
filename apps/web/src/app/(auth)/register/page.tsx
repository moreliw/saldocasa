'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ApiError, apiJson } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [householdName, setHouseholdName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiJson('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
          householdName: householdName || undefined,
        }),
      });
      router.replace('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha no cadastro');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2 className="mb-1 text-lg font-semibold text-slate-900">Criar conta</h2>
      <p className="mb-6 text-sm text-slate-500">Comece a organizar a casa em 30 segundos.</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="name">
            Seu nome
          </label>
          <input
            id="name"
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
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
            required
            minLength={8}
            autoComplete="new-password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="mt-1 text-xs text-slate-500">Mínimo 8 caracteres.</p>
        </div>
        <div>
          <label className="label" htmlFor="household">
            Nome da casa <span className="text-slate-400">(opcional)</span>
          </label>
          <input
            id="household"
            maxLength={80}
            placeholder="Casa Principal"
            className="input"
            value={householdName}
            onChange={(e) => setHouseholdName(e.target.value)}
          />
        </div>
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Criando…' : 'Criar conta'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        Já tem conta?{' '}
        <Link href="/login" className="font-medium text-slate-900 underline-offset-4 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
