"use client";

import { useState } from "react";
import LoginScreen from "./_components/LoginScreen";
import DeliveryTab from "./_components/tabs/DeliveryTab";
import AccountingTab from "./_components/tabs/AccountingTab";
import ScheduleTab from "./_components/tabs/ScheduleTab";
import OrdersTab from "./_components/tabs/OrdersTab";
import MenuTab from "./_components/tabs/MenuTab";
import MarketingTab from "./_components/tabs/MarketingTab";
import AdminLayout from "./_components/AdminLayout";
import { useOrders } from "./_hooks/useOrders";
import { useDelivery } from "./_hooks/useDelivery";
import { useAccounting } from "./_hooks/useAccounting";
import { useSchedules } from "./_hooks/useSchedules";
import { useMenu } from "./_hooks/useMenu";
import { useMarketing } from "./_hooks/useMarketing";
import { getTodayDate } from "./_lib/firebase-helpers";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [userRole, setUserRole] = useState<string>("general");
  const [userBranch, setUserBranch] = useState<string | undefined>(undefined);
  const [tab, setTab] = useState<"orders" | "menu" | "delivery" | "accounting" | "schedule" | "marketing">("orders");

  const forcedBranch =
    (userRole === "branch" || userRole === "employee") && (userBranch === "norte" || userBranch === "sur")
      ? userBranch
      : undefined;

  // Force employee to only see orders tab
  if (userRole === "employee" && tab !== "orders") {
    setTab("orders");
  }

  // Menu hook
  const {
    menuBranch,
    setMenuBranch,
    editingMenu,
    setEditingMenu,
    currentMenu,
    saveMenu,
    savingMenu,
    loadMenus
  } = useMenu(authed, forcedBranch);

  // Delivery management hook
  const {
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
    cancelEditing
  } = useDelivery(authed, forcedBranch);

  // Orders hook
  const {
    orders,
    filteredBranch,
    filteredStatus,
    selectedDate,
    ordersLoading,
    todayDate,
    branchMenus,
    filteredOrders,
    updateStatus,
    setSelectedDate,
    setFilteredBranch,
    setFilteredStatus
  } = useOrders(authed, forcedBranch);

  // Schedule management hook
  const {
    schedules,
    editingSchedule,
    scheduleBranch,
    newSchedule,
    afterHoursNorte,
    afterHoursSur,
    setEditingSchedule,
    setScheduleBranch,
    setNewSchedule,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    deleteScheduleBlock,
    saveAfterHoursSettings
  } = useSchedules(authed, forcedBranch);

  // Accounting hook
  const {
    showAccountingDetails,
    accountingPassword,
    accountingAuthenticated,
    selectedPeriod,
    selectedBranch,
    authenticateAccounting,
    accountingStats,
    rawOrders,
    loadingStats,
    setShowAccountingDetails,
    setAccountingPassword,
    setSelectedPeriod,
    setSelectedBranch,
    setAccountingAuthenticated,
    logoutAccounting,
    customDateRange,
    setCustomDateRange
  } = useAccounting(forcedBranch);

  // Marketing hook
  const {
    coupons,
    loadingCoupons,
    savingCoupon,
    editingCoupon,
    showCouponForm,
    couponForm,
    setCouponForm,
    openCreateForm,
    openEditForm,
    closeForm,
    saveCoupon,
    deleteCoupon,
    toggleCouponStatus,
    loadCoupons,
    customers,
    filteredCustomers,
    loadingCRM,
    crmSegmentFilter,
    setCrmSegmentFilter,
    generateWhatsAppUrl,
    topCoupon,
    loadCRM,
    openRelaunchForm,
    relaunchingCoupon,
    showRelaunchForm,
    relaunchTarget,
    relaunchForm,
    setRelaunchForm,
    closeRelaunchForm,
    relaunchCoupon,
  } = useMarketing(authed, forcedBranch);

  if (!authed) {
    return <LoginScreen onLogin={(role, branch) => {
      setAuthed(true);
      setUserRole(role);
      setUserBranch(branch);
    }} />
  }

  return (
    <AdminLayout
      tab={tab}
      setTab={setTab}
      ordersCount={orders.length}
      todayDate={todayDate}
      onLogout={() => setAuthed(false)}
      userRole={userRole}
      userBranch={userBranch}
    >
      {/* ============ ORDERS TAB ============ */}
      {tab === "orders" && (
        <OrdersTab
          orders={orders}
          deliveryPersons={deliveryPersons}
          branchMenus={branchMenus}
          selectedDate={selectedDate}
          filteredBranch={filteredBranch}
          filteredStatus={filteredStatus}
          filteredOrders={filteredOrders}
          ordersLoading={ordersLoading}
          setSelectedDate={setSelectedDate}
          setFilteredBranch={setFilteredBranch}
          setFilteredStatus={setFilteredStatus}
          updateStatus={updateStatus}
          assignDeliveryToOrder={assignDeliveryToOrder}
          getTodayDate={getTodayDate}
          forcedBranch={forcedBranch}
        />
      )}

      {/* ============ MENU TAB ============ */}
      {tab === "menu" && (
        <MenuTab
          menuBranch={menuBranch}
          editingMenu={editingMenu}
          savingMenu={savingMenu}
          currentMenu={currentMenu}
          setMenuBranch={setMenuBranch}
          setEditingMenu={setEditingMenu}
          loadMenus={loadMenus}
          saveMenu={saveMenu}
          forcedBranch={forcedBranch}
        />
      )}

      {/* ============ DELIVERY TAB ============ */}
      {tab === "delivery" && (
        <DeliveryTab
          deliveryPersons={deliveryPersons}
          filteredDeliveryPersons={filteredDeliveryPersons}
          newDeliveryPerson={newDeliveryPerson}
          deliveryFilter={deliveryFilter}
          editingDeliveryPerson={editingDeliveryPerson}
          setNewDeliveryPerson={setNewDeliveryPerson}
          setDeliveryFilter={setDeliveryFilter}
          addDeliveryPerson={addDeliveryPerson}
          updateDeliveryPerson={updateDeliveryPerson}
          deleteDeliveryPerson={deleteDeliveryPerson}
          toggleDeliveryPersonStatus={toggleDeliveryPersonStatus}
          startEditingDeliveryPerson={startEditingDeliveryPerson}
          cancelEditing={cancelEditing}
          forcedBranch={forcedBranch}
        />
      )}

      {/* ============ SCHEDULE TAB ============ */}
      {tab === "schedule" && (
        <ScheduleTab
          schedules={schedules}
          editingSchedule={editingSchedule}
          scheduleBranch={scheduleBranch}
          newSchedule={newSchedule}
          afterHoursNorte={afterHoursNorte}
          afterHoursSur={afterHoursSur}
          setEditingSchedule={setEditingSchedule}
          setScheduleBranch={setScheduleBranch}
          setNewSchedule={setNewSchedule}
          addSchedule={addSchedule}
          updateSchedule={updateSchedule}
          deleteSchedule={deleteSchedule}
          deleteScheduleBlock={deleteScheduleBlock}
          saveAfterHoursSettings={saveAfterHoursSettings}
          forcedBranch={forcedBranch}
        />
      )}

      {/* ============ MARKETING TAB ============ */}
      {tab === "marketing" && (
        <MarketingTab
          coupons={coupons}
          loadingCoupons={loadingCoupons}
          savingCoupon={savingCoupon}
          editingCoupon={editingCoupon}
          showCouponForm={showCouponForm}
          couponForm={couponForm}
          setCouponForm={setCouponForm}
          openCreateForm={openCreateForm}
          openEditForm={openEditForm}
          closeForm={closeForm}
          saveCoupon={saveCoupon}
          deleteCoupon={deleteCoupon}
          toggleCouponStatus={toggleCouponStatus}
          customers={customers}
          filteredCustomers={filteredCustomers}
          loadingCRM={loadingCRM}
          crmSegmentFilter={crmSegmentFilter}
          setCrmSegmentFilter={setCrmSegmentFilter}
          generateWhatsAppUrl={generateWhatsAppUrl}
          topCoupon={topCoupon}
          loadCRM={loadCRM}
          forcedBranch={forcedBranch}
          openRelaunchForm={openRelaunchForm}
          relaunchingCoupon={relaunchingCoupon}
          showRelaunchForm={showRelaunchForm}
          relaunchTarget={relaunchTarget}
          relaunchForm={relaunchForm}
          setRelaunchForm={setRelaunchForm}
          closeRelaunchForm={closeRelaunchForm}
          relaunchCoupon={relaunchCoupon}
        />
      )}

      {/* ============ ACCOUNTING TAB ============ */}
      {tab === "accounting" && (
        <AccountingTab
          accountingAuthenticated={accountingAuthenticated}
          accountingPassword={accountingPassword}
          selectedPeriod={selectedPeriod}
          selectedBranch={selectedBranch}
          customDateRange={customDateRange}
          accountingStats={accountingStats}
          loadingStats={loadingStats}
          showAccountingDetails={showAccountingDetails}
          rawOrders={rawOrders}
          setAccountingPassword={setAccountingPassword}
          setSelectedPeriod={setSelectedPeriod}
          setSelectedBranch={setSelectedBranch}
          setCustomDateRange={setCustomDateRange}
          setShowAccountingDetails={setShowAccountingDetails}
          setAccountingAuthenticated={setAccountingAuthenticated}
          authenticateAccounting={authenticateAccounting}
          logoutAccounting={logoutAccounting}
          forcedBranch={forcedBranch}
        />
      )}

    </AdminLayout>
  );
}