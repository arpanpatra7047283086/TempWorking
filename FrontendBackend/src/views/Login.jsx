import { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import AuthShell from "../components/auth/AuthShell.jsx";
import Field from "../components/auth/Field.jsx";
import { logout as clearLegacyAuth } from "../Actions/LoginAction.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function requestInventoryAuth(endpoint, body) {
  const response = await fetch(`/api/auth/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `Sign in failed (${response.status}).`);
    error.retryAfterSeconds = data.retryAfterSeconds;
    throw error;
  }
  return data;
}

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [code, setCode] = useState("");
  const [step, setStep] = useState("credentials");
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ loading: false, message: "", isError: false });
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (resendSeconds <= 0) return undefined;
    const timeout = window.setTimeout(
      () => setResendSeconds((seconds) => Math.max(0, seconds - 1)),
      1000,
    );
    return () => window.clearTimeout(timeout);
  }, [resendSeconds]);

  const set = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const onSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (step === "credentials") {
      if (!EMAIL_RE.test(form.email.trim())) nextErrors.email = "Enter a valid email address.";
      if (form.password.length < 8 || form.password.length > 256) {
        nextErrors.password = "Password must be between 8 and 256 characters.";
      }
    } else if (!/^\d{6}$/.test(code)) {
      nextErrors.code = "Enter the six-digit verification code.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setStatus({ loading: true, message: "", isError: false });
    try {
      if (step === "credentials") {
        await requestInventoryAuth("login", {
          email: form.email.trim().toLowerCase(),
          password: form.password,
        });
        setStep("verification");
        setResendSeconds(15);
        setStatus({
          loading: false,
          message: `A verification code was sent to ${form.email.trim()}.`,
          isError: false,
        });
        return;
      }

      const result = await requestInventoryAuth("verify-otp", {
        email: form.email.trim().toLowerCase(),
        code,
      });
      if (!["SUPER_ADMIN", "EMPLOYEE"].includes(result.role)) {
        throw new Error("This account does not have store workspace access.");
      }

      clearLegacyAuth();
      window.location.assign(result.role === "SUPER_ADMIN" ? "/admin" : "/employee");
    } catch (error) {
      if (Number.isInteger(error.retryAfterSeconds)) {
        setResendSeconds(error.retryAfterSeconds);
      }
      setStatus({ loading: false, message: error.message, isError: true });
    }
  };

  const resendCode = async () => {
    setStatus({ loading: true, message: "", isError: false });
    try {
      await requestInventoryAuth("login", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      setCode("");
      setResendSeconds(15);
      setStatus({ loading: false, message: "A new verification code was sent.", isError: false });
    } catch (error) {
      if (Number.isInteger(error.retryAfterSeconds)) {
        setResendSeconds(error.retryAfterSeconds);
      }
      setStatus({ loading: false, message: error.message, isError: true });
    }
  };

  const changeAccount = () => {
    setStep("credentials");
    setCode("");
    setErrors({});
    setStatus({ loading: false, message: "", isError: false });
    setResendSeconds(0);
  };

  return (
    <AuthShell mode="login" hideSignUp>
      <p className="font-mono text-[11px] tracking-[0.22em] text-ink/45 uppercase">
        {step === "credentials" ? "Welcome back" : "Verify your sign-in"}
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-ink md:text-4xl">
        {step === "credentials" ? "Good to have you here." : "Check your inbox."}
      </h1>
      <p className="mt-2 text-sm text-ink/55">
        {step === "credentials"
          ? "Sign in to your store operations workspace."
          : `Enter the six-digit code sent to ${form.email.trim()}.`}
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
        {step === "credentials" ? (
          <>
            <Field
              label="Email"
              type="email"
              autoComplete="username"
              placeholder="you@example.com"
              value={form.email}
              onChange={set("email")}
              error={errors.email}
            />
            <Field
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              value={form.password}
              onChange={set("password")}
              error={errors.password}
            />
            <p className="text-right text-xs text-ink/50">
              Need a password reset? Contact your administrator.
            </p>
          </>
        ) : (
          <Field
            label="Verification code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            pattern="[0-9]{6}"
            placeholder="6-digit code"
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            error={errors.code}
          />
        )}

        {status.message && (
          <p
            role={status.isError ? "alert" : "status"}
            className={`rounded-xl border px-4 py-3 text-sm ${
              status.isError
                ? "border-amber/50 bg-amber/10 text-ink/80"
                : "border-emerald/20 bg-emerald/5 text-ink/70"
            }`}
          >
            {status.message}
          </p>
        )}

        <button
          type="submit"
          disabled={status.loading}
          className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-ink font-semibold text-cream transition-colors hover:bg-emerald disabled:opacity-60"
        >
          {status.loading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <>
              {step === "credentials" ? "Continue" : "Verify and sign in"}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      {step === "verification" && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <button
            type="button"
            disabled={status.loading || resendSeconds > 0}
            onClick={resendCode}
            className="font-semibold text-emerald disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : "Resend verification code"}
          </button>
          <button
            type="button"
            disabled={status.loading}
            onClick={changeAccount}
            className="text-ink/60 hover:text-ink disabled:opacity-50"
          >
            Use a different account
          </button>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-ink/55">
        Employee access is provided by your store administrator.
      </p>
    </AuthShell>
  );
}
