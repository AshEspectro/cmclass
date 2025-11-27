import { X, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

interface FilterItem {
  label: string;
  options?: string[];
  type?: "default" | "toggle";
}

interface ResponsiveFilterProps {
  filters: FilterItem[];
  open: boolean;
  onClose: () => void;
  onApply: (result: Record<string, any>) => void;
  onCountChange?: (count: number) => void; // NEW
}

export default function ResponsiveFilter({
  filters,
  open,
  onClose,
  onApply,
  onCountChange,   
}: ResponsiveFilterProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, any>>({});
  
  // checkbox handler
  const toggleOption = (label: string, option: string) => {
    setSelected((prev) => {
      const current = prev[label] || [];
      return {
        ...prev,
        [label]: current.includes(option)
          ? current.filter((o: string) => o !== option)
          : [...current, option],
      };
    });
  };

  // toggle switch handler
  const toggleSwitch = (label: string) => {
    setSelected((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const handleOverlayClick = (e: any) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Count all selected items (checkboxes + toggles)
  const totalSelected = Object.values(selected).reduce((count, value) => {
    if (Array.isArray(value)) return count + value.length;
    if (value === true) return count + 1;
    return count;
  }, 0);

  // 🔥 Notify parent every time the count changes
  useEffect(() => {
    if (onCountChange) onCountChange(totalSelected);
  }, [totalSelected, onCountChange]);
  useEffect(() => {
    if (open) {
      // Disable page scrolling
      document.body.style.overflow = "hidden";
    } else {
      // Restore scroll
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;
  return (
    <>
      {open && (
        <div
          className="fixed  inset-0 bg-black/90 z-40"
          onClick={handleOverlayClick}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full pb-40 bg-white  z-50 
          transition-transform duration-300  
          w-full sm:w-full md:w-1/2
          ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        
{/* Header */}
<div className=" flex items-center px-8 md:px-8 lg:px-24 xl:px-32 pt-16 pb-6 justify-between">
  <span className="">
    Voir les filtres
    {totalSelected > 0 && (
      <span className="ml-2 text-sm text-[#007B8A]">({totalSelected})</span>
    )}
  </span>

  <div className="flex items-center gap-4">
    {Object.values(selected).some((val) =>
      Array.isArray(val) ? val.length > 0 : !!val
    ) && (
      <button
        className="text-sm underline text-gray-600 hover:text-black"
        onClick={() => setSelected({})}
      >
        Effacer
      </button>
    )}

    <button onClick={onClose}>
      <X size={18} />
    </button>
  </div>
</div>


        {/* CONTENT */}
        <div className="flex flex-col mb-80 md gap-4 overflow-y-auto h-[calc(100%-80px)]">
          {filters.map((f) => {

            // -------------------------
            // NON-COLLAPSIBLE TOGGLE
            // -------------------------
            if (f.type === "toggle") {
              return (
                <div
                  key={f.label}
                  className=" py-6 px-8 md:px-8 lg:px-24 xl:px-32 bg-black/10 flex items-center justify-between"
                >
                  <span>{f.label}</span>

                  <button
                    onClick={() => toggleSwitch(f.label)}
                    className={`relative w-12 h-7 rounded-2xl transition 
                      ${selected[f.label] ? "bg-black" : "bg-gray-300"}`}
                  >
                    <label className="flex items-center gap-3 cursor-pointer group relative">
                      <span
                        className={`absolute top-[-10px] left-0 h-4 rounded-full bg-gray-300 
                          transition-all duration-200
                          group-hover:top-[-18px] group-hover:left-[-4px]
                          group-hover:w-9 group-hover:h-9 group-hover:bg-black/50
                          ${selected[f.label] ? "translate-x-5" : ""}`}
                      />
                      <span
                        className={`absolute w-5 h-5 rounded-full bg-white 
                          transition-transform duration-200 left-1
                          ${selected[f.label] ? "translate-x-5" : ""}`}
                      />
                    </label>
                  </button>
                </div>
              );
            }

            // -------------------------
            // COLLAPSIBLE FILTER
            // -------------------------
            return (
              <div key={f.label} className="px-8 md:px-8 lg:px-24  xl:px-32">
                <button
                  className="w-full border-b border-black/10 flex justify-between pb-4 items-center"
                  onClick={() =>
                    setExpanded(expanded === f.label ? null : f.label)
                  }
                >
                  <span>
                    {f.label}
                    {selected[f.label]?.length > 0 && (
                      <span className="ml-2 text-sm text-[#007B8A]">
                        ({selected[f.label].length})
                      </span>
                    )}
                  </span>
                  <ChevronDown
                    size={22}
                    className={`transition-transform ${
                      expanded === f.label ? "rotate-180" : ""
                    }`}
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
                          checked={selected[f.label]?.includes(opt) || false}
                          onChange={() => toggleOption(f.label, opt)}
                          className="peer sr-only"
                        />
                        <span className="h-6 w-6 rounded border border-black flex items-center justify-center transition-all hover:border-2" />
                        <svg
                          className="absolute h-6 w-6 text-black opacity-0 peer-checked:opacity-100 scale-50 peer-checked:scale-100 transition-all duration-200"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
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

      </div>

      {/* APPLY BUTTON */}
{open && (
  <div className="w-full md:w-1/2 right-0 flex fixed bottom-0 z-50 justify-center pt-6 md:py-6 bg-white shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.1)]">
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
)}
    </>
  );
}
