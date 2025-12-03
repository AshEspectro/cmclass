// components/AltNavbarOnScroll.tsx
import { useEffect, useState } from "react";

interface AltNavbarOnScrollProps {
  children: React.ReactNode; // ton alt navbar
  triggerHeight?: number; // à partir de quelle hauteur on le cache
}

export function AltNavbarOnScroll({ children, triggerHeight = 40 }: AltNavbarOnScrollProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // si je descends → alt navbar disparaît
      if (window.scrollY > triggerHeight) {
        setVisible(true);
      } else {
        setVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [triggerHeight]);

  return (
    <div
      className={`
        fixed left-0 w-full h-full z-40 transition-transform duration-300
        ${visible ? "translate-y-0" : "-translate-y-full"}
      `}
      style={{ top: "52px" }} // hauteur exacte de ton Default Navbar
    >
      {children}
    </div>
  );
}
