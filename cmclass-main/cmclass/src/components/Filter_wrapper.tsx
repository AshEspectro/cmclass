/* eslint-disable @typescript-eslint/no-explicit-any */
import { X, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface FilterItem {
  label: string;
  options?: string[];
  type?: "default" | "toggle" | string;
}

interface ResponsiveFilterProps {
  filters: FilterItem[];
  open: boolean;
  onClose: () => void;
  onApply: (result: Record<string, any>) => void;
  onCountChange?: (count: number) => void; // optional callback to parent with total selected count
}

export default function ResponsiveFilter({
  filters,
  open,
  onClose,
  onApply,
  onCountChange,
}: ResponsiveFilterProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  // selected map: for checkboxes it's an array of strings, for toggles it's boolean
  const [selected, setSelected] = useState<Record<string, any>>({});
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Initialize toggle defaults so UI can render counts and aria consistently
  useEffect(() => {
    // only run when filters change
    const defaults: Record<string, any> = {};
    filters.forEach((f) => {
      if (f.type === "toggle") {
        // keep existing value if present
        defaults[f.label] = selected[f.label] ?? false;
      } else {
        // ensure arrays for non-toggle filters are undefined (we'll treat undefined as empty)
        // don't overwrite existing selections if user had them
        if (selected[f.label] === undefined) {
          // leave undefined to keep behaviour where cleared filter = undefined
        }
      }
    });

    if (Object.keys(defaults).length > 0) {
      setSelected((prev) => ({ ...defaults, ...prev }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Helper: toggle checkbox option (multi-select)
  const toggleOption = (label: string, option: string) => {
    setSelected((prev) => {
      const current = Array.isArray(prev[label]) ? prev[label] : [];
      const next = current.includes(option)
        ? current.filter((o: string) => o !== option)
        : [...current, option];
      return { ...prev, [label]: next };
    });
  };

  // toggle switch (boolean)
  const toggleSwitch = (label: string) => {
    setSelected((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  // Count total selections (checkbox items + toggles true)
  const totalSelected = Object.values(selected).reduce((count, value) => {
    if (Array.isArray(value)) return count + value.length;
    if (value === true) return count + 1;
    return count;
  }, 0);

  // Notify parent when total changes
  useEffect(() => {
    if (onCountChange) onCountChange(totalSelected);
  }, [totalSelected, onCountChange]);

  // Manage focus and Escape key + body scroll lock
  useEffect(() => {
    if (!open) {
      // restore body scroll and focus if closing
      document.body.style.overflow = "";
      if (previouslyFocused.current) previouslyFocused.current.focus();
      return;
    }

    // When opening
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";

    // focus panel for keyboard users
    setTimeout(() => {
      panelRef.current?.focus();
    }, 0);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      // restore focus on unmount handled by open false branch
    };
  }, [open, onClose]);

  // Overlay click: close only when clicking the backdrop area
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Clear all selections
  const clearAll = () => {
    setSelected({});
  };

  // Small helpers for rendering (safe checks)
  const isChecked = (label: string, opt: string) =>
    Array.isArray(selected[label]) && selected[label].includes(opt);

  const getLabelCount = (label: string) => {
    const val = selected[label];
    if (Array.isArray(val)) return val.length;
    if (val === true) return 1;
    return 0;
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-title"
        tabIndex={-1}
        className={`fixed inset-y-0 right-0 z-50 transform transition-transform duration-300
          w-full md:w-1/2 lg:w-5/12 bg-white shadow-xl flex flex-col`}
        // translate-x handled via conditional class (but since we only render when open, translate-x-0)
        style={{ willChange: "transform" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 md:px-8 lg:px-12 py-6 ">
          <h3 id="filter-title" className="text-base font-medium">
            Voir les filtres
            {totalSelected > 0 && (
              <span className="ml-2 text-sm text-[#007B8A]">({totalSelected})</span>
            )}
          </h3>

          <div className="flex items-center gap-4">
            {/* show clear only if something selected */}
            {totalSelected > 0 && (
              <button
                className="text-sm underline underline-offset-4 text-gray-600 hover:text-black"
                onClick={clearAll}
              >
                Effacer
              </button>
            )}

            <button
              onClick={onClose}
              aria-label="Fermer le panneau des filtres"
              className="p-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col mb-36 md:mb-32 gap-4 overflow-y-auto h-[calc(100%-80px)]">
          {filters.map((f) => {
            // NON-COLLAPSIBLE TOGGLE
            if (f.type === "toggle") {
              const checked = !!selected[f.label];
              return (
                <div
                  key={f.label}
                  className="py-6 px-8 md:px-8 lg:px-24 xl:px-32 bg-black/10 flex items-center justify-between"
                >
                  <span >{f.label}</span>

                  <button
                    onClick={() => toggleSwitch(f.label)}
                    role="switch"
                    aria-checked={checked}
                    aria-label={f.label}
                    className={`relative inline-flex  items-center h-7 w-12 rounded-2xl transition ${selected[f.label] ? "bg-black" : "bg-gray-300"} `}
                  >
                    <label className="flex items-center gap-3 cursor-pointer group relative">
                    <span
                      className={`absolute top-[-10px] left-0 h-4 rounded-full bg-gray-300 transition-all duration-200 group-hover:top-[-18px] group-hover:left-[-4px] group-hover:w-9 group-hover:h-9 group-hover:bg-black/30 ${selected[f.label] ? "translate-x-5" : ""}`}
                      
                    />
                    <span
                      className={`absolute w-5 h-5 rounded-full bg-white transition-transform duration-200 left-1 ${selected[f.label] ? "translate-x-5" : ""}`}
                    /></label>
                  </button>
                </div>
              );
            }

            // COLLAPSIBLE FILTER (checkbox list)
            const labelCount = getLabelCount(f.label);
            return (
              <div key={f.label} className="mx-8  lg:mx-24 xl:mx-32 border-b border-black/10 pb-4">
                <button
                  className="w-full flex items-center justify-between  text-left"
                  onClick={() => setExpanded(expanded === f.label ? null : f.label)}
                  aria-expanded={expanded === f.label}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{f.label}</span>
                    {labelCount > 0 && (
                      <span className="ml-2 text-sm text-[#007B8A]">({labelCount})</span>
                    )}
                  </div>

                  <ChevronDown
                    size={22}
                    className={`transition-transform ${expanded === f.label ? "rotate-180" : ""}`}
                  />
                </button>

                {expanded === f.label && (
                  <div className="mt-3">
                    {f.options?.map((opt) => (
                      <label
                        key={opt}
                        className="flex relative items-center gap-3 py-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked(f.label, opt)}
                          onChange={() => toggleOption(f.label, opt)}
                          className="sr-only peer"
                          aria-checked={isChecked(f.label, opt)}
                        />
                        <span className="h-6 w-6 rounded border border-black flex items-center justify-center transition-all peer-checked:border-2" />
                        <svg
                          className="absolute h-6 w-6 text-black opacity-0 peer-checked:opacity-100 scale-50 peer-checked:scale-100 transition-all duration-200"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer / Apply button */}
        <div className="w-full flex fixed sm:border-b bottom-0 bg-white z-50 justify-center py-6 md:py-6 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.1)]">
          <button
            className="text-white hover:text-[#007B8A] mx-4  hover:bg-white hover:border hover:border-[#007B8A] px-24 md:px-32 rounded-full bg-black py-3 text-sm"
            onClick={() => {
              onApply(selected);
              onClose();
            }}
          >
            Voir les produits
          </button>
        </div>
      </div>
    </>
  );
}
