import { NextResponse } from 'next/server';
import { addNewsletterSubscription } from '@/lib/db';
import { validateEmail } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    addNewsletterSubscription(email);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
