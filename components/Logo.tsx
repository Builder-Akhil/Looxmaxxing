import Link from "next/link";
import clsx from "clsx";
import { brand } from "@/lib/brand";

export function Logo({
  className,
  size = "md",
  href = "/",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
}) {
  const sizes = { sm: "text-[17px]", md: "text-[20px]", lg: "text-[26px]" };
  const [head, ...rest] = brand.name.split("x");
  return (
    <Link
      href={href}
      className={clsx(
        "font-display font-bold tracking-[-0.015em] text-ink transition-colors hover:text-brass-ink",
        sizes[size],
        className,
      )}
      aria-label={brand.name}
    >
      {head}
      <span className="text-brass">x</span>
      {rest.join("x")}
    </Link>
  );
}
