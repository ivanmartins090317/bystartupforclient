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

  // Redirecionamento por papel (admin vs cliente)
  if (user) {
    const {data: profile} = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = profile?.role === "admin";
    const path = request.nextUrl.pathname;

    // Admin indo para raiz ou dashboard → manda para /admin
    if (isAdmin && (path === "/" || path === "/dashboard")) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/admin";
      return NextResponse.redirect(redirectUrl);
    }

    // Cliente tentando acessar /admin → manda para /dashboard
    if (!isAdmin && path.startsWith("/admin")) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}
