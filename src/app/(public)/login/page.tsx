import { redirect } from 'next/navigation';
import { conf } from '@/config/env';

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function Login({ searchParams }: LoginPageProps) {
  const { callbackUrl } = await searchParams;
  const target = new URL(`${conf.frontendPrivateUrl}/login`);
  
  if (callbackUrl) {
    target.searchParams.set('callbackUrl', callbackUrl);
  }

  redirect(target.toString());
}