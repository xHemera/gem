import type { APIRoute } from 'astro';
import { verifyPassword, createSessionCookie } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const password = formData.get('password') as string | null;

  if (!password || !verifyPassword(password)) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/login?error=1' },
    });
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: '/edit',
      'Set-Cookie': createSessionCookie(),
    },
  });
};
