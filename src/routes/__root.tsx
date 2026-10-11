import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Gestão Escolar PRO" },
      { name: "description", content: "Diário de notas, avaliação qualitativa, frequência e relatórios do Ensino Médio integrado." },
      { name: "theme-color", content: "#1D4ED8" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap",
      },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: Root,
  shellComponent: ShellDocument,
});

function ShellDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("gep-theme");var d=t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark")}catch(e){}`,
          }}
        />
      </head>
      <body>
        <PreviewHostBridge />
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function Root() {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 5000 } },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        <Outlet />
        <Toaster closeButton position="top-center" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
