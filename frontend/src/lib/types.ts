export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  images: string[];
  category: string;
  benefits: string[];
  features: { title: string; description: string; image: string }[];
  ingredients: { name: string; benefit: string }[];
  howToUse: string;
  flavors?: string[];
  signatureInteraction?: "texture-zoom" | "flavor-swipe" | "oil-flow";
  rating: number;
  reviewCount: number;
};

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: ArticleCategory;
  author: string;
  readingTime: number;
  publishedAt: string;
};

export type ArticleCategory =
  | "Daily Routine"
  | "Ingredients"
  | "Lip Care"
  | "Ayurveda"
  | "Healthy Skin"
  | "Natural Remedies";

export type QuizAnswers = {
  skinType: string;
  mainConcern: string;
  desiredGoal: string;
  additionalNotes?: string;
};

export type QuizRecommendation = {
  products: Product[];
  rationale: string;
  tips: string[];
  aiAssisted: boolean;
};

export type Testimonial = {
  id: string;
  name: string;
  location: string;
  quote: string;
  rating: number;
  image: string;
  verified: boolean;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type OrderItem = {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
};

export type OrderTimelineEvent = {
  status: string;
  message: string;
  created_at: string;
};

export type OrderDetails = {
  order_id: string;
  status: string;
  total: number;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
  };
  items: OrderItem[];
  tracking_number: string | null;
  carrier: string;
  created_at: string;
  timeline: OrderTimelineEvent[];
};

export type CheckoutResponse = OrderDetails;
