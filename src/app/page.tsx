"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { Wand2, Coffee, Leaf, Sparkles, TimerReset, Save, Book, Feather, Droplets } from "lucide-react";

// Next.js App Router compatible, framework-light version.
// No shadcn/ui imports; just Tailwind + lucide-react + framer-motion.
// Drop this file into: src/app/page.tsx (or app/page.tsx if you didn't choose src/)
// Make sure Tailwind is enabled (create-next-app prompt) and install deps:
//   npm i framer-motion lucide-react

export default function Page() {
  const [candleOn, setCandleOn] = useLocalStorage<boolean>("cottage.candle", true);

  const backdrop = candleOn
    ? "bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] selection:bg-rose-200 selection:text-stone-900"
    : "bg-amber-50 text-stone-800 selection:bg-rose-200 selection:text-stone-800";

  const transitionText = candleOn ? "text-amber-100" : "text-stone-600";

  return (
    <main className={`min-h-screen w-full transition-colors duration-700 ${backdrop}`}>
      <div className="mx-auto max-w-5xl p-6 md:p-10">
        <Header candleOn={candleOn} setCandleOn={setCandleOn} transitionText={transitionText}/>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <BreathCard />
          <TeaTimerCard />
          <MoodNoteCard />
          <MysticDrawCard />
          <MiniIntentionSigilCard />
          <HydrationNudgeCard />
        </div>
        <footer className={`mt-10 text-center text-xs ${transitionText}`}>
          made with ❤ — weave your rituals gently
        </footer>
      </div>
    </main>
  );
}

