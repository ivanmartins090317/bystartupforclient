"use client";

import {useRouter} from "next/navigation";
import {createClient} from "@/lib/supabase/client";
import {Button} from "@/components/ui/button";
import {Loader2} from "lucide-react";
import {toast} from "sonner";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {loginSchema, type LoginFormData} from "@/lib/validations";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const {
    handleSubmit,
    formState: {isSubmitting}
  } = form;

  async function onSubmit(data: LoginFormData) {
    try {
      const supabase = createClient();

      const {data: authData, error} = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (error) {
        toast.error("Erro ao fazer login", {
          description:
            error.message === "Invalid login credentials"
              ? "Email ou senha incorretos"
              : error.message
        });
        return;
      }

      if (authData.user) {
        // Buscar perfil do usuário
        const {data: profile, error: profileError} = await supabase
          .from("profiles")
          .select("*, companies(*)")
          .eq("id", authData.user.id)
          .single();

        if (profileError) {
          toast.error("Erro ao carregar perfil");
          return;
        }

        toast.success("Login realizado com sucesso!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast.error("Erro inesperado ao fazer login");
      console.error(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({field}) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    className="h-11"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({field}) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="h-11"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-secondary-500 hover:bg-secondary-600 text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </Button>

        <div className="text-center text-sm text-gray-600">
          <p>Problemas para acessar?</p>
          <p className="mt-1">
            Entre em contato: <span className="font-semibold">0800 784 1414</span>
          </p>
        </div>
      </form>
    </Form>
  );
}
