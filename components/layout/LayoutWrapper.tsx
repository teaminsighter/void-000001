"use client";

import { usePathname } from "next/navigation";
import MainLayout from "./MainLayout";

const BARE_PATHS = ["/login"];

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();

  if (BARE_PATHS.includes(pathname)) {
    return <>{children}</>;
  }

  return <MainLayout>{children}</MainLayout>;
}
