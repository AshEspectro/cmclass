import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, Plus } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { publicApi } from "../services/publicApi";
import { useLocale } from "../contexts/LocaleContext";

const BRAND_CACHE_KEY = "cmclass.publicBrand.cache";
const FOOTER_SECTIONS_CACHE_KEY = "cmclass.footerSections.cache";
const SERVICES_CACHE_KEY = "cmclass.services.cache";

type FooterSectionData = {
  id: number;
  title: string;
  order: number;
  links: Array<{ id: number; label: string; url: string; order: number }>;
};

type ServiceData = {
  title?: string | null;
  link?: string | null;
};

type BrandData = {
  logoUrl?: string | null;
  logoLightUrl?: string | null;
  logoDarkUrl?: string | null;
  contactEmail?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  pinterestUrl?: string | null;
  footerText?: string | null;
};

const normalizeBrandData = (data?: BrandData | null) => ({
  logoUrl: data?.logoUrl || null,
  logoLightUrl: data?.logoLightUrl || null,
  logoDarkUrl: data?.logoDarkUrl || null,
  contactEmail: data?.contactEmail || null,
  instagramUrl: data?.instagramUrl || null,
  facebookUrl: data?.facebookUrl || null,
  twitterUrl: data?.twitterUrl || null,
  pinterestUrl: data?.pinterestUrl || null,
  footerText: data?.footerText || null,
});

const hasBrandData = (data: ReturnType<typeof normalizeBrandData>) =>
  Boolean(
    data.logoUrl ||
    data.logoLightUrl ||
    data.logoDarkUrl ||
    data.contactEmail ||
    data.instagramUrl ||
    data.facebookUrl ||
    data.twitterUrl ||
    data.pinterestUrl ||
    data.footerText
  );

const mapServicesToLinks = (services: ServiceData[]) =>
  services.map((svc) => ({
    name: svc?.title || 'Service',
    to: svc?.link || '/contact',
  }));

interface FooterMenuProps {
  title: string;
  links: { name: string; to: string; external?: boolean }[];
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
        <h4 className="text-white uppercase mb-2 md:mb-4 text-xs md:text-base">{title}</h4>
        <div className="md:hidden transition-transform duration-300">
          <span
            className={`block transform transition-transform duration-300 ${isOpen ? "rotate-45" : "rotate-0"
              }`}
          >
            <Plus size={20} className="text-gray-400" />
          </span>
        </div>
      </div>

