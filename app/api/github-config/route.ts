import { NextResponse } from 'next/server';

export async function GET() {
  const githubToken = process.env.GITHUB_TOKEN;
  const githubRepo = process.env.GITHUB_REPO;
  
  const configured = !!(githubToken && githubRepo);
  
  return NextResponse.json({ configured });
}
