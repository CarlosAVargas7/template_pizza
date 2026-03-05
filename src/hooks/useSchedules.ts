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

  useEffect(() => {
    const q = query(collection(db, "schedules"));
    const unsub = onSnapshot(q, (snap) => {
      const schedulesData: Record<string, ScheduleData> = {};
      snap.docs.forEach(doc => {
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
    const days = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo', 'festivo'];
    
    days.forEach(day => {
      const scheduleKey = branch ? `${branch}_${day}` : day;
      const schedule = schedules[scheduleKey];
      
      if (schedule) {
        formatted.push({
          day: day.charAt(0).toUpperCase() + day.slice(1),
          time: schedule.isClosed ? "Cerrado" : `${schedule.openTime} - ${schedule.closeTime}`,
          isClosed: schedule.isClosed
        });
      }
    });

    return formatted;
  };

  // Get current day schedule
  const getCurrentDaySchedule = (): ScheduleData | null => {
    const today = new Date().toLocaleDateString('es-CO', { weekday: 'long' }).toLowerCase();
    const scheduleKey = branch ? `${branch}_${today}` : today;
    return schedules[scheduleKey] || null;
  };

  // Check if store is open now
  const isStoreOpen = (): boolean => {
    const currentSchedule = getCurrentDaySchedule();
    if (!currentSchedule || currentSchedule.isClosed) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    return currentTime >= currentSchedule.openTime && currentTime <= currentSchedule.closeTime;
  };

  // Get next opening time
  const getNextOpeningTime = (): string => {
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const today = new Date().getDay();
    const todayName = days[today];
    
    // Check if store opens later today
    const todaySchedule = getCurrentDaySchedule();
    if (todaySchedule && !todaySchedule.isClosed) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      if (currentTime < todaySchedule.openTime) {
        return `Hoy a las ${todaySchedule.openTime}`;
      }
    }
    
    // Find next open day
    for (let i = 1; i <= 7; i++) {
      const nextDayIndex = (today + i) % 7;
      const nextDayName = days[nextDayIndex];
      const scheduleKey = branch ? `${branch}_${nextDayName}` : nextDayName;
      const nextSchedule = schedules[scheduleKey];
      
      if (nextSchedule && !nextSchedule.isClosed) {
        if (i === 1) return `Mañana a las ${nextSchedule.openTime}`;
        return `${nextDayName.charAt(0).toUpperCase() + nextDayName.slice(1)} a las ${nextSchedule.openTime}`;
      }
    }
    
    return "No hay horarios disponibles";
  };

  return {
    schedules,
    loading,
    getFormattedSchedules,
    getCurrentDaySchedule,
    isStoreOpen,
    getNextOpeningTime
  };
}
