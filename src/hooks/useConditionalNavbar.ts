// hooks/useConditionalNavbar.ts
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

interface UseConditionalNavbarProps {
  routesWithHide?: string[]; // Routes où le comportement est actif
  enableScrollHide?: boolean; // Autoriser la disparition au scroll
  scrollTrigger?: number; // Valeur de scroll avant de cacher la navbar
}

export function useConditionalNavbar({
  routesWithHide = [],
  enableScrollHide = false,
  scrollTrigger = 80,
}: UseConditionalNavbarProps) {
  const location = useLocation();
  const [hideNavbar, setHideNavbar] = useState(false);

  const isActiveRoute = routesWithHide.includes(location.pathname);

  useEffect(() => {
    if (!isActiveRoute) {
      setHideNavbar(false);
      return;
    }

    if (!enableScrollHide) {
      setHideNavbar(true); // Cacher directement si scroll non activé
      return;
    }

    const handleScroll = () => {
      setHideNavbar(window.scrollY > scrollTrigger);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isActiveRoute, enableScrollHide, scrollTrigger]);

  return { hideNavbar, isActiveRoute };
}
