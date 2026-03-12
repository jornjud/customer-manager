import { NextResponse } from 'next/server';
import { isGitHubConfigured } from '@/lib/github';

export async function GET() {
  return NextResponse.json({ configured: isGitHubConfigured() });
}
