import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { DateRange, AccountingStats, PeriodType } from "@/types/accounting";
import { getDateRangeForPeriod, calculateAllStats } from "../_lib/accounting";

const ACCOUNTING_PASSWORD =
  process.env.NEXT_PUBLIC_ACCOUNTING_PASSWORD || "contabilidad2024";

export const useAccounting = (forcedBranch?: "norte" | "sur") => {
  // Authentication states
  const [accountingAuthenticated, setAccountingAuthenticated] = useState(false);
  const [accountingPassword, setAccountingPassword] = useState("");

  // Period and date range states
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("today");
  const [customDateRange, setCustomDateRange] = useState({
    start: "",
    end: "",
  });
  const [selectedBranch, setSelectedBranch] = useState<"all" | "norte" | "sur">(
    forcedBranch ?? "all",
  );

  useEffect(() => {
    if (forcedBranch) setSelectedBranch(forcedBranch);
  }, [forcedBranch]);

  // Data states
  const [accountingStats, setAccountingStats] =
    useState<AccountingStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [rawOrders, setRawOrders] = useState<any[]>([]);

  // UI states
  const [showAccountingDetails, setShowAccountingDetails] = useState(false);

  // Authentication function
  const authenticateAccounting = () => {
    if (accountingPassword === ACCOUNTING_PASSWORD) {
      setAccountingAuthenticated(true);
      toast.success("Acceso a contabilidad concedido");
    } else {
      toast.error("Clave incorrecta");
    }
  };

  // Logout function
  const logoutAccounting = () => {
    setAccountingAuthenticated(false);
    setAccountingPassword("");
    setAccountingStats(null);
    setShowAccountingDetails(false);
    setSelectedPeriod("today");
    setCustomDateRange({ start: "", end: "" });
    setSelectedBranch(forcedBranch ?? "all");
    toast.success("Sesión de contabilidad cerrada");
  };

  // Fetch orders and calculate stats when period or auth changes
  useEffect(() => {
    if (!accountingAuthenticated) {
      setAccountingStats(null);
      return;
    }

    const fetchOrdersAndCalculateStats = async () => {
      setLoadingStats(true);

      try {
        // Calculate date range based on selected period
        let dateRange: DateRange;

        if (selectedPeriod === "custom") {
          if (!customDateRange.start || !customDateRange.end) {
            toast.error("Por favor selecciona un rango de fechas válido");
            setLoadingStats(false);
            return;
          }
          // Parsear como fecha local (no UTC) agregando T00:00:00
          const startDate = new Date(customDateRange.start + "T00:00:00");
          const endDate = new Date(customDateRange.end + "T00:00:00");
          dateRange = getDateRangeForPeriod(selectedPeriod, startDate, endDate);
        } else {
          dateRange = getDateRangeForPeriod(selectedPeriod);
        }

        // Query Firebase for orders in the date range
        const baseQuery = collection(db, "orders");
        const constraints = [
          where("createdAt", ">=", Timestamp.fromDate(dateRange.start)),
          where("createdAt", "<=", Timestamp.fromDate(dateRange.end)),
          orderBy("createdAt", "desc"),
        ];

        // Add branch filter if not "all"
        if (selectedBranch !== "all") {
          constraints.push(where("branch", "==", selectedBranch));
        }

        const ordersQuery = query(baseQuery, ...constraints);

        const querySnapshot = await getDocs(ordersQuery);
        const orders = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as any[];

        // Store raw orders for export
        setRawOrders(orders);

        // Calculate all stats
        const stats = calculateAllStats(orders, selectedPeriod, dateRange);
        setAccountingStats(stats);
      } catch (error) {
        console.error("Error fetching accounting data:", error);
        toast.error("Error al cargar datos de contabilidad");
        setAccountingStats(null);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchOrdersAndCalculateStats();
  }, [
    accountingAuthenticated,
    selectedPeriod,
    customDateRange,
    selectedBranch,
  ]);

  return {
    // Authentication states
    accountingAuthenticated,
    accountingPassword,
    setAccountingPassword,

    // Period states
    selectedPeriod,
    setSelectedPeriod,
    customDateRange,
    setCustomDateRange,

    // Branch filter
    selectedBranch,
    setSelectedBranch,

    // Data states
    accountingStats,
    loadingStats,
    rawOrders,

    // UI states
    showAccountingDetails,
    setShowAccountingDetails,

    // Functions
    authenticateAccounting,
    logoutAccounting,
    setAccountingAuthenticated,
  };
};
