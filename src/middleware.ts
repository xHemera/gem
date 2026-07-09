import { defineMiddleware } from 'astro:middleware';
import { verifySession } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.url.pathname.startsWith('/edit')) {
    const isAuth = verifySession(context.request.headers.get('cookie'));
    if (!isAuth) {
      return context.redirect('/login');
    }
  }
  return next();
});
