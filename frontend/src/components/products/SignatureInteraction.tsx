"use client";

import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { lipBalmFlavorImages } from "@/data/products";

export function TextureZoom({ product }: { product: Product }) {
  const [zoomed, setZoomed] = useState(false);
  const src = product.images[1] || product.image;

  return (
    <div
      className="relative overflow-hidden rounded-xl bg-white p-4 cursor-zoom-in"
      onClick={() => setZoomed(!zoomed)}
      onKeyDown={(e) => e.key === "Enter" && setZoomed(!zoomed)}
      role="button"
      tabIndex={0}
      aria-label="Zoom product texture"
    >
      <Image
        src={src}
        alt={`${product.name} texture close-up`}
        width={327}
        height={205}
        quality={95}
        className={`w-full h-auto transition-transform duration-700 ${zoomed ? "scale-125" : "scale-100"}`}
        sizes="(max-width: 768px) 100vw, 480px"
      />
      <div className="absolute bottom-6 left-6 bg-forest/85 text-cream text-xs px-3 py-1 rounded-full">
        {zoomed ? "Click to zoom out" : "Click to explore texture"}
      </div>
    </div>
  );
}

export function FlavorSwipe({ product }: { product: Product }) {
  const flavors = product.flavors || ["Strawberry", "Apple", "Mango", "Vanilla", "Chocolate"];
  const [active, setActive] = useState(0);
  const src = lipBalmFlavorImages[flavors[active]] || product.image;

  return (
    <div>
      <div className="rounded-xl bg-white p-4">
        <Image
          src={src}
          alt={`${product.name} — ${flavors[active]}`}
          width={327}
          height={205}
          quality={95}
          className="w-full h-auto"
          sizes="(max-width: 768px) 100vw, 480px"
        />
      </div>
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {flavors.map((flavor, i) => (
          <button
            key={flavor}
            onClick={() => setActive(i)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              i === active
                ? "bg-forest text-cream"
                : "bg-cream-dark text-muted hover:text-forest"
            }`}
          >
            {flavor}
          </button>
        ))}
      </div>
    </div>
  );
}

export function OilFlow({ product }: { product: Product }) {
  const [pouring, setPouring] = useState(false);
  const src = product.images[1] || product.image;

  return (
    <div
      className="relative rounded-xl bg-white p-4 cursor-pointer"
      onMouseEnter={() => setPouring(true)}
      onMouseLeave={() => setPouring(false)}
      tabIndex={0}
      role="img"
      aria-label={`${product.name} oil texture`}
    >
      <Image
        src={src}
        alt={`${product.name} oil texture`}
        width={327}
        height={205}
        quality={95}
        className={`w-full h-auto transition-all duration-1000 ${pouring ? "scale-105 brightness-105" : "scale-100"}`}
        sizes="(max-width: 768px) 100vw, 480px"
      />
      <div className="absolute bottom-6 left-6 bg-forest/85 text-cream text-xs px-3 py-1 rounded-full">
        Hover to explore the oil
      </div>
    </div>
  );
}

export function SignatureInteraction({ product }: { product: Product }) {
  switch (product.signatureInteraction) {
    case "texture-zoom":
      return <TextureZoom product={product} />;
    case "flavor-swipe":
      return <FlavorSwipe product={product} />;
    case "oil-flow":
      return <OilFlow product={product} />;
    default:
      return null;
  }
}
