import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { createClient } from '@/lib/supabase/server';

export async function middleware(request: NextRequest) {
  const { response, supabase } = await updateSession(request);
  
  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', user.id)
      .single();

    if (pathname.startsWith('/admin') && profile?.rol !== 1) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    if (pathname.startsWith('/auth')) {
        return NextResponse.redirect(new URL('/', request.url));
    }
  } else {
    if (pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }


  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
