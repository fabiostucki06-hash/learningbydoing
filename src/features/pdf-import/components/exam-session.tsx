"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronLeft, RotateCcw, X } from "lucide-react";
import { Button, buttonStyles } from "@/components/ui/button";
import type { ExamQuestion } from "../types";

type Props = {
  deckId: string;
  deckTitle: string;
  title: string;
  questions: ExamQuestion[];
};

const LETTERS = ["A", "B", "C", "D", "E", "F"];

/**
 * Probeprüfung: alle Fragen beantworten, dann auswerten. Erst nach dem Auswerten werden
 * richtige Antworten und Erklärungen gezeigt, damit man sich nicht selbst die Lösung verrät.
 */
export function ExamSession({ deckId, deckTitle, title, questions }: Props) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  // Neu-Mount der Radio-Gruppen beim Wiederholen: löscht die Auswahl sicher.
  const [round, setRound] = useState(0);

  const answered = answers.filter((answer) => answer !== null).length;
  const correct = answers.filter((answer, i) => answer === questions[i].correctIndex).length;
  const percent = Math.round((correct / questions.length) * 100);

  function select(question: number, option: number) {
    if (submitted) return;
    setAnswers((current) => current.map((value, i) => (i === question ? option : value)));
  }

  function retry() {
    setAnswers(questions.map(() => null));
    setSubmitted(false);
    setRound((r) => r + 1);
    window.scrollTo({ top: 0 });
  }

  function submit() {
    setSubmitted(true);
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link
          href={`/practice/${deckId}`}
          className="pressable -ml-2 inline-flex h-11 max-w-full items-center gap-1 rounded-xl px-2 text-sm text-muted"
        >
          <ChevronLeft aria-hidden className="size-4 shrink-0" />
          <span className="truncate">{deckTitle}</span>
        </Link>
        <h1 className="break-words text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted">{questions.length} Fragen · genau eine Antwort ist richtig</p>
      </div>

      {submitted && (
        <section
          role="status"
          className="rounded-2xl border border-border bg-surface p-4 text-center shadow-sm"
        >
          <p className="text-3xl font-semibold">{percent} %</p>
          <p className="mt-1 text-sm text-muted">
            {correct} von {questions.length} richtig
          </p>
        </section>
      )}

      <ol className="flex flex-col gap-4">
        {questions.map((question, qi) => {
          const chosen = answers[qi];
          const isRight = chosen === question.correctIndex;

          return (
            <li key={qi}>
              <fieldset
                key={round}
                className="rounded-2xl border border-border bg-surface p-4 shadow-sm"
              >
                <legend className="sr-only">Frage {qi + 1}</legend>
                <p className="mb-3 whitespace-pre-wrap break-words font-medium">
                  <span className="text-muted">{qi + 1}. </span>
                  {question.question}
                </p>

                <div className="flex flex-col gap-2">
                  {question.options.map((option, oi) => {
                    const selected = chosen === oi;
                    const isCorrectOption = oi === question.correctIndex;

                    let tone = "border-border hover:bg-surface-hover";
                    if (submitted && isCorrectOption) tone = "border-emerald-500 bg-emerald-500/10";
                    else if (submitted && selected) tone = "border-red-500 bg-red-500/10";
                    else if (selected) tone = "border-brand bg-brand/10";

                    return (
                      <label
                        key={oi}
                        className={`pressable flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand ${tone} ${
                          submitted ? "cursor-default" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${qi}`}
                          checked={selected}
                          disabled={submitted}
                          onChange={() => select(qi, oi)}
                          className="sr-only"
                        />
                        <span className="w-4 shrink-0 font-medium text-muted">{LETTERS[oi]}</span>
                        <span className="min-w-0 flex-1 whitespace-pre-wrap break-words">{option}</span>
                        {submitted && isCorrectOption && (
                          <Check aria-label="Richtig" className="size-4 shrink-0 text-emerald-600" />
                        )}
                        {submitted && selected && !isCorrectOption && (
                          <X aria-label="Falsch" className="size-4 shrink-0 text-red-600" />
                        )}
                      </label>
                    );
                  })}
                </div>

                {submitted && (
                  <p className="mt-3 whitespace-pre-wrap break-words text-sm text-muted">
                    <span className="font-medium text-foreground">
                      {chosen === null ? "Nicht beantwortet. " : isRight ? "Richtig. " : "Leider falsch. "}
                    </span>
                    {question.explanation}
                  </p>
                )}
              </fieldset>
            </li>
          );
        })}
      </ol>

      {submitted ? (
        <div className="grid gap-3">
          <Button onClick={retry}>
            <RotateCcw aria-hidden className="size-4" />
            Nochmal versuchen
          </Button>
          <Link href={`/practice/${deckId}`} className={buttonStyles("ghost")}>
            Zurück zum Deck
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Button onClick={submit} disabled={answered === 0}>
            Auswerten ({answered} / {questions.length} beantwortet)
          </Button>
        </div>
      )}
    </div>
  );
}
