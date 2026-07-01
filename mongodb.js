'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed.');
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-20">
      <h1 className="font-display text-3xl text-ink">Create an account</h1>
      <p className="mt-2 text-sm text-ink/60">
        Browsing and purchases here train your own recommendation profile.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Field label="Name" type="text" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <Field label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
        {error && <p className="text-sm text-clay">{error}</p>}
        <button disabled={loading} className="btn-primary w-full disabled:opacity-50">
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink/50">
        Already have one? <Link href="/login" className="text-clay hover:underline">Sign in</Link>
      </p>
    </div>
  );
}

function Field({ label, type, value, onChange }) {
  return (
    <label className="block">
      <span className="label-eyebrow">{label}</span>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-sm border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-clay"
      />
    </label>
  );
}
