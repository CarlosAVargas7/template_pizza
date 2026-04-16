"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export type AfterHoursMode = "pre-orders" | "blocked";

export interface AfterHoursSettings {
  mode: AfterHoursMode;
  updatedAt: Date;
}

export function useAfterHoursSettings(branch: "norte" | "sur") {
  const [settings, setSettings] = useState<AfterHoursSettings>({
    mode: "pre-orders",
    updatedAt: new Date(),
  });
  const [loading, setLoading] = useState(true);

  // Reset loading cuando cambia el branch
  useEffect(() => {
    setLoading(true);
  }, [branch]);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "afterHoursSettings", branch),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSettings({
            mode: data.mode || "pre-orders",
            updatedAt: data.updatedAt?.toDate() || new Date(),
          });
        } else {
          setSettings({
            mode: "pre-orders",
            updatedAt: new Date(),
          });
        }
        setLoading(false);
      },
    );

    return unsub;
  }, [branch]);

  return { settings, loading };
}
