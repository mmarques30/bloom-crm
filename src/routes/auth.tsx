import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StarSpark } from "@/components/brand-mark";
import authBg from "@/assets/auth-bg.jpg";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Entrar · Star CRM" },
      { name: "description", content: "Acesse sua conta Star CRM." },
    ],
  }),
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/" });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Você já pode entrar.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível continuar.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      if (!result.redirected) navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao entrar com Google.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-smoky text-foreground">
      <img
        src={authBg}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
        width={1920}
        height={1280}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-smoky/95 via-smoky/70 to-jet/85" />
      <div className="absolute inset-0 [background-image:radial-gradient(circle_at_20%_10%,rgba(152,126,93,0.35),transparent_45%),radial-gradient(circle_at_85%_85%,rgba(24,23,18,0.9),transparent_55%)]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center text-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
              <StarSpark className="h-6 w-6" />
            </div>
            <h1 className="mt-4 font-display text-4xl leading-none">star crm</h1>
            <p className="mt-2 text-xs uppercase tracking-[0.24em] text-white/60">creative ops</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-xl">
            <h2 className="font-display text-3xl text-white">
              {mode === "signin" ? "Bem-vindo de volta" : "Criar conta"}
            </h2>
            <p className="mt-1 text-sm text-white/60">
              {mode === "signin" ? "Entre para acessar seu workspace." : "Cadastre-se para começar."}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {mode === "signup" && (
                <IconField
                  icon={<User className="h-4 w-4" />}
                  type="text"
                  placeholder="Nome completo"
                  value={fullName}
                  onChange={setFullName}
                  required
                />
              )}
              <IconField
                icon={<Mail className="h-4 w-4" />}
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={setEmail}
                required
              />
              <div className="relative">
                <IconField
                  icon={<Lock className="h-4 w-4" />}
                  type={showPw ? "text" : "password"}
                  placeholder="Senha"
                  value={password}
                  onChange={setPassword}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                  aria-label={showPw ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {mode === "signin" && (
                <div className="flex items-center justify-between text-xs text-white/70">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-white/20 bg-white/10 accent-primary"
                    />
                    Lembrar de mim
                  </label>
                  <Link to="/auth" className="hover:text-white">Esqueci a senha</Link>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="pill h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? "Carregando…" : mode === "signin" ? "Entrar" : "Criar conta"}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-widest text-white/40">
              <div className="h-px flex-1 bg-white/10" />
              ou continue com
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="pill flex h-11 w-full items-center justify-center gap-3 border border-white/10 bg-white/[0.04] text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              <GoogleIcon />
              Google
            </button>

            <p className="mt-6 text-center text-sm text-white/60">
              {mode === "signin" ? "Ainda não tem conta?" : "Já tem conta?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="font-medium text-white hover:text-primary"
              >
                {mode === "signin" ? "Criar conta" : "Entrar"}
              </button>
            </p>
          </div>

          <p className="mt-6 text-center text-[11px] text-white/40">
            © {new Date().getFullYear()} Star CRM · Creative Ops
          </p>
        </div>
      </div>
    </div>
  );
}

function IconField({
  icon,
  type,
  placeholder,
  value,
  onChange,
  required,
}: {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/50">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-3 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-primary/60 focus:bg-white/[0.08]"
      />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#4285F4" d="M22.5 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.9c-.26 1.37-1.03 2.53-2.2 3.31v2.75h3.56c2.08-1.92 3.24-4.74 3.24-8.07Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.68l-3.56-2.75c-.99.66-2.25 1.05-3.72 1.05-2.87 0-5.29-1.94-6.16-4.54H2.16v2.84C3.97 20.52 7.7 23 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.08A6.98 6.98 0 0 1 5.5 12c0-.72.13-1.42.34-2.08V7.08H2.16A11 11 0 0 0 1 12c0 1.77.43 3.45 1.16 4.92l3.68-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.07.56 4.21 1.65l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.97 3.48 2.16 7.08l3.68 2.84C6.71 7.32 9.13 5.38 12 5.38Z" />
    </svg>
  );
}
