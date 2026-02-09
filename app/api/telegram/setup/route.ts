import { NextResponse } from 'next/server';
import { setWebhook } from '@/lib/telegram';

export async function POST() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL;
  if (!baseUrl) {
    return NextResponse.json(
      { error: 'NEXT_PUBLIC_BASE_URL not configured' },
      { status: 500 },
    );
  }

  const webhookUrl = `${baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`}/api/telegram/webhook`;
  const result = await setWebhook(webhookUrl);

  return NextResponse.json({
    webhookUrl,
    ...result,
  });
}
