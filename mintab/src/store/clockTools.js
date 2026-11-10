import { create } from "zustand";
import { persist } from "zustand/middleware";

// Current value in ms (remaining for a timer, elapsed for a stopwatch)
export function readValue(s, now = Date.now()) {
  if (!s.mode) return 0;
  const delta = s.running ? Math.max(0, now - s.anchor) : 0;
  return s.mode === "timer" ? Math.max(0, s.base - delta) : s.base + delta;
}

const IDLE = {
  mode: null,
  running: false,
  base: 0,
  anchor: 0,
  duration: 0,
  finished: false,
};

export const useClockTools = create(
  persist(
    (set, get) => ({
      ...IDLE,

      startStopwatch: () =>
        set({
          mode: "stopwatch",
          running: true,
          base: 0,
          anchor: Date.now(),
          duration: 0,
          finished: false,
        }),

      startTimer: (ms) => {
        if (!(ms > 0)) return;
        set({
          mode: "timer",
          running: true,
          base: ms,
          anchor: Date.now(),
          duration: ms,
          finished: false,
        });
      },

      pause: () => {
        const s = get();
        if (!s.running) return;
        set({ base: readValue(s), running: false, anchor: 0 });
      },

      resume: () => {
        const s = get();
        if (!s.mode || s.running || s.finished) return;
        set({ running: true, anchor: Date.now() });
      },

      // Back to the start, paused
      reset: () => {
        const s = get();
        if (!s.mode) return;
        set({
          running: false,
          anchor: 0,
          finished: false,
          base: s.mode === "timer" ? s.duration : 0,
        });
      },

      // Timer hit zero
      finish: () => set({ running: false, anchor: 0, base: 0, finished: true }),

      // Leave timer/stopwatch and go back to the normal clock
      close: () => set(IDLE),
    }),
    { name: "mintab-clock-tools" },
  ),
);
