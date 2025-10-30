"use client";

import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {createClient} from "@/lib/supabase/client";

interface ContractsRealtimeRefresherProps {
  companyId: string;
}

export function ContractsRealtimeRefresher({companyId}: ContractsRealtimeRefresherProps) {
  const router = useRouter();

  useEffect(() => {
    if (!companyId) return;
    const supabase = createClient();

    const channel = supabase
      .channel(`contracts-${companyId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "contracts",
          filter: `company_id=eq.${companyId}`
        },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId, router]);

  return null;
}


