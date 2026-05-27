'use client';

import { motion } from 'framer-motion';
import { Crown, Home, Mail, Shield, User, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError, apiJson } from '@/lib/api';
import { cn } from '@/lib/cn';
import { formatDate, formatDateLong } from '@/lib/format';
import type { HouseholdInvite, HouseholdMember, SessionHousehold, SessionUser } from '@/lib/types';

type Tab = 'profile' | 'family' | 'about';

interface SessionResponse {
  user: SessionUser;
  household: SessionHousehold;
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('profile');

  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" description="Perfil, família e detalhes da casa." />

      <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-card">
        <TabBtn id="profile" current={tab} onSelect={setTab} icon={User}>Perfil</TabBtn>
        <TabBtn id="family" current={tab} onSelect={setTab} icon={Users}>Família</TabBtn>
        <TabBtn id="about" current={tab} onSelect={setTab} icon={Home}>Sobre a casa</TabBtn>
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {tab === 'profile' && <ProfileTab />}
        {tab === 'family' && <FamilyTab />}
        {tab === 'about' && <AboutTab />}
      </motion.div>
    </div>
  );
}

function TabBtn({
  id,
  current,
  onSelect,
  icon: Icon,
  children,
}: {
  id: Tab;
  current: Tab;
  onSelect: (t: Tab) => void;
  icon: typeof User;
  children: React.ReactNode;
}) {
  const active = current === id;
  return (
    <button
      onClick={() => onSelect(id)}
      className={cn(
        'relative inline-flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors',
        active ? 'text-white' : 'text-slate-600 hover:text-slate-900',
      )}
    >
      {active && (
        <motion.span
          layoutId="settingsTab"
          className="absolute inset-0 rounded-lg bg-brand-900"
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        />
      )}
      <span className="relative inline-flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {children}
      </span>
    </button>
  );
}

function ProfileTab() {
  const [me, setMe] = useState<SessionResponse | null>(null);
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  useEffect(() => {
    apiJson<SessionResponse>('/auth/me').then((d) => {
      setMe(d);
      setName(d.user.name);
    });
  }, []);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setSavingName(true);
    try {
      await apiJson('/auth/me', { method: 'PATCH', body: JSON.stringify({ name }) });
      toast.success('Nome atualizado');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro');
    } finally {
      setSavingName(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setSavingPass(true);
    try {
      await apiJson('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setCurrentPassword('');
      setNewPassword('');
      toast.success('Senha atualizada');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro');
    } finally {
      setSavingPass(false);
    }
  }

  if (!me) return <Skeleton className="h-64" />;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Seus dados</CardTitle>
          <CardDescription>Atualize seu nome de exibição.</CardDescription>
        </CardHeader>
        <form onSubmit={saveName} className="space-y-4 px-6 pb-6">
          <div>
            <Label htmlFor="p-email">E-mail</Label>
            <Input id="p-email" value={me.user.email} disabled />
          </div>
          <div>
            <Label htmlFor="p-name">Nome</Label>
            <Input
              id="p-name"
              required
              minLength={2}
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={savingName} disabled={name === me.user.name}>
              Salvar
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Senha</CardTitle>
          <CardDescription>Mínimo 8 caracteres.</CardDescription>
        </CardHeader>
        <form onSubmit={savePassword} className="space-y-4 px-6 pb-6">
          <div>
            <Label htmlFor="p-current">Senha atual</Label>
            <Input
              id="p-current"
              type="password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="p-new">Nova senha</Label>
            <Input
              id="p-new"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={savingPass} disabled={!currentPassword || newPassword.length < 8}>
              Alterar senha
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function FamilyTab() {
  const [members, setMembers] = useState<HouseholdMember[] | null>(null);
  const [invites, setInvites] = useState<HouseholdInvite[] | null>(null);
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  async function load() {
    try {
      const [m, i] = await Promise.all([
        apiJson<HouseholdMember[]>('/households/members'),
        apiJson<HouseholdInvite[]>('/households/invites'),
      ]);
      setMembers(m);
      setInvites(i);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro');
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    try {
      await apiJson<HouseholdInvite>('/households/invites', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setEmail('');
      toast.success('Convite criado', { description: 'Copie o link e envie para a pessoa.' });
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro');
    } finally {
      setInviting(false);
    }
  }

  async function revoke(id: string) {
    if (!confirm('Revogar este convite?')) return;
    try {
      await apiJson(`/households/invites/${id}`, { method: 'DELETE' });
      toast.success('Convite revogado');
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro');
    }
  }

  function copyLink(token: string) {
    const url = `${window.location.origin}/accept-invite/${token}`;
    void navigator.clipboard.writeText(url);
    toast.success('Link copiado');
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Membros</CardTitle>
          <CardDescription>Quem tem acesso aos dados desta casa.</CardDescription>
        </CardHeader>
        {members === null ? (
          <Skeleton className="mx-6 mb-6 h-32" />
        ) : (
          <ul className="divide-y divide-slate-100">
            {members.map((m) => (
              <li key={m.id} className="flex items-center gap-3 px-6 py-3.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-600">
                  {initials(m.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-slate-900">{m.name}</span>
                    {m.role === 'OWNER' && (
                      <Badge tone="warning">
                        <Crown className="h-3 w-3" />
                        Dono
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">{m.email}</div>
                </div>
                <div className="text-xs text-slate-500">desde {formatDate(m.joinedAt)}</div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Convidar alguém</CardTitle>
          <CardDescription>O convite vale por 7 dias.</CardDescription>
        </CardHeader>
        <form onSubmit={invite} className="space-y-3 px-6 pb-4">
          <div>
            <Label htmlFor="i-email">E-mail</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="i-email"
                type="email"
                required
                placeholder="familia@email.com"
                className="pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" loading={inviting} className="w-full">
            Gerar convite
          </Button>
        </form>

        {invites && invites.length > 0 && (
          <div className="border-t border-slate-100">
            <div className="px-6 py-3 text-xs uppercase tracking-wide text-slate-500">
              Pendentes
            </div>
            <ul className="divide-y divide-slate-100">
              {invites.map((inv) => (
                <li key={inv.id} className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate text-sm text-slate-700">{inv.email}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    expira em {formatDate(inv.expiresAt)}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => copyLink(inv.token)}>
                      Copiar link
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => revoke(inv.id)}>
                      Revogar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}

function AboutTab() {
  const [data, setData] = useState<{ name: string; description: string | null; currency: string; createdAt: string } | null>(null);
  useEffect(() => {
    apiJson<{ name: string; description: string | null; currency: string; createdAt: string }>('/households/current').then(setData);
  }, []);

  if (!data) return <Skeleton className="h-40" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{data.name}</CardTitle>
        <CardDescription>
          Criada em {formatDateLong(data.createdAt)} · Moeda {data.currency}
        </CardDescription>
      </CardHeader>
      <div className="px-6 pb-6 text-sm text-slate-600">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Shield className="h-4 w-4" />
          Todos os dados desta casa são isolados de outras contas.
        </div>
      </div>
    </Card>
  );
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}
