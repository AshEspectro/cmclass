export default function HeroSection({
  image,
  title,
  description,
  
}: {
  image: string;
  title: string;
  description: string;
  ctaLabel?: string;
  onClick?: () => void;
}) {
  return (
    <section className="w-full">
      {/* IMAGE WRAPPER */}
      <div className="relative w-full h-[60vh] lg:h-[70vh] xl:h-[80vh]   overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/4 to-transparent" />


        {/* TEXT INSIDE IMAGE FOR md+ */}
        <div className="hidden md:flex absolute inset-0  items-end px-16">
          <div className="text-white max-w-sm">
            <h1 className="text-lg  mb-4">{title}</h1>
            <p className="text-sm leading-relaxed opacity-90 mb-12">{description}</p>
            
            
          </div>
        </div>
      </div>

      {/* TEXT OUTSIDE IMAGE FOR MOBILE */}
      <div className="md:hidden mt-6 px-12">
        <h1 className="text-lg  mb-4">{title}</h1>
        <p className="text-sm text-gray-700 leading-relaxed mb-6">{description}</p>

        
      </div>
    </section>
  );
}
import { useState } from "react";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";

interface Product {
  id: number;
  label: string;
  name: string;
  price: string;
  colors: { hex: string; images: string[] }[];
}

const products: Product[] = [
  {
    id: 1,
    label: "Nouveau",
    name: "Chemise Asymétrique Minimaliste",
    price: "49.99$",
    colors: [
      {
        hex: "#000000",
        images: [
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800",
          "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?q=80&w=800",
          "https://images.unsplash.com/photo-1543076447-215ad9ba6923?q=80&w=800",
        ],
      },
      {
        hex: "#c7c7c7",
        images: [
          "https://images.unsplash.com/photo-1564849444449-0c8f1c2b4aa8?q=80&w=800",
          "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800",
          "https://images.unsplash.com/photo-1541099649105-3f0f13f5c8f0?q=80&w=800",
        ],
      },
    ],
  },
  {
    id: 2,
    label: "Nouveau",
    name: "Chemise Oversize Texture Lin",
    price: "59.99$",
    colors: [
      {
        hex: "#4a4a4a",
        images: [
          "https://images.unsplash.com/photo-1593032465178-3d9730fbd702?q=80&w=800",
          "https://images.unsplash.com/photo-1592878893260-ece5095a5f39?q=80&w=800",
        ],
      },
      {
        hex: "#d9d9d9",
        images: [
          "https://images.unsplash.com/photo-1593032465178-3d9730fbd702?q=80&w=800",
          "https://images.unsplash.com/photo-1592878893260-ece5095a5f39?q=80&w=800",
        ],
      },
    ],
  },
  {
    id: 1,
    label: "Nouveau",
    name: "Chemise Asymétrique Minimaliste",
    price: "49.99$",
    colors: [
      {
        hex: "#000000",
        images: [
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800",
          "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?q=80&w=800",
          "https://images.unsplash.com/photo-1543076447-215ad9ba6923?q=80&w=800",
        ],
      },
      {
        hex: "#c7c7c7",
        images: [
          "https://images.unsplash.com/photo-1564849444449-0c8f1c2b4aa8?q=80&w=800",
          "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800",
          "https://images.unsplash.com/photo-1541099649105-3f0f13f5c8f0?q=80&w=800",
        ],
      },
    ],
  },
  {
    id: 2,
    label: "Nouveau",
    name: "Chemise Oversize Texture Lin",
    price: "59.99$",
    colors: [
      {
        hex: "#4a4a4a",
        images: [
          "https://images.unsplash.com/photo-1593032465178-3d9730fbd702?q=80&w=800",
          "https://images.unsplash.com/photo-1592878893260-ece5095a5f39?q=80&w=800",
        ],
      },
      {
        hex: "#d9d9d9",
        images: [
          "https://images.unsplash.com/photo-1593032465178-3d9730fbd702?q=80&w=800",
          "https://images.unsplash.com/photo-1592878893260-ece5095a5f39?q=80&w=800",
        ],
      },
    ],
  },
];

export function ProductGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 w-full">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
//<div className="absolute inset-0 bg-linear-to-t from-gray-50/40 via-black/10 to-transparent" />
function ProductCard({ product }: { product: Product }) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0].hex);
  const [index, setIndex] = useState(0);
  const [hoveringImage, setHoveringImage] = useState(false);

  const images =
    product.colors.find((c) => c.hex === selectedColor)?.images || [];

  const prev = () =>
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () =>
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  const handleColorChange = (hex: string) => {
    setSelectedColor(hex);
    setIndex(0); // Reset to first image for selected color
  };

  return (
    <div className="relative w-full aspect-4/5 overflow-hidden">
      {/* IMAGE AREA */}
      <div
        className="w-full h-full relative"
        onMouseEnter={() => setHoveringImage(true)}
        onMouseLeave={() => setHoveringImage(false)}
      >
        <img
          src={images[index]}
          className="w-full h-full object-cover transition-all duration-500"
        />
        {/* Hover next image effect */}
        {images.length > 1 && (
          <img
            src={images[(index + 1) % images.length]}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              hoveringImage ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
<div className="absolute inset-0 bg-linear-to-t from-gray-50/40 via-black/10 to-transparent" />
        {/* CHEVRONS */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className={`absolute top-1/2 -translate-y-1/2 left-2 text-black p-1 transition-opacity duration-300 ${
                hoveringImage ? "opacity-100" : "opacity-0"
              }`}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              className={`absolute top-1/2 -translate-y-1/2 right-2 text-black p-1 transition-opacity duration-300 ${
                hoveringImage ? "opacity-100" : "opacity-0"
              }`}
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>
      <div className="absolute hinset-0 bg-linear-to-t from-gray-50/40 via-black/10 to-transparent" />

      {/* BOTTOM INFO (disappears on hover) */}
      <div
        className={`absolute bottom-0 left-0 right-0 w-full px-4 pb-6 text-black transition-opacity duration-300 ${
          hoveringImage ? "opacity-0" : "opacity-100"
        }`}
      >
        <div>
          <p className="text-xs text-gray-500 tracking-wide">
            {product.label}
          </p>
          <p className="text-sm font-medium mt-1">{product.name}</p>
          <p className="text-sm mt-1">{product.price}</p>
        </div>

        {/* COLOR SWATCHES */}
        <div className="flex items-end gap-1 mt-2">
          {product.colors.map((c, i) => (
            <button
              key={i}
              className={`w-2 h-2 rounded-full   transition ${
                selectedColor === c.hex ? "scale-110 border-1 border-gray-500" : ""
              }`}
              style={{ backgroundColor: c.hex }}
              onClick={() => handleColorChange(c.hex)}
            ></button>
          ))}
        </div>
      </div>

      {/* WISHLIST */}
      <button className="absolute top-2 right-2 p-3 opacity-90 hover:opacity-100 transition">
        <Heart size={16} className="text-black" />
      </button>
    </div>
  );
}
