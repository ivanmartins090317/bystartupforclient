"use client";

import {useState} from "react";
import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {MessageCircle, Phone, Send, X} from "lucide-react";
import {toast} from "sonner";
import {createClient} from "@/lib/supabase/client";
import {useUserStore} from "@/lib/stores/user-store";

export function SupportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5513999999999";
  const phoneNumber = process.env.NEXT_PUBLIC_SUPPORT_PHONE || "08007841414";

  async function handleSubmitRequest(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const {
        data: {user}
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Você precisa estar logado");
        return;
      }

      const {data: profile} = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();

      if (!profile) {
        toast.error("Perfil não encontrado");
        return;
      }

      const {error} = await supabase.from("support_requests").insert({
        company_id: profile.company_id,
        user_id: user.id,
        subject,
        message,
        status: "open"
      });

      if (error) {
        toast.error("Erro ao enviar solicitação");
        return;
      }

      toast.success("Solicitação enviada com sucesso!", {
        description: "Nossa equipe entrará em contato em breve."
      });

      setSubject("");
      setMessage("");
      setIsDialogOpen(false);
      setShowMenu(false);
    } catch (error) {
      toast.error("Erro inesperado ao enviar solicitação");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {showMenu && (
          <div className="absolute bottom-16 right-0 mb-2 w-56 bg-white rounded-lg shadow-lg border overflow-hidden animate-in slide-in-from-bottom-2">
            <button
              onClick={() => {
                window.open(`https://wa.me/${whatsappNumber}`, "_blank");
                setShowMenu(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <MessageCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">WhatsApp</span>
            </button>
            <button
              onClick={() => {
                window.open(`tel:${phoneNumber}`, "_self");
                setShowMenu(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-t"
            >
              <Phone className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">Telefone</span>
            </button>
            <button
              onClick={() => {
                setIsDialogOpen(true);
                setShowMenu(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-t"
            >
              <Send className="h-5 w-5 text-accent-600" />
              <span className="text-sm font-medium">Abrir Solicitação</span>
            </button>
          </div>
        )}

        <Button
          onClick={() => setShowMenu(!showMenu)}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg bg-secondary-500 hover:bg-secondary-600 text-white"
        >
          {showMenu ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </Button>
      </div>

      {/* Request Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Abrir Solicitação de Suporte</DialogTitle>
            <DialogDescription>
              Descreva sua solicitação e nossa equipe entrará em contato em breve.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitRequest} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Assunto</Label>
              <Input
                id="subject"
                placeholder="Ex: Dúvida sobre contrato"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                placeholder="Descreva sua solicitação..."
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-secondary-500 hover:bg-secondary-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Enviar Solicitação"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
