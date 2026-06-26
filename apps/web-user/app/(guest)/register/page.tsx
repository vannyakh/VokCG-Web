"use client";

import { App, Input } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useRegister } from "@/api";
import { USER_ROUTES } from "@vokcg/constants";
import {
  AuthField,
  AuthFooterText,
  AuthFormActions,
  AuthFormFields,
  AuthFormStack,
  AuthSubmitButton,
  authInputClassName,
} from "@vokcg/ui";

export default function RegisterPage() {
  const router = useRouter();
  const register = useRegister();
  const { message } = App.useApp();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (emailError) setEmailError("");
  };

  const handleUsernameChange = (val: string) => {
    setUsername(val);
    if (usernameError) setUsernameError("");
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

    if (!username) {
      setUsernameError("Username is required");
      hasError = true;
    } else if (username.length < 3) {
      setUsernameError("Username must be at least 3 characters");
      hasError = true;
    } else {
      setUsernameError("");
    }

    if (!password) {
      setPasswordError("Password is required");
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      hasError = true;
    } else {
      setPasswordError("");
    }

    if (hasError) return;

    register.mutate(
      {
        email,
        username,
        password,
        ...(fullName.trim() ? { full_name: fullName.trim() } : {}),
      },
      {
        onSuccess: () => router.push(USER_ROUTES.create),
        onError: (err) => message.error(err.message),
      },
    );
  };

  return (
    <AuthFormStack>
      <AuthFormFields>
        <AuthField label="Email" htmlFor="reg-email" error={emailError}>
          <Input
            id="reg-email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            type="email"
            placeholder="you@example.com"
            size="large"
            autoFocus
            status={emailError ? "error" : undefined}
            className={authInputClassName}
          />
        </AuthField>

        <AuthField
          label="Username"
          htmlFor="reg-username"
          error={usernameError}
        >
          <Input
            id="reg-username"
            value={username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            placeholder="yourname"
            size="large"
            status={usernameError ? "error" : undefined}
            className={authInputClassName}
          />
        </AuthField>

        <AuthField label="Full name" htmlFor="reg-fullname" optional>
          <Input
            id="reg-fullname"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Doe"
            size="large"
            className={authInputClassName}
          />
        </AuthField>

        <AuthField
          label="Password"
          htmlFor="reg-password"
          error={passwordError}
        >
          <Input.Password
            id="reg-password"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            placeholder="Create a strong password"
            size="large"
            status={passwordError ? "error" : undefined}
            className={authInputClassName}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </AuthField>
      </AuthFormFields>

      <AuthFormActions>
        <AuthSubmitButton loading={register.isPending} onClick={handleSubmit}>
          Create account
        </AuthSubmitButton>
      </AuthFormActions>

      <AuthFooterText>
        Already have an account?{" "}
        <Link
          href={USER_ROUTES.login}
          className="font-semibold text-accent transition-opacity hover:opacity-80"
        >
          Sign in
        </Link>
      </AuthFooterText>
    </AuthFormStack>
  );
}
