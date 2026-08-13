"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";

/** Entry point: route to the app when authenticated, otherwise to login. */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(isLoggedIn() ? "/tasks" : "/login");
  }, [router]);

  return null;
}
