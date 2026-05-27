'use client';

import { CheckCircle2, Home, Loader2, Mail, XCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError, apiJson } from '@/lib/api';
import type { InvitePreview, SessionUser } from '@/lib/types';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function AcceptInvitePage({ params }: PageProps) {
  const { token } = use(params);
  const router = useRouter();
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [me, setMe] = useState<SessionUser | null>(null);
  const [mode, setMode] = useState<'choose' | 'login' | 'register'>('choose');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiJson<InvitePreview>(`/invites/${token}`).then(setPreview).catch(() => setPreview({ valid: false, reason: 'not_found' }));
    apiJson<{ user: SessionUser }>('/auth/me')
      .then((d) => setMe(d.user))
      .catch(() => undefined);
  }, [token]);

  useEffect(() => {
    if (preview?.email) setEmail(preview.email);
  }, [preview]);

  async function acceptLogged() {
    setLoading(true);
    try {
      await apiJson('/auth/accept-invite', { method: 'POST', body: JSON.stringify({ token }) });
      toast.success('Você entrou na casa!');
      router.replace('/dashboard');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro');
    } finally {
      setLoading(false);
    }
  }

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiJson('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      await apiJson('/auth/accept-invite', { method: 'POST', body: JSON.stringify({ token }) });
      toast.success('Bem-vindo!');
      router.replace('/dashboard');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro');
    } finally {
      setLoading(false);
    }
  }

  async function register(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiJson('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, inviteToken: token }),
      });
      toast.success('Conta criada! Bem-vindo à casa.');
      router.replace('/dashboard');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro');
    } finally {
      setLoading(false);
    }
  }

  if (preview === null) {
    return (
      <Centered>
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </Centered>
    );
  }

  if (!preview.valid) {
    const msg =
      preview.reason === 'expired'
        ? 'Este convite expirou.'
        : preview.reason === 'used'
        ? 'Este convite já foi utilizado.'
        : 'Convite não encontrado.';
    return (
      <Centered>
        <div className="surface mx-auto max-w-sm p-8 text-center">
          <XCircle className="mx-auto h-10 w-10 text-rose-500" />
          <h1 className="mt-4 font-display text-xl font-semibold text-slate-900">Convite inválido</h1>
          <p className="mt-2 text-sm text-slate-600">{msg}</p>
          <Button asChild className="mt-6">
            <Link href="/login">Ir para o login</Link>
          </Button>
        </div>
      </Centered>
    );
  }

  return (
    <Centered>
      <div className="surface mx-auto w-full max-w-md p-8 animate-fade-in-up">
        <div className="flex flex-col items-center text-center">
          <Image src="/brand/logo-mark.png" alt="" width={56} height={56} />
          <h1 className="mt-4 font-display text-xl font-semibold text-slate-900">
            Você foi convidado para
          </h1>
          <div className="mt-1 inline-flex items-center gap-2 text-base font-medium text-slate-700">
            <Home className="h-4 w-4 text-slate-400" />
            {preview.householdName}
          </div>
          <div className="mt-3 text-xs text-slate-500">
            <Mail className="mr-1 inline h-3 w-3" />
            {preview.email}
          </div>
        </div>

        {me ? (
          <div className="mt-8 space-y-4">
            <p className="text-center text-sm text-slate-600">
              Você está logado como <strong>{me.name}</strong> ({me.email}).
            </p>
            <Button onClick={acceptLogged} loading={loading} className="w-full">
              <CheckCircle2 className="h-4 w-4" />
              Aceitar e entrar na casa
            </Button>
          </div>
        ) : mode === 'choose' ? (
          <div className="mt-8 space-y-3">
            <Button onClick={() => setMode('register')} className="w-full">
              Criar conta e entrar
            </Button>
            <Button onClick={() => setMode('login')} variant="secondary" className="w-full">
              Já tenho conta
            </Button>
          </div>
        ) : mode === 'register' ? (
          <form onSubmit={register} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="r-name">Seu nome</Label>
              <Input id="r-name" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="r-email">E-mail</Label>
              <Input id="r-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="r-pwd">Senha</Label>
              <Input id="r-pwd" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" loading={loading} className="w-full">
              Criar conta e entrar
            </Button>
            <button
              type="button"
              onClick={() => setMode('choose')}
              className="block w-full text-center text-sm text-slate-500 hover:text-slate-700"
            >
              ← Voltar
            </button>
          </form>
        ) : (
          <form onSubmit={login} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="l-email">E-mail</Label>
              <Input id="l-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="l-pwd">Senha</Label>
              <Input id="l-pwd" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" loading={loading} className="w-full">
              Entrar e aceitar
            </Button>
            <button
              type="button"
              onClick={() => setMode('choose')}
              className="block w-full text-center text-sm text-slate-500 hover:text-slate-700"
            >
              ← Voltar
            </button>
          </form>
        )}
      </div>
    </Centered>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      {children}
    </div>
  );
}
