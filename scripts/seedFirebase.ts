// scripts/seedFirebase.ts
// Run with: npx ts-node --project tsconfig.json scripts/seedFirebase.ts
// Or: bun scripts/seedFirebase.ts
//
// This seeds the initial menu data to Firebase Firestore

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { defaultMenuNorte, defaultMenuSur } from "../src/lib/menuData";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  console.log("Seeding Firebase Firestore...");

  // Seed Norte menu
  await setDoc(doc(db, "menus", "norte"), defaultMenuNorte);
  console.log("✅ Menu Norte seeded");

  // Seed Sur menu
  await setDoc(doc(db, "menus", "sur"), defaultMenuSur);
  console.log("✅ Menu Sur seeded");

  // Seed a demo order
  await setDoc(doc(db, "orders", "demo-001"), {
    branch: "norte",
    item: {
      size: "mediana",
      specialty: "hawaiana",
      condiments: ["oregano"],
      drink: "cocaCola",
      quantity: 1,
      notes: "Sin cebolla por favor",
      price: 41000,
    },
    customerName: "Demo Cliente",
    phone: "3001234567",
    address: "Cra 70 #44-10, Laureles",
    paymentMethod: "cash",
    status: "confirmado",
    total: 41000,
    createdAt: new Date(),
    language: "es",
  });
  console.log("✅ Demo order seeded");

  console.log("🎉 Firebase seeded successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
