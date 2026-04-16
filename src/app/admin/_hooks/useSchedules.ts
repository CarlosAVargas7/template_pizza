import { useState, useEffect } from "react";
import {
  collection,
  query,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

export const useSchedules = (
  authed: boolean,
  forcedBranch?: "norte" | "sur",
) => {
  // Schedule management states
  const [schedules, setSchedules] = useState<Record<string, any>>({});
  const [editingSchedule, setEditingSchedule] = useState<string | null>(null);
  const [scheduleBranch, setScheduleBranch] = useState<"norte" | "sur">(
    forcedBranch ?? "norte",
  );
  const [newSchedule, setNewSchedule] = useState({
    openTime: "",
    closeTime: "",
    days: [] as string[],
    isClosed: false,
  });
  const [afterHoursNorte, setAfterHoursNorte] = useState<
    "pre-orders" | "blocked"
  >("pre-orders");
  const [afterHoursSur, setAfterHoursSur] = useState<"pre-orders" | "blocked">(
    "pre-orders",
  );

  useEffect(() => {
    if (forcedBranch) setScheduleBranch(forcedBranch);
  }, [forcedBranch]);

  // Load schedules from Firebase
  useEffect(() => {
    if (!authed) return;

    const q = query(collection(db, "schedules"));
    const unsub = onSnapshot(q, (snap) => {
      const schedulesData: Record<string, any> = {};
      snap.docs.forEach((doc) => {
        const data = doc.data();
        // Filter by current selected branch
        if (data.branch === scheduleBranch) {
          schedulesData[doc.id] = data;
        }
      });
      setSchedules(schedulesData);
    });

    return unsub;
  }, [authed, scheduleBranch]);

  // Load after-hours settings from Firebase
  useEffect(() => {
    if (!authed) return;

    const loadAfterHoursSettings = async () => {
      try {
        const norteDoc = await getDoc(doc(db, "afterHoursSettings", "norte"));
        const surDoc = await getDoc(doc(db, "afterHoursSettings", "sur"));

        if (norteDoc.exists()) {
          setAfterHoursNorte(norteDoc.data().mode || "pre-orders");
        }
        if (surDoc.exists()) {
          setAfterHoursSur(surDoc.data().mode || "pre-orders");
        }
      } catch (error) {
        console.error("Error loading after-hours settings:", error);
      }
    };

    loadAfterHoursSettings();
  }, [authed]);

  const addSchedule = async () => {
    if (
      !newSchedule.openTime ||
      !newSchedule.closeTime ||
      newSchedule.days.length === 0
    ) {
      toast.error(
        "Por favor completa todos los campos y selecciona al menos un día",
      );
      return;
    }

    try {
      const scheduleId = `schedule_${Date.now()}`;
      const scheduleData = {
        ...newSchedule,
        id: scheduleId,
        branch: scheduleBranch,
        createdAt: new Date(),
      };

      // Apply schedule to all selected days
      const updates: Promise<any>[] = [];
      newSchedule.days.forEach((day) => {
        updates.push(
          setDoc(doc(db, "schedules", `${scheduleBranch}_${day}`), {
            openTime: newSchedule.openTime,
            closeTime: newSchedule.closeTime,
            isClosed: newSchedule.isClosed,
            blockId: scheduleId,
            branch: scheduleBranch,
            updatedAt: new Date(),
          }),
        );
      });

      await Promise.all(updates);

      // Update local state
      const updatedSchedules = { ...schedules };
      newSchedule.days.forEach((day) => {
        updatedSchedules[`${scheduleBranch}_${day}`] = {
          openTime: newSchedule.openTime,
          closeTime: newSchedule.closeTime,
          isClosed: newSchedule.isClosed,
          blockId: scheduleId,
          branch: scheduleBranch,
        };
      });
      setSchedules(updatedSchedules);

      // Reset form
      setNewSchedule({
        openTime: "",
        closeTime: "",
        days: [],
        isClosed: false,
      });

      toast.success(
        `Horario aplicado a ${newSchedule.days.length} días para sucursal ${scheduleBranch}`,
      );
    } catch (error) {
      console.error("Error adding schedule:", error);
      toast.error("Error al agregar horario");
    }
  };

  const updateSchedule = async (day: string, scheduleData: any) => {
    try {
      await updateDoc(doc(db, "schedules", day), {
        ...scheduleData,
        updatedAt: new Date(),
      });

      setSchedules((prev) => ({ ...prev, [day]: scheduleData }));
      setEditingSchedule(null);
      toast.success("Horario actualizado exitosamente");
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast.error("Error al actualizar horario");
    }
  };

  const deleteSchedule = async (day: string) => {
    try {
      await deleteDoc(doc(db, "schedules", day));

      setSchedules((prev) => {
        const newSchedules = { ...prev };
        delete newSchedules[day];
        return newSchedules;
      });
      toast.success("Horario eliminado exitosamente");
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Error al eliminar horario");
    }
  };

  const deleteScheduleBlock = async (blockSchedules: any[]) => {
    try {
      // Delete all days in this block
      const deletePromises = blockSchedules.map(({ day }) =>
        deleteDoc(doc(db, "schedules", day)),
      );

      await Promise.all(deletePromises);

      setSchedules((prev) => {
        const newSchedules = { ...prev };
        blockSchedules.forEach(({ day }) => {
          delete newSchedules[day];
        });
        return newSchedules;
      });

      toast.success(`Bloque eliminado (${blockSchedules.length} días)`);
    } catch (error) {
      console.error("Error deleting schedule block:", error);
      toast.error("Error al eliminar bloque de horarios");
    }
  };

  const saveAfterHoursSettings = async (
    branch: "norte" | "sur",
    mode: "pre-orders" | "blocked",
  ) => {
    try {
      await setDoc(doc(db, "afterHoursSettings", branch), {
        mode,
        updatedAt: new Date(),
      });

      if (branch === "norte") {
        setAfterHoursNorte(mode);
      } else {
        setAfterHoursSur(mode);
      }

      toast.success(
        `Configuración de pedidos fuera de horario actualizada para sucursal ${branch === "norte" ? "Norte" : "Sur"}`,
      );
    } catch (error) {
      console.error("Error saving after-hours settings:", error);
      toast.error("Error al guardar configuración");
    }
  };

  return {
    schedules,
    setSchedules,
    editingSchedule,
    setEditingSchedule,
    scheduleBranch,
    setScheduleBranch,
    newSchedule,
    setNewSchedule,
    afterHoursNorte,
    setAfterHoursNorte,
    afterHoursSur,
    setAfterHoursSur,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    deleteScheduleBlock,
    saveAfterHoursSettings,
  };
};
