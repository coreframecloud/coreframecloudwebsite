"use client";

import Link from "next/link";
import { MouseEvent, ReactNode } from "react";
import { usePathname } from "next/navigation";

type InPageLinkProps = {
  targetId: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
};

export function InPageLink({
  targetId,
  className,
  children,
  onClick,
}: InPageLinkProps) {
  const pathname = usePathname();

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.();

    if (pathname === "/") {
      e.preventDefault();

      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState({}, "", "/");
      }
    }
  }

  return (
    <Link href={`/#${targetId}`} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
