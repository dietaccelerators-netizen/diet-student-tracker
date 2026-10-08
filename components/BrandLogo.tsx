import Image from "next/image";

/** Shared Mastrevo identity for portal and registration headers. */
export function BrandLogo({ variant = "icon", priority = false }: { variant?: "icon" | "wordmark"; priority?: boolean }) {
  if (variant === "icon") {
    return <Image src="/brand/mastrevo-guideline-icon.png" alt="Mastrevo" width={1280} height={1280} preload={priority} sizes="48px" className="h-full w-full object-contain" />;
  }
  return <Image src="/brand/mastrevo-guideline-wordmark.png" alt="Mastrevo" width={1077} height={287} preload={priority} sizes="(max-width: 760px) 160px, 240px" className="h-auto w-full" />;
}
