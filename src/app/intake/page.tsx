"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { CriticalQuestion, Item } from "@/lib/types";

const SAMPLE = [
  { clue: "I want to sell these Pokémon cards", img: "/img/pokemon.jpg" },
  { clue: "I want to sell this guitar pedal", img: "/img/pedal.jpg" },
  { clue: "I want to sell this chair", img: "/img/furniture.jpg" },
  { clue: "I want to sell this kids stroller", img: "/img/stroller.jpg" },
];

type Phase = "intake" | "questions" | "done";

export default function IntakePage() {
  const router = useRouter();
  const [clue, setClue] = useState("");
  const [img, setImg] = useState<string>("/img/generic.jpg");
  const [notes, setNotes] = useState("");
  const [phase, setPhase] = useState<Phase>("intake");
  const [busy, setBusy] = useState(false);
  const [item, setItem] = useState<Item | null>(null);
  const [questions, setQuestions] = useState<CriticalQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [shotTaken, setShotTaken] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);

  function onCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImg(String(reader.result));
      setShotTaken(true);
    };
    reader.readAsDataURL(file);
  }

  async function analyze(extraAnswers?: Record<string, string>) {
    setBusy(true);
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Re-submitting with answers? Reuse the existing item id so we update it
      // in place instead of creating a duplicate entry.
      body: JSON.stringify({
        clue,
        photos: [img],
        notes,
        answers: extraAnswers,
        id: extraAnswers ? item?.id : undefined,
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return;
    const it: Item = data.item;
    setItem(it);
    if (it.analysis.missingInfo.length && !extraAnswers) {
      setQuestions(it.analysis.missingInfo);
      setPhase("questions");
    } else {
      setPhase("done");
    }
  }

  async function submitAnswers() {
    // Re-run analysis with answers so price/policy reflect them.
    await analyze(answers);
    setPhase("done");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Sell something</h1>
        <p className="mt-1 text-muted">
          One clue + a photo. Hermes does the rest. That’s the whole job.
        </p>
      </div>

      {phase === "intake" && (
        <div className="panel space-y-5 p-6">
          {/* Native camera capture — opens the phone's rear camera directly. */}
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onCapture}
            className="hidden"
          />

          <div>
            <label className="label">Point at the thing you don’t want</label>
            {shotTaken ? (
              <button
                type="button"
                onClick={() => cameraRef.current?.click()}
                className="mt-2 flex w-full flex-col items-center justify-center gap-3 rounded-sm border-2 border-cash bg-cash/5 p-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="Your item" className="h-52 w-full rounded-sm object-cover" />
                <span className="text-sm font-bold text-cashdim">Photo taken · tap to retake</span>
              </button>
            ) : (
              // Black hero block — the camera is the product promise, not a field.
              <button
                type="button"
                onClick={() => cameraRef.current?.click()}
                className="relative mt-2 flex w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-sm bg-ink py-14 text-white transition active:brightness-110"
              >
                <span className="absolute left-0 top-0 h-2 w-2 bg-cash" />
                <span className="text-5xl">📷</span>
                <span className="text-lg font-black">Open camera</span>
                <span className="px-6 text-center text-xs text-white/60">
                  Snap the item — that’s all Hermes needs to start
                </span>
              </button>
            )}
          </div>

          <div>
            <label className="label">What is it? (one line)</label>
            <input
              autoFocus
              value={clue}
              onChange={(e) => setClue(e.target.value)}
              placeholder="e.g. “I want to sell this guitar pedal”"
              className="mt-2 w-full rounded-sm border border-edge bg-panel2 px-4 py-3 text-ink outline-none focus:border-cash"
            />
          </div>

          <details className="group">
            <summary className="label cursor-pointer list-none select-none">
              No camera? Use a demo item ▾
            </summary>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {SAMPLE.map((s) => (
                <button
                  key={s.img}
                  onClick={() => {
                    setImg(s.img);
                    setShotTaken(true);
                    if (!clue) setClue(s.clue);
                  }}
                  className={`overflow-hidden rounded-sm border ${
                    img === s.img ? "border-cash shadow-glow" : "border-edge"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.img} alt={s.clue} className="h-16 w-full object-cover" />
                </button>
              ))}
            </div>
          </details>

          <div>
            <label className="label">Anything to add? (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Optional context — condition, accessories, anything obvious."
              className="mt-2 w-full rounded-sm border border-edge bg-panel2 px-4 py-3 text-sm text-ink outline-none focus:border-cash"
            />
          </div>

          <button disabled={!clue || busy} onClick={() => analyze()} className="btn-cash w-full disabled:opacity-40">
            {busy ? "Hermes is analyzing…" : "Hand it to Hermes →"}
          </button>
        </div>
      )}

      {phase === "questions" && (
        <div className="panel space-y-5 p-6">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulseline rounded-full bg-cash" />
            <p className="text-sm text-muted">
              Hermes only needs <span className="text-ink">{questions.length}</span> critical
              detail{questions.length > 1 ? "s" : ""} before going live.
            </p>
          </div>
          {questions.map((q) => {
            const opts = q.options ?? ["Yes", "No"];
            const current = answers[q.id];
            const isCustom = current !== undefined && !opts.includes(current);
            return (
              <div key={q.id} className="panel-2 p-4">
                <p className="font-medium">{q.question}</p>
                <p className="mt-1 text-xs text-muted">Why it matters: {q.reason}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {opts.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                      className={`chip cursor-pointer ${
                        current === opt ? "border-cash text-cash" : ""
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {/* Free text — judges' items rarely fit the chips (e.g. "Vivoactive 3"). */}
                <input
                  value={isCustom ? current : ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setAnswers((a) => {
                      const next = { ...a };
                      if (v.trim()) next[q.id] = v;
                      else delete next[q.id];
                      return next;
                    });
                  }}
                  placeholder="…or type your own answer"
                  className={`mt-2 w-full rounded-sm border bg-panel px-3 py-2 text-sm text-ink outline-none focus:border-cash ${
                    isCustom ? "border-cash" : "border-edge"
                  }`}
                />
              </div>
            );
          })}
          <button
            disabled={busy || Object.keys(answers).length < questions.length}
            onClick={submitAnswers}
            className="btn-cash w-full disabled:opacity-40"
          >
            {busy ? "Updating plan…" : "Confirm — go live"}
          </button>
        </div>
      )}

      {phase === "done" && item && (
        <div className="panel space-y-4 p-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-cash/15 text-2xl">
            ✅
          </div>
          <h2 className="text-xl font-bold">Relax. I’ll handle it.</h2>
          <p className="text-sm text-muted">
            {item.analysis.title} is live on{" "}
            <span className="text-ink">{item.plan.primary.name}</span>. I’ll ping you when
            there’s a buyer.
          </p>
          <div className="flex justify-center gap-3">
            <button onClick={() => router.push(`/item/${item.id}`)} className="btn-cash">
              See the operation →
            </button>
            <button onClick={() => router.push(`/market/${item.id}`)} className="btn-ghost">
              View buyer listing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
