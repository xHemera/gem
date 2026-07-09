import { defineMiddleware } from 'astro:middleware';
import { verifyPassword } from './lib/auth';

const PROTECTED_PATHS = ['/edit', '/api/pierres'];

export const onRequest = defineMiddleware(async (context, next) => {
  const isProtected = PROTECTED_PATHS.some((p) =>
    context.url.pathname.startsWith(p),
  );

  if (!isProtected) return next();

  const auth = context.request.headers.get('authorization');

  if (auth?.startsWith('Basic ')) {
    const decoded = atob(auth.slice(6));
    const [, password] = decoded.split(':');
    if (password && verifyPassword(password)) {
      return next();
    }
  }

  return new Response('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Gem"' },
  });
});