      <ul
        className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"
          } md:max-h-full md:opacity-100 md:mt-0 space-y-8 md:space-y-3 text-xs md:text-sm`}
      >
        {links.map((link, i) => {
          const isHttp = /^https?:\/\//i.test(link.to);
          const isExternal =
            (link.external ?? isHttp) ||
            link.to.startsWith('mailto:') ||
            link.to.startsWith('tel:') ||
            link.to.startsWith('#');

          return (
            <li key={i}>
              {isExternal ? (
                <a
                  href={link.to}
                  target={isHttp ? "_blank" : undefined}
                  rel={isHttp ? "noreferrer" : undefined}
                  className="text-gray-400 hover:text-[#007B8A] transition-colors"
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  to={link.to}
                  className="text-gray-400 hover:text-[#007B8A] transition-colors"
                >
                  {link.name}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export const Footer = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const { locale, setLocale, t } = useLocale();
  const [footerSections, setFooterSections] = useState<FooterSectionData[]>([]);
  const [serviceLinks, setServiceLinks] = useState<{ name: string; to: string }[]>([]);
  const [brand, setBrand] = useState<BrandData>({});

  const normalizeSocialUrl = (
    platform: 'instagram' | 'facebook' | 'twitter',
    value: string,
  ) => {
    const trimmed = value.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;

    let normalized = trimmed;
    if (normalized.startsWith('@')) normalized = normalized.slice(1);
    if (normalized.startsWith('www.')) normalized = normalized.slice(4);

    const domainMap: Record<typeof platform, string> = {
      instagram: 'instagram.com',
      facebook: 'facebook.com',
      twitter: 'twitter.com',
    };
    const domain = domainMap[platform];
    if (normalized.toLowerCase().includes(domain)) {
      return `https://${normalized}`;
    }
    return `https://${domain}/${normalized}`;
  };

  const normalizeWhatsAppUrl = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return '';
    if (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('whatsapp://')
    ) {
      return trimmed;
    }

    let normalized = trimmed.replace(/[^\d+]/g, '');
    if (normalized.startsWith('+')) normalized = normalized.slice(1);
    if (normalized.startsWith('00')) normalized = normalized.slice(2);
    return normalized ? `https://wa.me/${normalized}` : '';
  };

  const handleToggle = (menuTitle: string) => {
    setOpenMenu((prev) => (prev === menuTitle ? null : menuTitle));
  };

  useEffect(() => {
    let active = true;
    (async () => {
      // Use last successful brand config if backend is unavailable.
      try {
        const cached = localStorage.getItem(BRAND_CACHE_KEY);
        if (cached) {
          const parsed = normalizeBrandData(JSON.parse(cached) as BrandData);
          if (hasBrandData(parsed) && active) {
            setBrand(parsed);
          }
        }
      } catch {
        // Ignore cache read errors and continue with network fetch.
      }

      const data = await publicApi.getBrand();
      if (!active) return;
      const normalized = normalizeBrandData(data as BrandData);
      if (hasBrandData(normalized)) {
        setBrand(normalized);
        try {
          localStorage.setItem(BRAND_CACHE_KEY, JSON.stringify(normalized));
        } catch {
          // Ignore cache write errors.
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      let hasCachedSections = false;
      let hasCachedServices = false;

      try {
        const cachedSections = localStorage.getItem(FOOTER_SECTIONS_CACHE_KEY);
        if (cachedSections) {
          const parsed = JSON.parse(cachedSections) as FooterSectionData[];
          if (Array.isArray(parsed) && parsed.length > 0 && active) {
            setFooterSections(parsed);
            hasCachedSections = true;
          }
        }
      } catch {
        // Ignore cache read errors.
      }

      try {
        const cachedServices = localStorage.getItem(SERVICES_CACHE_KEY);
        if (cachedServices) {
          const parsed = JSON.parse(cachedServices) as ServiceData[];
          if (Array.isArray(parsed) && parsed.length > 0 && active) {
            setServiceLinks(mapServicesToLinks(parsed));
            hasCachedServices = true;
          }
        }
      } catch {
        // Ignore cache read errors.
      }

      const [sections, services] = await Promise.all([
        publicApi.getFooterSections(),
        publicApi.getServices(),
      ]);

      if (!active) return;
      const normalizedSections = Array.isArray(sections) ? (sections as FooterSectionData[]) : [];
      if (normalizedSections.length > 0) {
        setFooterSections(normalizedSections);
        try {
          localStorage.setItem(FOOTER_SECTIONS_CACHE_KEY, JSON.stringify(normalizedSections));
        } catch {
          // Ignore cache write errors.
        }
      } else if (!hasCachedSections) {
        setFooterSections([]);
      }

      const serviceItems = Array.isArray(services) ? (services as ServiceData[]) : [];
      if (serviceItems.length > 0) {
        setServiceLinks(mapServicesToLinks(serviceItems));
        try {
          localStorage.setItem(SERVICES_CACHE_KEY, JSON.stringify(serviceItems));
        } catch {
          // Ignore cache write errors.
        }
      } else if (!hasCachedServices) {
        setServiceLinks([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const whatsappFallback = import.meta.env.VITE_WHATSAPP_FALLBACK || '';
  const whatsappSource = brand.pinterestUrl || whatsappFallback;
  const whatsappHref = whatsappSource ? normalizeWhatsAppUrl(whatsappSource) : '';

  return (
    <footer className="bg-black text-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-8 lg:py-12 flex flex-col">

        {/* Logo for mobile/tablet */}
        <div className="flex justify-center mb-8 sm:mb-12 lg:hidden">
          <img
            src={brand.logoDarkUrl || brand.logoUrl || brand.logoLightUrl}
            alt="CMClass Logo"
            className="h-12 sm:h-12 object-contain"
          />
        </div>

        {/* GRID 4 COLUMNS */}
        <div className="grid text-xs grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-12 sm:mb-16">
          {(footerSections.length > 0 ? footerSections : []).map((section) => {
            const title = section.title || '';
            const isServices = title.trim().toLowerCase() === 'services' || title.trim().toLowerCase().includes('service');
            const links = isServices
              ? serviceLinks.map((svc) => ({ name: svc.name, to: svc.to }))
              : (section.links || []).map((l) => ({ name: l.label, to: l.url }));

            const content = (
              <FooterMenu
                title={title}
                links={links}
                isOpen={openMenu === title}
                onToggle={() => handleToggle(title)}
              />
            );

            if (title.trim().toLowerCase().includes('suivez')) {
              return (
                <div className="md:block" key={`footer-section-${section.id}`}>
                  {content}

                  {/* Social Icons (mobile/tablet only) */}
                  <div className="flex gap-4 sm:gap-8 mt-12 sm:mt-12 md:mt-4 md:gap-2 md:justify-start justify-center lg:hidden">
                    <a
                      href={brand.instagramUrl ? normalizeSocialUrl('instagram', brand.instagramUrl) : "#"}
                      target={brand.instagramUrl ? "_blank" : undefined}
                      rel={brand.instagramUrl ? "noreferrer" : undefined}
                      className="text-gray-400 hover:text-[#007B8A] transition-colors"
                      aria-label="Instagram"
                    >
                      <Instagram size={20} />
                    </a>
                    <a
                      href={brand.facebookUrl ? normalizeSocialUrl('facebook', brand.facebookUrl) : "#"}
                      target={brand.facebookUrl ? "_blank" : undefined}
                      rel={brand.facebookUrl ? "noreferrer" : undefined}
                      className="text-gray-400 hover:text-[#007B8A] transition-colors"
                      aria-label="Facebook"
                    >
                      <Facebook size={20} />
                    </a>
                    <a
                      href={brand.twitterUrl ? normalizeSocialUrl('twitter', brand.twitterUrl) : "#"}
                      target={brand.twitterUrl ? "_blank" : undefined}
                      rel={brand.twitterUrl ? "noreferrer" : undefined}
                      className="text-gray-400 hover:text-[#007B8A] transition-colors"
                      aria-label="Twitter"
                    >
                      <Twitter size={20} />
                    </a>
                    <a
                      href={whatsappHref || "#"}
                      target={whatsappHref ? "_blank" : undefined}
                      rel={whatsappHref ? "noreferrer" : undefined}
                      className="text-gray-400 hover:text-[#007B8A] transition-colors"
                      aria-label="WhatsApp"
                    >
                      <FaWhatsapp size={20} />
                    </a>
                  </div>
                </div>
              );
            }

            return (
              <div key={`footer-section-${section.id}`}>
                {content}
              </div>
            );
          })}
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 border-t border-gray-800 flex flex-col gap-4 sm:gap-6 text-xs sm:text-sm">


          {/* Première ligne : Langue + Liens */}
          <div className="flex flex-col sm:flex-row justify-between  items-center">
            <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-0 flex-wrap justify-center sm:justify-end">
              <Link to="/plan-du-site" className="text-gray-400 hover:text-[#007B8A] transition-colors">
                {t("footerSiteMap")}
              </Link>
              <span className="text-gray-600">|</span>
              <Link to="/mentions-legales" className="text-gray-400 hover:text-[#007B8A] transition-colors">
                {t("footerLegal")}
              </Link>
              <span className="text-gray-600">|</span>
              <Link to="/accessibilite" className="text-gray-400 hover:text-[#007B8A] transition-colors">
                {t("footerAccessibility")}
              </Link>
              <span className="text-gray-600">|</span>
              <Link to="/cookies" className="text-gray-400 hover:text-[#007B8A] transition-colors">
                {t("footerCookies")}
              </Link>
            </div>
            <div className="flex items-center gap-2 pt-4 sm:gap-4">
              <button
                className={`text-gray-400 hover:text-[#007B8A] transition-colors ${locale === "fr" ? "text-white" : ""}`}
                aria-pressed={locale === "fr"}
                onClick={() => setLocale("fr")}
                type="button"
              >
                {t("languageFrench")}
              </button>
              <span className="text-gray-600">|</span>
              <button
                className={`text-gray-400 hover:text-[#007B8A] transition-colors ${locale === "en" ? "text-white" : ""}`}
                aria-pressed={locale === "en"}
                onClick={() => setLocale("en")}
                type="button"
              >
                {t("languageEnglish")}
              </button>
            </div>
          </div>

          {/* Logo pour desktop */}
          <div className="hidden lg:flex justify-center mt-4">
            <img
              src={brand.logoDarkUrl || brand.logoUrl || brand.logoLightUrl}
              alt="CMClass Logo"
              className="h-6 sm:h-4 lg:h-12 object-contain"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};
