import { redirect } from "next/navigation";

// Legacy Upolabdhi Vite routes must never render inside the SS Supplement app.
export default function LegacyRoute() { redirect("/"); }
