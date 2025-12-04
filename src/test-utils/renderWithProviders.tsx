import React from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { LocaleProvider } from "@/components/locale-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

function Providers({ children }: ProvidersProps) {
  return <LocaleProvider>{children}</LocaleProvider>;
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, { wrapper: Providers, ...options });
}
