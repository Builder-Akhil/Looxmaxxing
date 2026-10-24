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
        "inline-flex items-center font-display font-bold tracking-[-0.03em] text-ink transition-colors hover:text-brass-ink",
        sizes[size],
        className,
      )}
      aria-label={brand.name}
    >
      <span className="mr-2 inline-flex h-[1.15em] w-[1.15em] items-center justify-center bg-brass align-[-0.18em] text-[0.8em] font-bold leading-none text-on-brass">
        L
      </span>
      {head}
      <span className="text-brass">x</span>
      {rest.join("x")}
    </Link>
  );
}