function Header({
  transitionText,
  candleOn,
  setCandleOn,
}: {
  transitionText: string;
  candleOn: boolean;
  setCandleOn: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <header className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-rose-100 p-2 shadow-sm ring-1 ring-rose-200">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className={`text-2xl font-semibold tracking-tight ${candleOn ? "text-rose-50" : "text-stone-700"}`}>Cottage Warmth + Mystic</h1>
          <p className={`text-sm ${transitionText}`}>A cozy wellness nook for breath, tea, notes & tiny spells.</p>
        </div>
      </div>
      <AmbientCandleToggle on={candleOn} setOn={setCandleOn} transitionText={transitionText} />
    </header>
  );
}

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const isFirstRender = useRef(true);

  const readStoredValue = useCallback(() => {
    if (typeof window === "undefined") return initial;
    try {
      const v = window.localStorage.getItem(key);
      return v ? (JSON.parse(v) as T) : initial;
    } catch {
      return initial;
    }
  }, [initial, key]);

  const setStoredValue = useCallback((updater: React.SetStateAction<T>) => {
    setValue((prev) => {
      const next = typeof updater === "function" ? (updater as (val: T) => T)(prev) : updater;
      return next;
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      const schedule = window.requestAnimationFrame ?? ((cb: FrameRequestCallback) => window.setTimeout(() => cb(performance.now()), 0));
      schedule(() => setValue(readStoredValue()));
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, readStoredValue, value]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleStorage = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        try {
          setValue(JSON.parse(event.newValue));
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [key]);

  return [value, setStoredValue] as const;
}

/************************
 * Ambient Candle Toggle *
 ************************/ 
function AmbientCandleToggle({ on, setOn, transitionText }: { on: boolean; setOn: React.Dispatch<React.SetStateAction<boolean>>; transitionText: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`text-xs ${transitionText}`}>Candel Mode</div>
      <button
        onClick={() => setOn(!on)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full border border-amber-300 transition ${
          on ? "bg-amber-200" : "bg-stone-200"
        }`}
        aria-pressed={on}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
            on ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
      <div className="relative h-8 w-8">{on && <CandleFlame />}</div>
    </div>
  );
}

function CandleFlame() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <motion.div
        className="h-5 w-5 rounded-full bg-amber-300/70 blur-[2px]"
        animate={{ scale: [1, 1.15, 0.95, 1.1, 1], opacity: [0.7, 1, 0.75, 0.95, 0.7] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute h-10 w-10 rounded-full bg-amber-200/40 blur-md"
        animate={{ scale: [1, 1.2, 0.9, 1.1, 1], opacity: [0.35, 0.5, 0.3, 0.45, 0.35] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/****************
 * Breath Coach *
 ****************/
function BreathCard() {
  const [phase, setPhase] = useLocalStorage<"idle" | "inhale" | "hold" | "exhale">("cottage.breath.phase", "idle");
  const [running, setRunning] = useLocalStorage<boolean>("cottage.breath.running", false);
  const [cycle, setCycle] = useLocalStorage<{ in: number; hold: number; out: number }>("cottage.breath.cycle", { in: 4, hold: 7, out: 8 });
  const controls = useAnimationControls();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [countdown, setCountdown] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    controls.start({
      scale: prefersReducedMotion ? 1 : phase === "inhale" ? 1.25 : phase === "exhale" ? 0.8 : 1,
      transition: { duration: prefersReducedMotion ? 0 : 0.6, ease: "easeInOut" },
    });
  }, [phase, controls, prefersReducedMotion]);

  const resetInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!running) {
      setPhase("idle");
      resetInterval();
      return;
    }
    const queue: Array<{ p: typeof phase; t: number }> = [
      { p: "inhale", t: cycle.in },
      { p: "hold", t: cycle.hold },
      { p: "exhale", t: cycle.out },
    ];
    let i = 0;
    let t = queue[i];
    setPhase(t.p);
    if (typeof window !== "undefined") {
      const raf = window.requestAnimationFrame ?? ((cb: FrameRequestCallback) => window.setTimeout(() => cb(performance.now()), 0));
      raf(() => setCountdown(t.t));
    }
    resetInterval();
    intervalRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c > 1) return c - 1;
        i = (i + 1) % queue.length;
        t = queue[i];
        setPhase(t.p);
        return t.t;
      });
    }, 1000);
    return () => {
      resetInterval();
    };
  }, [running, cycle, setPhase, resetInterval]);

  const handleStart = () => {
    setRunning(true);
  };

  const handlePause = () => {
    setRunning(false);
    resetInterval();
  };

  const handleReset = () => {
    setRunning(false);
    resetInterval();
    setPhase("idle");
    setCountdown(0);
  };

  return (
    <section className="rounded-2xl border border-amber-200/60 bg-white/70 p-4 shadow-sm backdrop-blur-sm">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold"><Leaf className="h-5 w-5" /> 4–7–8 Breath</h2>
        <div className="text-xs text-stone-500" aria-live="polite" aria-atomic="true">
          {running ? `${phase} · ${countdown}s` : "idle"}
        </div>
      </header>
      <div className="space-y-4">
        <div className="relative grid place-items-center">
          <motion.div
            animate={controls}
            className="grid h-40 w-40 place-items-center rounded-full bg-gradient-to-b from-amber-100 to-rose-100 shadow-inner ring-1 ring-amber-200"
          >
            <div className="text-sm font-medium capitalize text-stone-700">{phase}</div>
          </motion.div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="rounded-xl bg-stone-900 px-3 py-1.5 text-sm text-white disabled:opacity-50" onClick={handleStart} disabled={running}>
            Start
          </button>
          <button className="rounded-xl bg-stone-200 px-3 py-1.5 text-sm" onClick={handlePause}>
            Pause
          </button>
          <button className="rounded-xl px-3 py-1.5 text-sm underline-offset-2 hover:underline" onClick={handleReset}>
            Reset
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <NumberField label="Inhale" value={cycle.in} onChange={(n) => setCycle({ ...cycle, in: n })} min={1} />
          <NumberField label="Hold" value={cycle.hold} onChange={(n) => setCycle({ ...cycle, hold: n })} min={0} />
          <NumberField label="Exhale" value={cycle.out} onChange={(n) => setCycle({ ...cycle, out: n })} min={1} />
        </div>
      </div>
    </section>
  );
}

function NumberField({ label, value, onChange, min = 0 }: { label: string; value: number; onChange: (n: number) => void; min?: number }) {
  return (
    <label className="space-y-1">
      <span className="block text-stone-600">{label}</span>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value || "0", 10))}
        className="w-full rounded-lg border border-amber-200 bg-white/80 p-2 text-stone-800 shadow-sm outline-none ring-amber-300 focus:ring"
      />
    </label>
  );
}

/************
 * Tea Time *
 ************/
function TeaTimerCard() {
  const presets = [
    { label: "Green", sec: 120 },
    { label: "Black", sec: 180 },
    { label: "Herbal", sec: 300 },
  ];
  const [remaining, setRemaining] = useLocalStorage<number>("cottage.tea.remaining", 180);
  const [running, setRunning] = useLocalStorage<boolean>("cottage.tea.running", false);
  const [baseline, setBaseline] = useLocalStorage<number>("cottage.tea.baseline", 180);
  const interval = useRef<NodeJS.Timeout | null>(null);
  const resetInterval = useCallback(() => {
    if (interval.current) {
      clearInterval(interval.current);
      interval.current = null;
    }
  }, []);

  const chime = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      type WithWebkit = typeof window & { webkitAudioContext?: typeof AudioContext };
      const audioWindow = window as WithWebkit;
      const AudioCtor = audioWindow.AudioContext || audioWindow.webkitAudioContext;
      if (!AudioCtor) return;
      const ctx = new AudioCtor();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 660;
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1);
      osc.start();
      osc.stop(ctx.currentTime + 1);
    } catch {}
  }, []);

  useEffect(() => {
    if (!running) {
      resetInterval();
      return;
    }
    interval.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          chime();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => resetInterval();
  }, [running, setRemaining, setRunning, chime, resetInterval]);

  const mmss = useMemo(() => {
    const m = Math.floor(remaining / 60).toString().padStart(2, "0");
    const s = Math.floor(remaining % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [remaining]);

  const handlePreset = (sec: number) => {
    setBaseline(sec);
    setRunning(false);
    setRemaining(sec);
  };

  const handleReset = () => {
    setRunning(false);
    setRemaining(baseline);
  };

  return (
    <section className="rounded-2xl border border-amber-200/60 bg-white/70 p-4 shadow-sm backdrop-blur-sm">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold"><Coffee className="h-5 w-5" /> Tea Timer</h2>
        <span className="rounded-full bg-rose-100 px-2 py-1 text-xs text-stone-700 ring-1 ring-rose-200">{mmss}</span>
      </header>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.label}
              className="rounded-xl bg-stone-200 px-3 py-1.5 text-sm"
              onClick={() => handlePreset(p.sec)}
            >
              {p.label} {formatSec(p.sec)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-xl bg-stone-900 px-3 py-1.5 text-sm text-white disabled:opacity-50" onClick={() => remaining > 0 && setRunning(true)} disabled={running || remaining <= 0}>
            Start
          </button>
          <button className="rounded-xl bg-stone-200 px-3 py-1.5 text-sm" onClick={() => setRunning(false)}>
            Pause
          </button>
          <button className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm underline-offset-2 hover:underline" onClick={handleReset}>
            <TimerReset className="h-4 w-4" /> Reset
          </button>
        </div>
      </div>
    </section>
  );
}

function formatSec(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/****************
 * Mood + Notes *
 ****************/
function MoodNoteCard() {
  const [note, setNote] = useLocalStorage<string>("cottage.mood.note", "");
  const [log, setLog] = useLocalStorage<Array<{ id: string; text: string; at: number }>>("cottage.mood.log", []);
  const save = () => {
    if (!note.trim()) return;
    const entry = { id: crypto.randomUUID(), text: note.trim(), at: Date.now() };
    setLog([entry, ...log].slice(0, 20));
    setNote("");
  };
  return (
    <section className="lg:col-span-2 rounded-2xl border border-amber-200/60 bg-white/70 p-4 shadow-sm backdrop-blur-sm">
      <header className="mb-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold"><Feather className="h-5 w-5" /> Mood & Micro‑Journal</h2>
      </header>
      <div className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="mood-note" className="text-sm font-medium text-stone-600">
            Capture your weather
          </label>
          <textarea
            id="mood-note"
            placeholder="a few honest words… (kept on this device)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[88px] w-full resize-y rounded-xl border border-amber-200 bg-white/80 p-3 shadow-sm outline-none ring-amber-300 focus:ring"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1 rounded-xl bg-stone-900 px-3 py-1.5 text-sm text-white disabled:opacity-50" onClick={save} disabled={!note.trim()}>
            <Save className="h-4 w-4" /> Save
          </button>
          <button className="rounded-xl bg-stone-200 px-3 py-1.5 text-sm" onClick={() => setLog([])} disabled={!log.length}>
            Clear log
          </button>
        </div>
        {log.length > 0 && (
          <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2" aria-live="polite">
            {log.map((e) => (
              <div key={e.id} className="rounded-xl border border-amber-200/70 bg-amber-50/60 p-3 text-sm shadow-sm">
                <div className="mb-1 text-[11px] uppercase tracking-wider text-stone-500">{new Date(e.at).toLocaleString()}</div>
                <p className="whitespace-pre-wrap leading-relaxed">{e.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/****************
 * Mystic Draw  *
 ****************/
const ORACLE: Array<{ title: string; hint: string; icon: React.ReactNode }> = [
  { title: "Warm Mug", hint: "brew something gentle; sip slowly for 5 breaths", icon: <Coffee className="h-4 w-4" /> },
  { title: "Open Window", hint: "fresh air + 1 minute of soft gazing", icon: <Leaf className="h-4 w-4" /> },
  { title: "Tiny Spell", hint: "touch heart, whisper: I am safe, I am here", icon: <Wand2 className="h-4 w-4" /> },
  { title: "Kind Posture", hint: "unclench jaw, drop shoulders, soften belly", icon: <Sparkles className="h-4 w-4" /> },
  { title: "Notebook", hint: "write 3 words that name your weather", icon: <Book className="h-4 w-4" /> },
];

function MysticDrawCard() {
  const [card, setCard] = useLocalStorage<number>("cottage.oracle.pick", 0);
  const draw = () => setCard(Math.floor(Math.random() * ORACLE.length));
  const c = ORACLE[card];
  return (
    <section className="rounded-2xl border border-amber-200/60 bg-white/70 p-4 shadow-sm backdrop-blur-sm">
      <header className="mb-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold"><Sparkles className="h-5 w-5" /> Mystic Draw</h2>
      </header>
      <div className="space-y-3">
        <motion.div
          key={c.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 text-sm font-medium">{c.icon} {c.title}</div>
          <p className="mt-1 text-stone-700">{c.hint}</p>
        </motion.div>
        <button className="rounded-xl bg-stone-900 px-3 py-1.5 text-sm text-white" onClick={draw}>Draw another</button>
      </div>
    </section>
  );
}

/************************
 * Intention → "Sigil" *
 ************************/
function MiniIntentionSigilCard() {
  const [phrase, setPhrase] = useLocalStorage<string>("cottage.sigil.phrase", "return to self");
  const glyphs = useMemo(() => makeSigil(phrase), [phrase]);
  return (
    <section className="rounded-2xl border border-amber-200/60 bg-white/70 p-4 shadow-sm backdrop-blur-sm">
      <header className="mb-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold"><Wand2 className="h-5 w-5" /> Intention Sigil</h2>
      </header>
      <div className="space-y-3">
        <label className="space-y-1">
          <span className="text-sm font-medium text-stone-600">Intention phrase</span>
          <input
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder="write an intention…"
            className="w-full rounded-xl border border-amber-200 bg-white/80 p-2 shadow-sm outline-none ring-amber-300 focus:ring"
          />
        </label>
        <div className="grid place-items-center mt-4">
          <SigilCanvas glyphs={glyphs} />
        </div>
        <p className="text-xs text-stone-600">Generated locally from your phrase (no network). Save a screenshot to collect your sigils.</p>
      </div>
    </section>
  );
}

function makeSigil(text: string) {
  const cleaned = (text || "").toLowerCase().replace(/[^a-z]/g, "");
  const letters = Array.from(new Set(cleaned.split("")));
  if (!letters.length) {
    return [
      { x: 0, y: -30 },
      { x: 26, y: 15 },
      { x: -26, y: 15 },
    ];
  }
  return letters.map((_, i) => {
    const t = (i + 1) / (letters.length + 1);
    const angle = t * Math.PI * 2 * 0.85 + Math.PI / 6;
    const r = 40 + (i % 3) * 6;
    return { x: Math.cos(angle) * r, y: Math.sin(angle) * r };
  });
}

function SigilCanvas({ glyphs }: { glyphs: { x: number; y: number }[] }) {
  const size = 140;
  const format = (value: number) => value.toFixed(2);
  return (
    <svg viewBox="-80 -80 160 160" width={size} height={size} className="rounded-2xl bg-amber-50/70 p-2 ring-1 ring-amber-200">
      <circle cx="0" cy="0" r="62" className="fill-none" stroke="#f4d7b2" strokeWidth="1.5" />
      {glyphs.length > 1 && (
        <path
          d={`M ${glyphs.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L ")}`}
          fill="none"
          stroke="#3f3a34"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {glyphs.map((p, i) => (
        <circle key={i} cx={format(p.x)} cy={format(p.y)} r="2.2" fill="#3f3a34" />
      ))}
    </svg>
  );
}

/*********************
 * Hydration Nudge   *
 *********************/
function HydrationNudgeCard() {
  const today = new Date().toISOString().slice(0, 10);
  const [hydration, setHydration] = useLocalStorage<{ date: string; count: number }>("cottage.h2o.log", {
    date: today,
    count: 0,
  });
  useEffect(() => {
    if (hydration.date !== today) {
      setHydration({ date: today, count: 0 });
    }
  }, [hydration.date, setHydration, today]);
  const glasses = hydration.date === today ? hydration.count : 0;
  const goal = 8;
  const add = () => setHydration({ date: today, count: Math.min(16, glasses + 1) });
  const reset = () => setHydration({ date: today, count: 0 });
  const filled = Math.min(glasses, goal);
  return (
    <section className="rounded-2xl border border-amber-200/60 bg-white/70 p-4 shadow-sm backdrop-blur-sm">
      <header className="mb-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold"><Droplets className="h-5 w-5" /> Hydration</h2>
      </header>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2" aria-live="polite">
          {Array.from({ length: goal }).map((_, i) => (
            <div
              key={i}
              className={`h-6 w-6 rounded-full ring-1 ring-amber-200 transition ${i < filled ? "bg-rose-200" : "bg-amber-100"}`}
              title={`glass ${i + 1}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-xl bg-stone-900 px-3 py-1.5 text-sm text-white disabled:opacity-50" onClick={add} disabled={glasses >= 16}>
            +1 glass
          </button>
          <button className="rounded-xl bg-stone-200 px-3 py-1.5 text-sm" onClick={reset} disabled={!glasses}>
            Reset
          </button>
        </div>
        <div className="text-xs text-stone-600">Today: {glasses} glasses · gentle goal {goal}+</div>
      </div>
    </section>
  );
}
