"use client";

import { App, Input } from "antd";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { useLogin } from "@/api";
import { USER_ROUTES } from "@vokcg/constants";
import {
  AuthCardHeader,
  AuthField,
  AuthFooterText,
  AuthFormActions,
  AuthFormFields,
  AuthFormStack,
  AuthSubmitButton,
  authInputClassName,
  LoadingScreen,
} from "@vokcg/ui";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();
  const { message } = App.useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const redirectTo = searchParams.get("from") ?? USER_ROUTES.create;

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
        onSuccess: () => router.push(redirectTo),
        onError: (err) => message.error(err.message),
      },
    );
  };

  return (
    <AuthFormStack>
      <AuthFormFields>
        <AuthField label="Email" htmlFor="email" error={emailError}>
          <Input
            id="email"
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

        <AuthField label="Password" htmlFor="password" error={passwordError}>
          <Input.Password
            id="password"
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

      <AuthFooterText>
        No account?{" "}
        <Link
          href={USER_ROUTES.register}
          className="font-semibold text-accent transition-opacity hover:opacity-80"
        >
          Create one
        </Link>
      </AuthFooterText>
    </AuthFormStack>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <LoginForm />
    </Suspense>
  );
}
