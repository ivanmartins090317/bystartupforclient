import {ReactNode} from "react";
import {getUserProfile} from "@/lib/supabase/helpers";
import {ErrorMessage} from "@/components/shared/error-message";
import {DashboardHeader} from "@/components/dashboard/dashboard-header";
import {DashboardSidebar} from "@/components/dashboard/dashboard-sidebar";
import {SupportButton} from "@/components/shared/support-button";

export default async function DashboardLayout({children}: {children: ReactNode}) {
  // Usa helper centralizado com tratamento de erro
  const profileResult = await getUserProfile();

  // Se houver erro, mostrar mensagem de erro
  if (profileResult.isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <ErrorMessage
            title="Erro ao carregar perfil"
            message={
              profileResult.error ||
              "Não foi possível carregar seus dados. Por favor, tente novamente."
            }
          />
        </div>
      </div>
    );
  }

  if (!profileResult.data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <ErrorMessage
            title="Perfil não encontrado"
            message="Seu perfil não foi encontrado. Entre em contato com o suporte."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profileResult.data} />

      <div className="flex">
        <DashboardSidebar />

        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      <SupportButton />
    </div>
  );
}
