"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { CenterSpinner } from "@/frontend/common_ui/elements/CenterSpinner";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/landing");
  }, [router]);

  return (
    <>
      <CenterSpinner></CenterSpinner>
    </>
  );
}
