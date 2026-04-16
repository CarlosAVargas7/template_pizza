import { useState, useEffect, useCallback } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  defaultDynamicMenuNorte,
  defaultDynamicMenuSur,
  BranchMenu,
} from "@/lib/menuData";
import { toast } from "sonner";

export const useMenu = (authed: boolean, forcedBranch?: "norte" | "sur") => {
  const [menuNorte, setMenuNorte] = useState<BranchMenu>(
    defaultDynamicMenuNorte,
  );
  const [menuSur, setMenuSur] = useState<BranchMenu>(defaultDynamicMenuSur);
  const [menuBranch, setMenuBranch] = useState<"norte" | "sur">(
    forcedBranch ?? "norte",
  );
  const [editingMenu, setEditingMenu] = useState(false);
  const [savingMenu, setSavingMenu] = useState(false);

  useEffect(() => {
    if (forcedBranch) setMenuBranch(forcedBranch);
  }, [forcedBranch]);

  const loadMenus = useCallback(async () => {
    try {
      const nSnap = await getDoc(doc(db, "menus", "norte"));
      if (nSnap.exists()) {
        const menuData = nSnap.data() as BranchMenu;
        // Check if it's the new format or legacy format
        if (menuData.categories) {
          setMenuNorte(menuData);
        } else {
          // Migrate legacy format
          setMenuNorte(defaultDynamicMenuNorte);
        }
      } else {
        setMenuNorte(defaultDynamicMenuNorte);
      }

      const sSnap = await getDoc(doc(db, "menus", "sur"));
      if (sSnap.exists()) {
        const menuData = sSnap.data() as BranchMenu;
        if (menuData.categories) {
          setMenuSur(menuData);
        } else {
          // Migrate legacy format
          setMenuSur(defaultDynamicMenuSur);
        }
      } else {
        setMenuSur(defaultDynamicMenuSur);
      }
    } catch (error) {
      console.error("Error loading menus:", error);
      // Use defaults
      setMenuNorte(defaultDynamicMenuNorte);
      setMenuSur(defaultDynamicMenuSur);
    }
  }, []);

  useEffect(() => {
    if (authed) loadMenus();
  }, [authed, loadMenus]);

  const saveMenu = async (updatedMenu: BranchMenu) => {
    setSavingMenu(true);
    try {
      await setDoc(doc(db, "menus", menuBranch), updatedMenu);
      if (menuBranch === "norte") {
        setMenuNorte(updatedMenu);
      } else {
        setMenuSur(updatedMenu);
      }
      toast.success(
        `Menú ${menuBranch === "norte" ? "Norte" : "Sur"} guardado`,
      );
      setEditingMenu(false);
    } catch (error) {
      console.error("Error saving menu:", error);
      toast.error("Error al guardar menú. Verifica la conexión a Firebase.");
    } finally {
      setSavingMenu(false);
    }
  };

  const currentMenu = menuBranch === "norte" ? menuNorte : menuSur;

  return {
    menuNorte,
    setMenuNorte,
    menuSur,
    setMenuSur,
    menuBranch,
    setMenuBranch,
    editingMenu,
    setEditingMenu,
    savingMenu,
    setSavingMenu,
    loadMenus,
    saveMenu,
    currentMenu,
  };
};
