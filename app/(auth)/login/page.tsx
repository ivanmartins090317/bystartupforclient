import {LoginForm} from "@/components/auth/login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-32 h-32 bg-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-primary-500 text-3xl font-bold">BS</span>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-secondary-900">
                Bem-vindo ao ByStartup
              </h1>
              <p className="text-gray-600 mt-2">
                Acesse o portal exclusivo para clientes
              </p>
            </div>
          </div>

          <LoginForm />
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-secondary-500 to-secondary-700 items-center justify-center p-12">
        <div className="max-w-md text-white space-y-6">
          <h2 className="text-4xl font-bold">Acompanhe seus projetos em tempo real</h2>
          <p className="text-lg opacity-90">
            Acesso centralizado às suas reuniões, contratos, insights e muito mais.
          </p>
          <div className="space-y-4 pt-8">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-secondary-900 text-sm font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold">Reuniões Organizadas</h3>
                <p className="text-sm opacity-80">
                  Veja suas próximas reuniões e acesse resumos anteriores
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-secondary-900 text-sm font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold">Insights Exclusivos</h3>
                <p className="text-sm opacity-80">
                  Acesse podcasts e vídeos criados especialmente para você
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-secondary-900 text-sm font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-semibold">Suporte Rápido</h3>
                <p className="text-sm opacity-80">
                  Comunicação direta via WhatsApp ou telefone
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
