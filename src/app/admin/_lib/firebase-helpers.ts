import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Función para obtener la fecha actual en formato YYYY-MM-DD
export const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

// Función para generar ID corto diario
export const generateDailyOrderId = (dailyCount: number) => {
  return `#${String(dailyCount).padStart(3, '0')}`;
};

// Función para obtener o inicializar el contador diario por sucursal
export const getDailyOrderCount = async (branch: "norte" | "sur") => {
  const today = getTodayDate();
  const counterRef = doc(db, 'dailyCounters', `${branch}_${today}`);
  const counterDoc = await getDoc(counterRef);

  if (!counterDoc.exists()) {
    await setDoc(counterRef, {
      date: today,
      branch,
      count: 0,
      lastReset: Timestamp.now()
    });
    return 0;
  }

  return counterDoc.data().count || 0;
};

// Función para incrementar el contador diario por sucursal
export const incrementDailyOrderCount = async (branch: "norte" | "sur") => {
  const today = getTodayDate();
  const counterRef = doc(db, 'dailyCounters', `${branch}_${today}`);
  const counterDoc = await getDoc(counterRef);

  if (!counterDoc.exists()) {
    await setDoc(counterRef, {
      date: today,
      branch,
      count: 1,
      lastReset: Timestamp.now()
    });
    return 1;
  }

  const currentCount = counterDoc.data().count || 0;
  const newCount = currentCount + 1;

  await updateDoc(counterRef, {
    count: newCount,
    lastUpdated: Timestamp.now()
  });

  return newCount;
};
