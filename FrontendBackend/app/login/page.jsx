"use client";

import dynamic from "next/dynamic";

const LoginWithRouter = dynamic(
  () => import("../../components/auth/LoginWithRouter.jsx"),
  { ssr: false },
);

export default function LoginPage() {
  return <LoginWithRouter />;
}
