import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are all required.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'An account with that email already exists.' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash });

    const token = signToken({ id: user._id.toString(), email: user.email, name: user.name });
    setAuthCookie(token);

    return NextResponse.json({
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('[register]', err);
    return NextResponse.json({ error: 'Something went wrong creating your account.' }, { status: 500 });
  }
}
