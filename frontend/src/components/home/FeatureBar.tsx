import { Leaf, ShieldOff, Package, Users } from "lucide-react";

const features = [
  { icon: Leaf, label: "Pure Ingredients" },
  { icon: ShieldOff, label: "No Harmful Chemicals" },
  { icon: Package, label: "Made in Small Batches" },
  { icon: Users, label: "Trusted by 1000+ Customers" },
];

export function FeatureBar() {
  return (
    <div className="rounded-xl bg-cream-dark/80 border border-forest/5 px-4 py-5 md:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {features.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center text-center gap-2">
            <Icon className="h-5 w-5 text-sage" strokeWidth={1.5} />
            <span className="text-xs font-medium text-forest/80 leading-tight">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
