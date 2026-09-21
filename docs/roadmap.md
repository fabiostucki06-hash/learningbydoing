# Roadmap und Architektur

Stand: Modul 2 (Prüfungskalender) ist umgesetzt. Alle weiteren Module folgen demselben Muster:
eigene Migration mit RLS in `supabase/migrations/`, Fachlogik in `src/features/<modul>/`,
Seiten unter `src/app/(app)/<route>/`. Nach jeder Migration `src/types/database.ts` neu generieren.

## Umgesetzt

| Modul | Inhalt |
| --- | --- |
| Basis | Auth, Profile, PDF-Upload (privater Bucket, RLS), PWA, Versions-Stempel, Update-Erkennung |
| Prüfungskalender | Tabelle `exams`, Monatskalender, Live-Countdown (< 7 Tage gelb, < 24 Std. rot), In-App-Erinnerungen mit Tagesplan |

## Offen (Reihenfolge = Empfehlung)

### 1. Karteikarten + Spaced Repetition
- Tabellen: `decks (id, user_id, document_id?, title)`, `cards (id, deck_id, user_id, front, back, box, due_at, last_reviewed_at)`,
  `reviews (id, card_id, user_id, rating, reviewed_at)` für Streak und Statistik.
- SRS: Leitner mit 5 Boxen (Intervalle 1/2/4/8/16 Tage). Richtig: Box +1, falsch: zurück auf Box 1. `due_at` = jetzt + Intervall.
  Reine Funktion `nextReview(card, rating)` in `features/flashcards/srs.ts`, per Test abgesichert.
- UI: Flip-Karte (CSS-Transform), Swipe rechts = gewusst, links = nicht gewusst (Pointer Events), Buttons als Fallback (44 px).
- Gamification: Streak = aufeinanderfolgende Tage (Europe/Zurich) mit mindestens einer Review; Fortschrittsbalken pro Deck = Karten in Box >= 4.

### 2. KI-Analyse der PDFs (Claude API)
- Env: `ANTHROPIC_API_KEY` nur serverseitig (lokal `.env.local`, in Vercel als Secret). Nie `NEXT_PUBLIC_`.
- Ablauf: Server Action lädt das PDF per Signed URL aus dem Bucket, sendet es als Dokument an die API und
  erhält strukturiertes JSON (Karten, Multiple-Choice mit Erklärung, offene Fragen). Ergebnis in `cards`, `quiz_questions`.
- `documents.status` (`uploaded` -> `processing` -> `ready` | `failed`) existiert bereits und steuert die Anzeige.
- Kostenkontrolle: Seitenlimit pro PDF, Rate-Limit pro Nutzer (Tabelle `ai_usage`), Ergebnis cachen statt neu erzeugen.
- Chat mit Dokument: Route Handler mit Streaming, Verlauf in `chat_messages (document_id, user_id, role, content)`.

### 3. Community-Prüfungsdatenbank
- Tabellen: `schools (id, name, canton)`, `past_exams (id, uploader_id, school_id, subject, grade, year, teacher?, storage_path, status)`,
  `past_exam_votes (past_exam_id, user_id, value)` mit Primärschlüssel über beide Spalten (eine Stimme pro Nutzer).
- Eigener Bucket `past-exams`; Lesen für alle angemeldeten Nutzer, Schreiben nur im eigenen Ordner.
- Moderation ist Pflicht: Status `pending` -> `approved`, Melde-Button, Lehrpersonen-Namen und Urheberrecht klären, bevor es live geht.
- Suche: Postgres-Filter nach Kanton, Schule, Fach, Jahr; Sortierung nach Upvotes.

### 4. Push-Benachrichtigungen
- `push_subscriptions (user_id, endpoint, keys)`, VAPID-Schlüssel als Env, `web-push` im Server.
- Ein Vercel-Cron ruft täglich eine Route auf, die `buildReminders()` (schon vorhanden) pro Nutzer auswertet und Push sendet.
- Der Service Worker bekommt `push`- und `notificationclick`-Handler. iOS liefert Push nur für installierte PWAs.

### 5. Offline-Modus
- Karten und Prüfungen beim Laden in IndexedDB spiegeln; Reviews offline in eine Warteschlange schreiben und bei Verbindung synchronisieren.
- Der Service Worker cached bewusst weiter kein HTML; Offline-Daten liegen in IndexedDB, nicht im SW-Cache.
