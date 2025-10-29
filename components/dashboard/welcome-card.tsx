import {Card} from "@/components/ui/card";
import {Sparkles} from "lucide-react";

interface WelcomeCardProps {
  userName: string;
  companyName: string;
}

export function WelcomeCard({userName, companyName}: WelcomeCardProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <Card className="p-6 bg-gradient-to-br from-secondary-500 to-secondary-700 text-white border-0">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary-500" />
            <p className="text-primary-500 font-medium">{companyName}</p>
          </div>
          <h1 className="text-3xl font-bold">
            {greeting}, {userName.split(" ")[0]}!
          </h1>
          <p className="text-gray-200">Bem-vindo ao seu portal exclusivo ByStartup</p>
        </div>
      </div>
    </Card>
  );
}
