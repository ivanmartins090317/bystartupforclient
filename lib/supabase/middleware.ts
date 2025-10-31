import {createServerClient} from "@supabase/ssr";
import {NextResponse, type NextRequest} from "next/server";

export async function updateSession(request: NextRequest) {
  try {
    let supabaseResponse = NextResponse.next({
      request
    });

    // Rotas públicas
    const publicRoutes = ["/login"];

    // Verificar se as variáveis de ambiente estão configuradas
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("[Middleware] Variáveis de ambiente do Supabase não configuradas");
      return supabaseResponse;
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
    });

    const {
      data: {user},
      error: userError
    } = await supabase.auth.getUser();

    // Se houver erro ao buscar usuário
    if (userError) {
      // Erro específico de refresh token inválido - limpar sessão e redirecionar
      const isRefreshTokenError =
        userError.message.includes("refresh_token_not_found") ||
        userError.message.includes("Invalid Refresh Token") ||
        (userError as {code?: string}).code === "refresh_token_not_found" ||
        userError.status === 400;

      if (isRefreshTokenError) {
        console.warn(
          "[Middleware] Refresh token inválido, limpando sessão e redirecionando para login"
        );

        // Limpar cookies de sessão do Supabase
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/login";
        
        const response = NextResponse.redirect(redirectUrl);
        
        // Remover todos os cookies relacionados ao Supabase
        request.cookies.getAll().forEach((cookie) => {
          if (
            cookie.name.includes("supabase") ||
            cookie.name.includes("sb-") ||
            cookie.name.includes("auth-token")
          ) {
            response.cookies.delete(cookie.name);
          }
        });

        // Se não estiver em rota pública, redirecionar para login
        const isPublicRoute = publicRoutes.some((route) =>
          request.nextUrl.pathname.startsWith(route)
        );

        if (!isPublicRoute) {
          return response;
        }

        // Se estiver em rota pública, continua normalmente sem redirecionar
        return supabaseResponse;
      } else {
        // Outros erros apenas logam
        console.error("[Middleware] Erro ao buscar usuário:", userError.message);
      }
    }

    // Verificar se é rota pública
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
      try {
        const {data: profile, error: profileError} = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        // Se houver erro ao buscar profile, continua sem redirecionamento por role
        if (profileError) {
          console.error("[Middleware] Erro ao buscar profile:", profileError.message);
          return supabaseResponse;
        }

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
      } catch (error) {
        // Se houver qualquer erro ao processar role, continua sem redirecionamento
        console.error("[Middleware] Erro ao processar role:", error);
      }
    }

    return supabaseResponse;
  } catch (error) {
    // Em caso de qualquer erro não tratado, loga e retorna resposta padrão
    console.error("[Middleware] Erro não tratado:", error);
    return NextResponse.next({
      request
    });
  }
}
