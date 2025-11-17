import type { Metadata } from "next";
import { ReactNode } from "react";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "IMC - SOORO",
  description: "Sistema para criação e gerenciamento de avaliações de IMC",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
