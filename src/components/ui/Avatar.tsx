import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
}

export function Avatar({ src, alt, size = 36, className }: AvatarProps) {
  const initials = alt
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (!src) {
    return (
      <div
        className={cn(
          "rounded-full bg-brand-100 flex items-center justify-center font-semibold text-brand-700 shrink-0",
          className
        )}
        style={{ width: size, height: size, fontSize: size * 0.38 }}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={cn("rounded-full overflow-hidden shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="object-cover w-full h-full"
      />
    </div>
  );
}
