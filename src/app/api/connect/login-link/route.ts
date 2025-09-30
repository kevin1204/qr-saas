import { NextRequest, NextResponse } from 'next/server';
import { createLoginLink } from '@/lib/stripe';
import { z } from 'zod';

const loginLinkSchema = z.object({
  accountId: z.string().min(1, 'Account ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId } = loginLinkSchema.parse(body);

    const loginLink = await createLoginLink(accountId);
    return NextResponse.json({ url: loginLink.url });
  } catch (error) {
    console.error('Error creating login link:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create login link' },
      { status: 500 }
    );
  }
}
