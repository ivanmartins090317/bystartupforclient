"use client";

import {useRouter} from "next/navigation";
import {createClient} from "@/lib/supabase/client";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {LogOut, User, Settings} from "lucide-react";
import {toast} from "sonner";
import type {ProfileWithCompany} from "@/lib/supabase/helpers";
import Image from "next/image";

interface DashboardHeaderProps {
  profile: ProfileWithCompany;
}

export function DashboardHeader({profile}: DashboardHeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Logout realizado com sucesso");
    router.push("/login");
    router.refresh();
  }

  const initials = profile.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          {/* Logo ByStartup */}
          <div className="flex items-center gap-2 p-0.5">
            <Image
              src="/logo-bystartup.svg"
              alt="ByStartup"
              width={140}
              height={32}
              priority
              className="h-6 md:h-7 w-auto bg-secondary-500 rounded-lg p-2"
            />
          </div>

          {/* Logo Cliente */}
          {profile.companies && (
            <>
              {/* <div className="w-px h-8 bg-gray-200" />
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-primary rounded flex items-center justify-center text-white font-bold text-sm">
                  {profile.companies.name?.charAt(0) || "T"}
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {profile.companies.name}
                </span>
              </div> */}
            </>
          )}
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-secondary-900">
                {profile.full_name}
              </p>
              <p className="text-xs text-gray-600">{profile.email}</p>
            </div>
            <Avatar>
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-primary-500 text-secondary-900 font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-accent-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
