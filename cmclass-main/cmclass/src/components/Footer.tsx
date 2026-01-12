import { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, Plus } from "lucide-react";

interface FooterMenuProps {
  title: string;
  links: { name: string; to: string }[];
  isOpen: boolean;
  onToggle: () => void;
}

const FooterMenu = ({ title, links, isOpen, onToggle }: FooterMenuProps) => {
  return (
    <div className="md:block">
      <div
        className="flex justify-between items-center md:block cursor-pointer"
        onClick={onToggle}
      >
        <h4 className="text-white mb-2 md:mb-4 text-xs md:text-base">{title}</h4>
        <div className="md:hidden transition-transform duration-300">
          <span
            className={`block transform transition-transform duration-300 ${
              isOpen ? "rotate-45" : "rotate-0"
            }`}
          >
            <Plus size={20} className="text-gray-400" />
          </span>
        </div>
      </div>

      <ul
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"
        } md:max-h-full md:opacity-100 md:mt-0 space-y-8 md:space-y-3 text-xs md:text-sm`}
      >
        {links.map((link, i) => (
          <li key={i}>
            <Link
              to={link.to}
              className="text-gray-400 hover:text-[#007B8A] transition-colors"
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const Footer = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const handleToggle = (menuTitle: string) => {
    setOpenMenu((prev) => (prev === menuTitle ? null : menuTitle));
  };

  return (
    <footer className="bg-black text-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-8 lg:py-12 flex flex-col">

        {/* Logo for mobile/tablet */}
        <div className="flex justify-center mb-8 sm:mb-12 lg:hidden">
          <img
            src="/cmclass@.svg"
            alt="CMClass Logo"
            className="h-12 sm:h-12 object-contain"
          />
        </div>

        {/* GRID 4 COLUMNS */}
        <div className="grid text-xs grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-12 sm:mb-16">

          <FooterMenu
            title="AIDE & SUPPORT"
            links={[
              { name: "Service client (7j/7)", to: "/support" },
              { name: "FAQ", to: "/faq" },
              { name: "Conseils d’entretien", to: "/entretien" },
              { name: "Guide des tailles", to: "/tailles" },
              { name: "Retours & échanges", to: "/retours" },
              { name: "Suivi de commande", to: "/suivi" },
            ]}
            isOpen={openMenu === "AIDE & SUPPORT"}
            onToggle={() => handleToggle("AIDE & SUPPORT")}
          />

          <FooterMenu
            title="SERVICES"
            links={[
              { name: "Création sur mesure", to: "/sur-mesure" },
              { name: "Retouches & ajustements", to: "/retouches" },
              { name: "Personnalisation", to: "/personnalisation" },
              { name: "Emballages cadeaux", to: "/cadeaux" },
              { name: "Prendre un rendez-vous", to: "/rdv" },
            ]}
            isOpen={openMenu === "SERVICES"}
            onToggle={() => handleToggle("SERVICES")}
          />

          <FooterMenu
            title="À PROPOS DE CMCLASS"
            links={[
              { name: "Notre histoire", to: "/notre-histoire" },
              { name: "L’atelier & savoir-faire", to: "/atelier" },
              { name: "Engagement qualité", to: "/engagement" },
              { name: "Nouveautés", to: "/nouveautes" },
              { name: "Recrutement", to: "/carriere" },
              { name: "Collaborations", to: "/collaborations" },
            ]}
            isOpen={openMenu === "À PROPOS DE CMCLASS"}
            onToggle={() => handleToggle("À PROPOS DE CMCLASS")}
          />

          {/* Suivez-Nous + Social Icons */}
          <div className="md:block">
            <FooterMenu
              title="SUIVEZ-NOUS"
              links={[
                { name: "Goma, Nord-Kivu", to: "#" },
                { name: "République Démocratique du Congo", to: "#" },
                { name: "contact@cmclass.cd", to: "mailto:contact@cmclass.cd" },
                { name: "+243 XXX XXX XXX", to: "tel:+243" },
              ]}
              isOpen={openMenu === "SUIVEZ-NOUS"}
              onToggle={() => handleToggle("SUIVEZ-NOUS")}
            />

            {/* Social Icons (mobile/tablet only) */}
            <div className="flex gap-4 sm:gap-8 mt-12 sm:mt-12 md:mt-4 md:gap-2 md:justify-start justify-center lg:hidden">
              <Link
                to="#"
                className="text-gray-400 hover:text-[#007B8A] transition-colors"
              >
                <Instagram size={20} />
              </Link>
              <Link
                to="#"
                className="text-gray-400 hover:text-[#007B8A] transition-colors"
              >
                <Facebook size={20} />
              </Link>
              <Link
                to="#"
                className="text-gray-400 hover:text-[#007B8A] transition-colors"
              >
                <Twitter size={20} />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 border-t border-gray-800 flex flex-col gap-4 sm:gap-6 text-xs sm:text-sm">

          {/* Première ligne : Langue + Liens */}
          <div className="flex flex-col sm:flex-row justify-between  items-center">
            <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-0 flex-wrap justify-center sm:justify-end">
              <Link to="/plan-du-site" className="text-gray-400 hover:text-[#007B8A] transition-colors">
                Plan du Site
              </Link>
              <span className="text-gray-600">|</span>
              <Link to="/mentions-legales" className="text-gray-400 hover:text-[#007B8A] transition-colors">
                Mentions légales
              </Link>
              <span className="text-gray-600">|</span>
              <Link to="/accessibilite" className="text-gray-400 hover:text-[#007B8A] transition-colors">
                Accessibilité
              </Link>
              <span className="text-gray-600">|</span>
              <Link to="/cookies" className="text-gray-400 hover:text-[#007B8A] transition-colors">
                Cookies
              </Link>
            </div>
            <div className="flex items-center gap-2 pt-4 sm:gap-4">
              <button className="text-gray-400 hover:text-[#007B8A] transition-colors">
                Français
              </button>
              <span className="text-gray-600">|</span>
              <button className="text-gray-400 hover:text-[#007B8A] transition-colors">
                English
              </button>
            </div>
          </div>

          {/* Logo pour desktop */}
          <div className="hidden lg:flex justify-center mt-4">
            <img
              src="/cmclass@.svg"
              alt="CMClass Logo"
              className="h-6 sm:h-4 lg:h-12 object-contain"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};
