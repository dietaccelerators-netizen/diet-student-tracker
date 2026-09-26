import Image from "next/image";

export function BrandLogo({ variant = "icon", priority = false }: { variant?: "icon" | "wordmark"; priority?: boolean }) {
  if (variant === "wordmark") {
    return (
      <Image
        src="/brand/diet-wordmark.png"
        alt="DIET Accelerator"
        width={1048}
        height={370}
        priority={priority}
        className="h-auto w-full"
      />
    );
  }

  return (
    <Image
      src="/brand/diet-icon.png"
      alt="DIET Accelerator"
      width={743}
      height={750}
      priority={priority}
      className="h-full w-full object-contain"
    />
  );
}
