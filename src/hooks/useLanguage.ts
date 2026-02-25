// hooks/useLanguage.ts
"use client";

import { useStore } from "@/lib/store";
import { t } from "@/lib/i18n";

export function useLanguage() {
  const { language, setLanguage } = useStore();
  const tx = t(language);
  return { language, setLanguage, tx };
}
