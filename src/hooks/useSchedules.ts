"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";

export interface ScheduleData {
  openTime: string;
  closeTime: string;
  isClosed: boolean;
  blockId: string;
  branch: string;
}

export interface FormattedSchedule {
  day: string;
  time: string;
  isClosed: boolean;
}

export function useSchedules(branch?: "norte" | "sur") {
  const [schedules, setSchedules] = useState<Record<string, ScheduleData>>({});
  const [loading, setLoading] = useState(true);

  // Reset loading cuando cambia el branch
  useEffect(() => {
    setLoading(true);
    setSchedules({});
  }, [branch]);

  useEffect(() => {
    const q = query(collection(db, "schedules"));
    const unsub = onSnapshot(q, (snap) => {
      const schedulesData: Record<string, ScheduleData> = {};
      snap.docs.forEach((doc) => {
        const data = doc.data();
        // Filter by branch if specified
        if (!branch || data.branch === branch) {
          schedulesData[doc.id] = data as ScheduleData;
        }
      });
      setSchedules(schedulesData);
      setLoading(false);
    });

    return unsub;
  }, [branch]);

  // Get formatted schedules for display
  const getFormattedSchedules = (): FormattedSchedule[] => {
    const formatted: FormattedSchedule[] = [];
    const days = [
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
      "domingo",
      "festivo",
    ];

    days.forEach((day) => {
      const scheduleKey = branch ? `${branch}_${day}` : day;
      const schedule = schedules[scheduleKey];

      if (schedule) {
        formatted.push({
          day: day.charAt(0).toUpperCase() + day.slice(1),
          time: schedule.isClosed
            ? "Cerrado"
            : `${schedule.openTime} - ${schedule.closeTime}`,
          isClosed: schedule.isClosed,
        });
      }
    });

    return formatted;
  };

  // Helper function to convert time string to minutes
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Get current day schedule
  const getCurrentDaySchedule = (): ScheduleData | null => {
    const days = [
      "domingo",
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
    ];
    // Usar getDay() es confiable y no depende del locale
    const todayIndex = new Date().getDay();
    const todayName = days[todayIndex];
    const scheduleKey = branch ? `${branch}_${todayName}` : todayName;

    console.log("[useSchedules] branch:", branch);
    console.log("[useSchedules] todayIndex (getDay):", todayIndex);
    console.log("[useSchedules] todayName:", todayName);
    console.log("[useSchedules] scheduleKey:", scheduleKey);
    console.log(
      "[useSchedules] schedules disponibles:",
      Object.keys(schedules),
    );
    console.log("[useSchedules] schedule encontrado:", schedules[scheduleKey]);

    return schedules[scheduleKey] || null;
  };

  // Check if store is open now
  const isStoreOpen = (): boolean => {
    const currentSchedule = getCurrentDaySchedule();
    if (!currentSchedule || currentSchedule.isClosed) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const openMinutes = timeToMinutes(currentSchedule.openTime);
    const rawCloseMinutes = timeToMinutes(currentSchedule.closeTime);
    // 00:00 significa medianoche (fin del día) = 1440 minutos
    const closeMinutes = rawCloseMinutes === 0 ? 1440 : rawCloseMinutes;

    console.log("[useSchedules] currentMinutes:", currentMinutes);
    console.log("[useSchedules] openMinutes:", openMinutes);
    console.log("[useSchedules] closeMinutes:", closeMinutes);
    console.log(
      "[useSchedules] resultado isOpen:",
      currentMinutes >= openMinutes && currentMinutes <= closeMinutes,
    );

    if (closeMinutes > 1440) {
      // No aplica por ahora, pero por si acaso
      return currentMinutes >= openMinutes;
    }
    // Caso normal: closeMinutes >= openMinutes
    // Caso medianoche: closeMinutes = 1440
    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  };

  // Get next opening time
  const getNextOpeningTime = (): string => {
    const days = [
      "domingo",
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
    ];
    const now = new Date();
    const todayIndex = now.getDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Verificar si el local abre más tarde HOY
    const todaySchedule = getCurrentDaySchedule();
    if (todaySchedule && !todaySchedule.isClosed) {
      const openMinutes = timeToMinutes(todaySchedule.openTime);
      if (currentMinutes < openMinutes) {
        return `Hoy a las ${todaySchedule.openTime}`;
      }
    }

    // Buscar el próximo día con horario abierto
    for (let i = 1; i <= 7; i++) {
      const nextDayIndex = (todayIndex + i) % 7;
      const nextDayName = days[nextDayIndex];
      const scheduleKey = branch ? `${branch}_${nextDayName}` : nextDayName;
      const nextSchedule = schedules[scheduleKey];

      if (nextSchedule && !nextSchedule.isClosed) {
        if (i === 1) return `Mañana a las ${nextSchedule.openTime}`;
        return `${nextDayName.charAt(0).toUpperCase() + nextDayName.slice(1)} a las ${nextSchedule.openTime}`;
      }
    }

    return "Próximamente";
  };

  return {
    schedules,
    loading,
    getFormattedSchedules,
    getCurrentDaySchedule,
    isStoreOpen,
    getNextOpeningTime,
  };
}
