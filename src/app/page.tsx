import { redirect } from "next/navigation";

// Nicht eingeloggte Nutzer leitet proxy.ts bereits auf /login um.
export default function Home() {
  redirect("/dashboard");
}
