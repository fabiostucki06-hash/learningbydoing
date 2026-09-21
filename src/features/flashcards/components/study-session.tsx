"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import { ChevronLeft, Check, PartyPopper, X } from "lucide-react";
import { Button, buttonStyles } from "@/components/ui/button";
import { reviewCard } from "../actions";
import type { StudyCard } from "../types";
import { ProgressBar } from "./progress-bar";

/** Ab dieser Wischweite (px) gilt die Karte als bewertet. */
const SWIPE_THRESHOLD = 96;
/** Bewegung unterhalb dieser Weite zählt als Tippen (Umdrehen), nicht als Wischen. */
const TAP_SLOP = 8;

type Props = {
  deckId: string;
  deckTitle: string;
  cards: StudyCard[];
};

/**
 * Lernrunde: Tippen dreht die Karte um, danach Wischen (rechts = gewusst, links = nochmal) oder
 * Buttons. Nicht gewusste Karten kommen am Ende der Runde noch einmal. Die Bewertung wird im
 * Hintergrund gespeichert, die nächste Karte erscheint ohne Wartezeit.
 */
export function StudySession({ deckId, deckTitle, cards }: Props) {
  const [queue, setQueue] = useState<StudyCard[]>(cards);
  const [revealed, setRevealed] = useState(false);
  const [step, setStep] = useState(0); // Neu-Mount pro Karte: nächste Karte dreht nie sichtbar zurück
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [results, setResults] = useState({ known: 0, again: 0 });
  const [error, setError] = useState<string | null>(null);

  const startX = useRef<number | null>(null);
  const moved = useRef(false);

  const current = queue[0];
  const total = cards.length;

  function rate(known: boolean) {
    if (!current) return;
    const card = current;

    reviewCard(card.id, known)
      .then((result) => {
        if (result.error) setError(result.error);
      })
      .catch(() => setError("Verbindung unterbrochen. Die letzte Bewertung wurde nicht gespeichert."));

    setResults((r) => (known ? { ...r, known: r.known + 1 } : { ...r, again: r.again + 1 }));
    setQueue((q) => (known ? q.slice(1) : [...q.slice(1), card]));
    setRevealed(false);
    setDragX(0);
    setStep((s) => s + 1);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    startX.current = event.clientX;
    moved.current = false;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (startX.current === null) return;
    const dx = event.clientX - startX.current;
    if (Math.abs(dx) > TAP_SLOP) moved.current = true;
    // Gewischt wird erst nach dem Umdrehen, damit niemand aus Versehen bewertet.
    if (revealed) setDragX(dx);
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (startX.current === null) return;
    const dx = event.clientX - startX.current;
    startX.current = null;
    setDragging(false);

    if (!moved.current) {
      setRevealed((r) => !r);
      setDragX(0);
      return;
    }
    if (revealed && Math.abs(dx) >= SWIPE_THRESHOLD) {
      rate(dx > 0);
      return;
    }
    setDragX(0);
  }

  function handlePointerCancel() {
    startX.current = null;
    setDragging(false);
    setDragX(0);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      setRevealed((r) => !r);
    } else if (revealed && event.key === "ArrowRight") {
      rate(true);
    } else if (revealed && event.key === "ArrowLeft") {
      rate(false);
    }
  }

  if (!current) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
          <PartyPopper aria-hidden className="size-7" />
        </span>
        <h1 className="text-xl font-semibold">Runde geschafft!</h1>
        <p className="text-sm text-muted">
          {results.known} {results.known === 1 ? "Karte" : "Karten"} gewusst
          {results.again > 0 && ` · ${results.again}× wiederholt`}
        </p>
        <Link href={`/practice/${deckId}`} className={buttonStyles("primary", "w-full")}>
          Zurück zum Deck
        </Link>
        <Link href="/practice" className={buttonStyles("ghost", "w-full")}>
          Alle Decks
        </Link>
      </div>
    );
  }

  const tint = Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1) * 0.55;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link
          href={`/practice/${deckId}`}
          className="pressable -ml-2 inline-flex h-11 max-w-full items-center gap-1 rounded-xl px-2 text-sm text-muted"
        >
          <ChevronLeft aria-hidden className="size-4 shrink-0" />
          <span className="truncate">{deckTitle}</span>
        </Link>
        <div className="mt-1 flex items-center gap-3">
          <div className="flex-1">
            <ProgressBar percent={(results.known / total) * 100} label="Fortschritt dieser Runde" />
          </div>
          <span className="shrink-0 text-xs text-muted" aria-live="polite">
            {results.known} / {total}
          </span>
        </div>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label={revealed ? "Antwort sichtbar. Zum Zurückdrehen tippen." : "Antwort anzeigen"}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onKeyDown={handleKeyDown}
        className="relative cursor-pointer select-none rounded-3xl outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        style={{
          // pan-y: senkrechtes Scrollen bleibt, waagerechte Bewegung gehört der Wisch-Geste.
          touchAction: "pan-y",
          transform: `translateX(${dragX}px) rotate(${dragX / 24}deg)`,
          transition: dragging ? "none" : "transform 200ms ease-out",
        }}
      >
        <div className="flip-scene">
          <div key={step} className="flip-card h-[min(26rem,52dvh)]" data-flipped={revealed}>
            <Face label="Frage" text={current.front} hidden={revealed} />
            <Face label="Antwort" text={current.back} hidden={!revealed} back />
          </div>
        </div>

        {/* Farbverlauf beim Wischen: grün = gewusst, rot = nochmal. */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 rounded-3xl ${
            dragX >= 0 ? "bg-emerald-500" : "bg-red-500"
          }`}
          style={{ opacity: tint }}
        />
      </div>

      <p className="text-center text-xs text-muted">
        {revealed
          ? "Wische nach rechts: gewusst · nach links: nochmal"
          : "Tippe auf die Karte, um die Antwort zu sehen"}
      </p>

      {error && (
        <p role="alert" className="text-center text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" disabled={!revealed} onClick={() => rate(false)}>
          <X aria-hidden className="size-4" />
          Nochmal
        </Button>
        <Button disabled={!revealed} onClick={() => rate(true)}>
          <Check aria-hidden className="size-4" />
          Gewusst
        </Button>
      </div>
    </div>
  );
}

function Face({
  label,
  text,
  hidden,
  back = false,
}: {
  label: string;
  text: string;
  hidden: boolean;
  back?: boolean;
}) {
  return (
    <div
      aria-hidden={hidden}
      className={`flip-face scrollbar-none flex overflow-y-auto rounded-3xl border border-border bg-surface p-6 shadow-lg ${
        back ? "flip-face-back" : ""
      }`}
    >
      {/* m-auto statt items-center: zentriert kurze Texte, lässt lange von oben scrollen. */}
      <div className="m-auto w-full text-center">
        <span className="mb-3 inline-block rounded-full bg-brand/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-brand">
          {label}
        </span>
        <p className="whitespace-pre-wrap break-words text-lg leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
