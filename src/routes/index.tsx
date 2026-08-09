import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LST — Low Stress Trading" },
      { name: "description", content: "Disciplined crypto scalping terminal. Risk-first, not prediction-first." },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      throw redirect({ to: "/dashboard" });
    }
    throw redirect({ to: "/auth/login" });
  },
  component: Index,
});

function Index() {
  return null;
}
