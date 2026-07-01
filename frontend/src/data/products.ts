import type { Product } from "@/lib/types";

export const products: Product[] = [
  {
    id: "aloe-vera-gel",
    slug: "aloe-vera-gel",
    name: "Aloe Vera Gel",
    tagline: "Pure Hydration. Everyday Care.",
    shortDescription:
      "Experience the refreshing goodness of pure Aloe Vera in a lightweight gel that instantly hydrates, soothes, and revitalizes your skin.",
    description:
      "KindSkin Co. Aloe Vera Gel is made using fresh Aloe Vera with purified water to deliver a lightweight, cooling formula suitable for daily skincare. It absorbs quickly without leaving a sticky residue and helps keep your skin feeling soft, refreshed, and hydrated. Whether you're looking for post-sun care, daily moisturization, or a soothing hair treatment, this multipurpose gel fits effortlessly into your routine.",
    price: 100,
    image: "/images/products/aloe-vera-gel.jpg",
    images: [
      "/images/products/aloe-vera-gel.jpg",
      "/images/products/aloe-texture.jpg",
      "/images/products/aloe-vera-gel-1.jpg",
    ],
    category: "Face & Body",
    benefits: [
      "Deep hydration",
      "Cooling sensation",
      "Lightweight formula",
      "Refreshes tired skin",
      "Helps maintain soft skin",
      "Suitable for daily use",
      "Can be used on skin and hair",
    ],
    features: [
      {
        title: "Pure & Natural",
        description:
          "Made with fresh Aloe Vera and purified water — a clean, honest formula with nothing you don't need.",
        image: "/images/products/aloe-vera-gel-1.jpg",
      },
      {
        title: "Lightweight & Fast-Absorbing",
        description:
          "Cooling gel texture that sinks in quickly without stickiness — perfect for everyday use.",
        image: "/images/products/aloe-texture.jpg",
      },
      {
        title: "Multipurpose Care",
        description:
          "Use on face, body, or hair for hydration, post-sun soothing, and daily refreshment.",
        image: "/images/products/aloe-vera-gel.jpg",
      },
    ],
    ingredients: [
      { name: "Pure Aloe Vera", benefit: "Deep hydration & soothing" },
      { name: "Purified Water", benefit: "Lightweight delivery" },
    ],
    howToUse:
      "Apply a small amount to clean skin or hair and gently massage until absorbed.",
    signatureInteraction: "texture-zoom",
    rating: 4.8,
    reviewCount: 124,
  },
  {
    id: "lip-balm",
    slug: "lip-balm",
    name: "Nourishing Lip Balm",
    tagline: "Soft Lips. Natural Care.",
    shortDescription:
      "A nourishing lip balm crafted to keep your lips soft, smooth, and moisturized while offering delightful natural-inspired flavours.",
    description:
      "KindSkin Co. Lip Balm is designed to provide long-lasting hydration while leaving your lips feeling soft and comfortable throughout the day. Available in multiple flavours, it glides smoothly and is perfect for daily use.",
    price: 50,
    image: "/images/products/lip-balm-lineup.jpg",
    images: [
      "/images/products/lip-balm-lineup.jpg",
      "/images/products/lip-balm-strawberry.jpg",
      "/images/products/lip-balm.jpg",
    ],
    category: "Lip Care",
    benefits: [
      "Moisturizes dry lips",
      "Softens lips",
      "Lightweight texture",
      "Pleasant fragrance",
      "Smooth application",
      "Everyday lip care",
    ],
    flavors: ["Strawberry", "Apple", "Mango", "Vanilla", "Chocolate"],
    features: [
      {
        title: "Five Natural-Inspired Flavours",
        description:
          "Strawberry, Apple, Mango, Vanilla, and Chocolate — each crafted for everyday lip comfort.",
        image: "/images/products/lip-balm-lineup.jpg",
      },
      {
        title: "Handmade with Care",
        description:
          "Small-batch lip balms poured by hand for consistent quality and texture.",
        image: "/images/products/lip-balm-strawberry.jpg",
      },
      {
        title: "Everyday Hydration",
        description:
          "Glides on smoothly and keeps lips feeling soft without heaviness or greasiness.",
        image: "/images/products/lip-balm.jpg",
      },
    ],
    ingredients: [
      { name: "Natural Oils & Waxes", benefit: "Moisture & protection" },
      { name: "Botanical Extracts", benefit: "Natural fragrance & care" },
    ],
    howToUse: "Apply evenly to your lips whenever needed for instant hydration.",
    signatureInteraction: "flavor-swipe",
    rating: 4.9,
    reviewCount: 89,
  },
  {
    id: "abhyang-tel",
    slug: "abhyang-tel",
    name: "Abhyang Tel",
    tagline: "Ancient Tradition. Everyday Wellness.",
    shortDescription:
      "A nourishing Ayurvedic-inspired massage oil created to support your daily self-care rituals with gentle relaxation and skin nourishment.",
    description:
      "Inspired by the traditional practice of Abhyanga, KindSkin Co. Abhyang Tel is crafted for a soothing massage experience. Its lightweight texture helps nourish the skin while making your self-care routine calming and relaxing. Ideal for a gentle body massage after a long day or as part of your weekly wellness ritual.",
    price: 120,
    image: "/images/products/abhyang-tel.jpg",
    images: [
      "/images/products/abhyang-tel.jpg",
      "/images/products/abhyang-oil.jpg",
      "/images/products/abhyang-tel-1.jpg",
    ],
    category: "Body Care",
    benefits: [
      "Nourishes the skin",
      "Supports relaxing massage",
      "Helps soften dry skin",
      "Lightweight oil texture",
      "Suitable for regular body massage",
    ],
    features: [
      {
        title: "Ayurvedic-Inspired",
        description:
          "Crafted for the traditional practice of Abhyanga — self-massage as daily wellness.",
        image: "/images/products/abhyang-tel-1.jpg",
      },
      {
        title: "Lightweight & Nourishing",
        description:
          "Absorbs beautifully into skin, leaving it soft without heavy residue.",
        image: "/images/products/abhyang-oil.jpg",
      },
      {
        title: "Calming Ritual",
        description:
          "Perfect after a long day — warm the oil, massage gently, and unwind.",
        image: "/images/products/abhyang-tel.jpg",
      },
    ],
    ingredients: [
      { name: "Ayurvedic Massage Oil Base", benefit: "Skin nourishment" },
      { name: "Traditional Herbal Infusion", benefit: "Relaxation & wellness" },
    ],
    howToUse:
      "Warm a small amount of oil between your palms and massage gently onto the body using circular motions.",
    signatureInteraction: "oil-flow",
    rating: 4.7,
    reviewCount: 67,
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export const lipBalmFlavorImages: Record<string, string> = {
  Strawberry: "/images/products/lip-balm-strawberry.jpg",
  Apple: "/images/products/lip-balm-lineup.jpg",
  Mango: "/images/products/lip-balm-lineup.jpg",
  Vanilla: "/images/products/lip-balm-lineup.jpg",
  Chocolate: "/images/products/lip-balm-lineup.jpg",
};
