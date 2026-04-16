import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  setDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DeliveryPerson } from "@/types/admin";
import { toast } from "sonner";

export const useDelivery = (
  authed: boolean,
  forcedBranch?: "norte" | "sur",
) => {
  // Delivery management states
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [newDeliveryPerson, setNewDeliveryPerson] = useState({
    name: "",
    phone: "",
    branch: (forcedBranch ?? "norte") as "norte" | "sur",
  });
  const [deliveryFilter, setDeliveryFilter] = useState<"all" | "norte" | "sur">(
    forcedBranch ?? "all",
  );
  const [editingDeliveryPerson, setEditingDeliveryPerson] =
    useState<DeliveryPerson | null>(null);

  // Load delivery persons from Firebase
  useEffect(() => {
    if (!authed) return;
    const q = query(
      collection(db, "deliveryPersons"),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setDeliveryPersons(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }) as DeliveryPerson),
      );
    });
    return unsub;
  }, [authed]);

  useEffect(() => {
    if (!forcedBranch) return;
    setDeliveryFilter(forcedBranch);
    setNewDeliveryPerson((p) => ({ ...p, branch: forcedBranch }));
  }, [forcedBranch]);

  const filteredDeliveryPersons = deliveryPersons.filter((person) => {
    if (forcedBranch && person.branch !== forcedBranch) return false;
    if (deliveryFilter === "all") return true;
    return person.branch === deliveryFilter;
  });

  const addDeliveryPerson = async () => {
    if (!newDeliveryPerson.name || !newDeliveryPerson.phone) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    try {
      const deliveryData = {
        name: newDeliveryPerson.name,
        phone: newDeliveryPerson.phone,
        branch: newDeliveryPerson.branch,
        active: true,
        createdAt: Timestamp.now(),
      };

      await setDoc(doc(collection(db, "deliveryPersons")), deliveryData);
      setNewDeliveryPerson({ name: "", phone: "", branch: "norte" });
      setEditingDeliveryPerson(null);
      toast.success("Domiciliario agregado exitosamente");
    } catch (error) {
      console.error("Error adding delivery person:", error);
      toast.error("Error al agregar domiciliario");
    }
  };

  const assignDeliveryToOrder = async (
    orderId: string,
    deliveryPersonId: string,
  ) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        deliveryPersonId,
        dispatchedAt: Timestamp.now(),
      });
      toast.success("Domiciliario asignado exitosamente");
    } catch (error) {
      console.error("Error assigning delivery person:", error);
      toast.error("Error al asignar domiciliario");
    }
  };

  const toggleDeliveryPersonStatus = async (
    deliveryPersonId: string,
    currentStatus: boolean,
  ) => {
    try {
      await updateDoc(doc(db, "deliveryPersons", deliveryPersonId), {
        active: !currentStatus,
      });
      toast.success(
        `Domiciliario ${!currentStatus ? "activado" : "desactivado"} exitosamente`,
      );
    } catch (error) {
      console.error("Error toggling delivery person status:", error);
      toast.error("Error al cambiar estado del domiciliario");
    }
  };

  const deleteDeliveryPerson = async (deliveryPersonId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este domiciliario?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "deliveryPersons", deliveryPersonId));
      toast.success("Domiciliario eliminado exitosamente");
    } catch (error) {
      console.error("Error deleting delivery person:", error);
      toast.error("Error al eliminar domiciliario");
    }
  };

  const startEditingDeliveryPerson = (person: DeliveryPerson) => {
    setEditingDeliveryPerson(person);
    setNewDeliveryPerson({
      name: person.name,
      phone: person.phone,
      branch: person.branch,
    });
  };

  const updateDeliveryPerson = async () => {
    if (
      !editingDeliveryPerson ||
      !newDeliveryPerson.name ||
      !newDeliveryPerson.phone
    ) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    try {
      await updateDoc(doc(db, "deliveryPersons", editingDeliveryPerson.id), {
        name: newDeliveryPerson.name,
        phone: newDeliveryPerson.phone,
        branch: newDeliveryPerson.branch,
      });

      setEditingDeliveryPerson(null);
      setNewDeliveryPerson({ name: "", phone: "", branch: "norte" });
      toast.success("Domiciliario actualizado exitosamente");
    } catch (error) {
      console.error("Error updating delivery person:", error);
      toast.error("Error al actualizar domiciliario");
    }
  };

  const cancelEditing = () => {
    setEditingDeliveryPerson(null);
    setNewDeliveryPerson({ name: "", phone: "", branch: "norte" });
  };

  return {
    deliveryPersons,
    newDeliveryPerson,
    deliveryFilter,
    editingDeliveryPerson,
    filteredDeliveryPersons,
    setNewDeliveryPerson,
    setDeliveryFilter,
    addDeliveryPerson,
    updateDeliveryPerson,
    deleteDeliveryPerson,
    toggleDeliveryPersonStatus,
    assignDeliveryToOrder,
    startEditingDeliveryPerson,
    cancelEditing,
  };
};
