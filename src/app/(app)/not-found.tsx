"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AppNotFound() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/cuenta");
  }, [router]);
  return null;
}
