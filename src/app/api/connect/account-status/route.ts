import { NextRequest, NextResponse } from 'next/server';
import { getAccountStatus } from '@/lib/stripe';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    const status = await getAccountStatus(accountId);
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error fetching account status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account status' },
      { status: 500 }
    );
  }
}
