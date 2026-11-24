import AuthPanel from "../../components/inventory/AuthPanel.jsx";

// This route deliberately uses the SS Supplement auth flow, not the legacy Vite/Upolabdhi login.
// Successful verification routes administrators to /admin and employees to /employee.
export default function LoginPage() {
  return <AuthPanel />;
}
