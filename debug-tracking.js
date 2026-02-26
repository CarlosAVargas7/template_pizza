// Script para depurar el rastreo de pedidos
// Ejecutar con: node debug-tracking.js

const { initializeApp } = require("firebase/app");
const { getFirestore, collection, query, where, getDocs, orderBy } = require("firebase/firestore");

// Configuración Firebase (mismo que en .env.local)
const firebaseConfig = {
  apiKey: "AIzaSyDhpBCNtPTpPuLUtsypDCIZ51OwYktCZ4g",
  authDomain: "template-pizza.firebaseapp.com",
  projectId: "template-pizza",
  storageBucket: "template-pizza.firebasestorage.app",
  messagingSenderId: "279292969599",
  appId: "1:279292969599:web:496d51ba7e80afd3adf54a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugOrders() {
  try {
    console.log("🔍 Buscando todos los pedidos...");
    
    // 1. Obtener todos los pedidos sin filtro
    const allOrdersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const allSnap = await getDocs(allOrdersQuery);
    
    console.log(`📊 Total de pedidos encontrados: ${allSnap.size}`);
    
    if (allSnap.size === 0) {
      console.log("❌ No hay pedidos en la base de datos");
      return;
    }
    
    // 2. Mostrar detalles de cada pedido
    allSnap.forEach((doc) => {
      const data = doc.data();
      console.log("\n📋 Pedido ID:", doc.id);
      console.log("👤 Nombre:", data.customerName);
      console.log("📱 Teléfono:", `"${data.phone}"`);
      console.log("📍 Dirección:", data.address);
      console.log("💰 Total:", data.total);
      console.log("📊 Estado:", data.status);
      console.log("📅 Fecha:", data.createdAt?.toDate?.() || "Sin fecha");
    });
    
    // 3. Buscar por teléfono específico (ejemplo)
    const testPhone = "3001234567"; // Reemplaza con un teléfono real
    console.log(`\n🔍 Buscando pedidos con teléfono: "${testPhone}"`);
    
    const phoneQuery = query(
      collection(db, "orders"),
      where("phone", "==", testPhone),
      orderBy("createdAt", "desc")
    );
    
    const phoneSnap = await getDocs(phoneQuery);
    console.log(`📊 Pedidos con teléfono "${testPhone}": ${phoneSnap.size}`);
    
    phoneSnap.forEach((doc) => {
      console.log("✅ Encontrado:", doc.id);
    });
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

debugOrders();
