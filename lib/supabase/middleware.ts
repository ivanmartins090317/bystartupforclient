import {createServerClient} from "@supabase/ssr";
import {NextResponse, type NextRequest} from "next/server";
import type {Database} from "@/types/database.types";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({name, value}) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request
          });
          cookiesToSet.forEach(({name, value, options}) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        }
      }
    }
  );

  const {
    data: {user}
  } = await supabase.auth.getUser();

  // Rotas públicas
  const publicRoutes = ["/login"];
  const isPublicRoute = publicRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Se não estiver autenticado e tentar acessar rota protegida
  if (!user && !isPublicRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    return NextResponse.redirect(redirectUrl);
  }

  // Se estiver autenticado e tentar acessar login
  // TEMPORARIAMENTE COMENTADO PARA TESTE
  // if (user && request.nextUrl.pathname === "/login") {
  //   const redirectUrl = request.nextUrl.clone();
  //   redirectUrl.pathname = "/dashboard";
  //   return NextResponse.redirect(redirectUrl);
  // }

  return supabaseResponse;
}
