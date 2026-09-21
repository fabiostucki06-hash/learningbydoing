"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, register, type AuthFormState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: AuthFormState = {};

type Props = {
  mode: "login" | "register";
  /** Fehlermeldung aus der URL, z. B. nach fehlgeschlagener E-Mail-Bestätigung. */
  initialError?: string;
};

export function AuthForm({ mode, initialError }: Props) {
  const isLogin = mode === "login";
  const [state, formAction, pending] = useActionState(
    isLogin ? login : register,
    initialState,
  );
  const error = state.error ?? initialError;

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {!isLogin && (
        <Input
          label="Name"
          name="displayName"
          type="text"
          autoComplete="name"
          maxLength={80}
          required
        />
      )}
      <Input
        label="E-Mail"
        name="email"
        type="email"
        autoComplete="email"
        required
      />
      <Input
        label="Passwort"
        name="password"
        type="password"
        autoComplete={isLogin ? "current-password" : "new-password"}
        minLength={isLogin ? undefined : 8}
        hint={isLogin ? undefined : "Mindestens 8 Zeichen"}
        required
      />

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {state.message && (
        <p role="status" className="text-sm text-emerald-700 dark:text-emerald-400">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Bitte warten …" : isLogin ? "Anmelden" : "Konto erstellen"}
      </Button>

      <p className="text-center text-sm text-muted">
        {isLogin ? "Noch kein Konto? " : "Schon registriert? "}
        <Link
          href={isLogin ? "/register" : "/login"}
          className="pressable inline-block py-2 font-medium text-brand hover:underline"
        >
          {isLogin ? "Registrieren" : "Anmelden"}
        </Link>
      </p>
    </form>
  );
}
