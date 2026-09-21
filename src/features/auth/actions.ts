"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error?: string;
  message?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function login(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = readString(formData, "email");
  const password = String(formData.get("password") ?? "");

  if (!EMAIL_PATTERN.test(email) || !password) {
    return { error: "Bitte E-Mail und Passwort eingeben." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Bewusst generisch: verrät nicht, ob die E-Mail existiert.
    return { error: "E-Mail oder Passwort ist falsch." };
  }

  redirect("/dashboard");
}

export async function register(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const displayName = readString(formData, "displayName");
  const email = readString(formData, "email");
  const password = String(formData.get("password") ?? "");

  if (!displayName || displayName.length > 80) {
    return { error: "Bitte einen Namen mit 1–80 Zeichen eingeben." };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { error: "Bitte eine gültige E-Mail-Adresse eingeben." };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      error: `Das Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen lang sein.`,
    };
  }

  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: "Registrierung fehlgeschlagen. Bitte später erneut versuchen." };
  }

  // Ohne E-Mail-Bestätigung liefert Supabase sofort eine Session.
  if (data.session) {
    redirect("/dashboard");
  }

  return {
    message:
      "Fast geschafft! Wir haben dir eine Bestätigungsmail geschickt. Klicke auf den Link darin, um dich anzumelden.",
  };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
