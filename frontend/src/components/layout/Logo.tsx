import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  variant?: "default" | "light";
  priority?: boolean;
};

export function Logo({ className = "", variant = "default", priority = false }: LogoProps) {
  const src =
    variant === "light"
      ? "/logo-light.png"
      : "/logo.png";

  return (
    <Link
      href="/"
      className={cn("inline-flex items-center", className)}
      aria-label="KindSkin Co. Home"
    >
      <Image
        src={src}
        alt="KindSkin Co. — The Kind Way To Glow."
        width={160}
        height={152}
        priority={priority}
        className="h-11 w-auto"
      />
    </Link>
  );
}
