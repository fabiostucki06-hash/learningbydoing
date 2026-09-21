"use client";

import { AlertTriangle, Clock } from "lucide-react";
import type { ExamSummary } from "../types";
import { formatExamDateTime } from "../format";
import { useNow } from "../use-now";
import { URGENCY_STYLES, formatCountdown, getUrgency } from "../urgency";
import { DeleteExamButton } from "./delete-exam-button";

const VISIBLE_TOPICS = 3;

type Props = {
  exam: ExamSummary;
  /** Serverzeit in ms, damit Server- und Client-Render übereinstimmen. */
  serverNow: number;
  showDelete?: boolean;
};

/** Prüfungskarte mit Live-Countdown und Farbcodierung (< 7 Tage gelb, < 24 Std. rot). */
export function ExamCard({ exam, serverNow, showDelete = true }: Props) {
  const now = useNow(serverNow);
  const msUntil = new Date(exam.starts_at).getTime() - now;
  const urgency = getUrgency(msUntil);
  const styles = URGENCY_STYLES[urgency];
  const label = exam.title ? `${exam.subject} · ${exam.title}` : exam.subject;

  const Icon = urgency === "critical" || urgency === "soon" ? AlertTriangle : Clock;

  return (
    <li className={`rounded-2xl border p-4 shadow-sm ${styles.card}`}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium">{label}</h3>
          <p className="mt-0.5 text-sm text-muted">{formatExamDateTime(exam.starts_at)}</p>
        </div>
        {showDelete && <DeleteExamButton id={exam.id} label={label} />}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${styles.pill}`}
        >
          <Icon aria-hidden className="size-3.5" />
          {formatCountdown(msUntil)}
        </span>
        {styles.label && <span className="text-xs text-muted">{styles.label}</span>}
      </div>

      {exam.topics.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Themen">
          {exam.topics.slice(0, VISIBLE_TOPICS).map((topic) => (
            <li
              key={topic}
              className="max-w-full truncate rounded-full bg-surface-hover px-2.5 py-1 text-xs text-muted"
            >
              {topic}
            </li>
          ))}
          {exam.topics.length > VISIBLE_TOPICS && (
            <li className="rounded-full bg-surface-hover px-2.5 py-1 text-xs text-muted">
              +{exam.topics.length - VISIBLE_TOPICS}
            </li>
          )}
        </ul>
      )}
    </li>
  );
}
