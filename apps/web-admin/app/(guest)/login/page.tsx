"use client";

import { App, Input } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { useAdminLogin } from "@/api";
import { ADMIN_ROUTES } from "@vokcg/constants";
import { useAdminAuthStore } from "@/store";
import {
  AuthAlert,
  AuthField,
  AuthFormActions,
  AuthFormFields,
  AuthFormStack,
  AuthSubmitButton,
  authInputClassName,
  LoadingScreen,
} from "@vokcg/ui";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAdminLogin();
  const clearSession = useAdminAuthStore((s) => s.clearSession);
  const { message } = App.useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const redirectTo = searchParams.get("from") ?? ADMIN_ROUTES.overview;
  const accessError = searchParams.get("error");

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (emailError) setEmailError("");
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (passwordError) setPasswordError("");
  };

  const handleSubmit = () => {
    let hasError = false;

    if (!email) {
      setEmailError("Email is required");
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address");
      hasError = true;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Password is required");
      hasError = true;
    } else {
      setPasswordError("");
    }

    if (hasError) return;

    login.mutate(
      { email, password },
      {
        onSuccess: () => {
          if (!useAdminAuthStore.getState().isAdmin()) {
            clearSession();
            message.error("This account does not have admin access.");
            return;
          }

          const destination =
            redirectTo.startsWith("/") && !redirectTo.startsWith("//")
              ? redirectTo
              : ADMIN_ROUTES.overview;
          router.replace(destination);
        },
        onError: (err) => message.error(err.message),
      },
    );
  };

  return (
    <AuthFormStack>
      {accessError === "forbidden" && (
        <AuthAlert tone="error">
          You don&apos;t have permission to access the admin console.
        </AuthAlert>
      )}

      <AuthFormFields>
        <AuthField label="Email" htmlFor="admin-email" error={emailError}>
          <Input
            id="admin-email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            type="email"
            placeholder="you@example.com"
            size="large"
            autoFocus
            status={emailError ? "error" : undefined}
            className={authInputClassName}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </AuthField>

        <AuthField
          label="Password"
          htmlFor="admin-password"
          error={passwordError}
        >
          <Input.Password
            id="admin-password"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            placeholder="Your password"
            size="large"
            status={passwordError ? "error" : undefined}
            className={authInputClassName}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </AuthField>
      </AuthFormFields>

      <AuthFormActions>
        <AuthSubmitButton loading={login.isPending} onClick={handleSubmit}>
          Sign in
        </AuthSubmitButton>
      </AuthFormActions>
    </AuthFormStack>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AdminLoginForm />
    </Suspense>
  );
}
