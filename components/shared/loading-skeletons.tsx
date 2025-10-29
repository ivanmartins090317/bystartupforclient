import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";

/**
 * Skeleton para o Welcome Card
 */
export function WelcomeCardSkeleton() {
  return (
    <Card className="p-6 bg-gradient-to-br from-secondary-500 to-secondary-700 text-white border-0">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-32 bg-white/20" />
          <Skeleton className="h-9 w-64 bg-white/20" />
          <Skeleton className="h-5 w-48 bg-white/20" />
        </div>
      </div>
    </Card>
  );
}

/**
 * Skeleton para card de reunião
 */
export function MeetingCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton para card de contratos overview
 */
export function ContractsOverviewSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton para lista de reuniões recentes
 */
export function RecentMeetingsCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton para card de serviços
 */
export function ServicesCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="p-3 rounded-lg border space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton genérico para dashboard completo
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <WelcomeCardSkeleton />

      <div className="grid gap-6 md:grid-cols-2">
        <MeetingCardSkeleton />
        <ContractsOverviewSkeleton />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentMeetingsCardSkeleton />
        </div>
        <div>
          <ServicesCardSkeleton />
        </div>
      </div>
    </div>
  );
}
