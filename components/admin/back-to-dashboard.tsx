"use client";

import {usePathname} from "next/navigation";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {ArrowLeft} from "lucide-react";

export function BackToDashboard() {
  const pathname = usePathname();
  if (pathname === "/admin") return null;
  return (
    <div className="mb-6">
      <Button variant="outline" size="sm" asChild>
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Dashboard
        </Link>
      </Button>
    </div>
  );
}


