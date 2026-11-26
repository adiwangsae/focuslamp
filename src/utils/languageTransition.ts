import { Language } from '../types';

export type LanguageTransitionPhase = 'idle' | 'exiting' | 'entering-prep' | 'entering';

export const LANG_TRANSITION_MS = {
  exit: 115,
  enter: 185,
} as const;

export interface LanguageTransitionController {
  requestLanguageChange: (nextLanguage: Language, reducedMotion: boolean) => void;
  snapLanguage: (nextLanguage: Language) => void;
  dispose: () => void;
}

export interface LanguageTransitionCallbacks {
  getCurrentRenderedLanguage: () => Language;
  setPhase: (phase: LanguageTransitionPhase) => void;
  commitRenderedLanguage: (lang: Language) => void;
  scheduleTimeout: (fn: () => void, ms: number) => number;
  clearTimeoutHandle: (id: number) => void;
  scheduleFrame: (fn: () => void) => number;
  cancelFrame: (id: number) => void;
}

/**
 * Coordinates a two-phase crossfade + micro-slide without remounting the app tree:
 * 1. `exiting` (115ms) -> old text fades out smoothly
 * 2. `entering-prep` + commit new language -> double rAF so DOM paints new text at enter start offset
 * 3. `entering` (185ms) -> new text glides smoothly into place
 * 4. `idle` -> resting state
 *
 * Rapid language switches during `exiting` coalesce to the latest target without resetting timers;
 * switches during `entering` cleanly transition from the current state without overlapping timers.
 */
export function createLanguageTransitionController(
  callbacks: LanguageTransitionCallbacks
): LanguageTransitionController {
  let phase: LanguageTransitionPhase = 'idle';
  let pendingLanguage: Language | null = null;
  let exitTimerId: number | null = null;
  let enterTimerId: number | null = null;
  let raf1Id: number | null = null;
  let raf2Id: number | null = null;
  let disposed = false;

  const clearScheduled = () => {
    if (exitTimerId !== null) {
      callbacks.clearTimeoutHandle(exitTimerId);
      exitTimerId = null;
    }
    if (enterTimerId !== null) {
      callbacks.clearTimeoutHandle(enterTimerId);
      enterTimerId = null;
    }
    if (raf1Id !== null) {
      callbacks.cancelFrame(raf1Id);
      raf1Id = null;
    }
    if (raf2Id !== null) {
      callbacks.cancelFrame(raf2Id);
      raf2Id = null;
    }
  };

  const applyPhase = (nextPhase: LanguageTransitionPhase) => {
    phase = nextPhase;
    callbacks.setPhase(nextPhase);
  };

  const beginEnterPhase = (targetLang: Language) => {
    if (disposed) return;
    applyPhase('entering-prep');
    callbacks.commitRenderedLanguage(targetLang);
    pendingLanguage = null;

    raf1Id = callbacks.scheduleFrame(() => {
      raf1Id = null;
      if (disposed) return;
      raf2Id = callbacks.scheduleFrame(() => {
        raf2Id = null;
        if (disposed) return;
        applyPhase('entering');
        enterTimerId = callbacks.scheduleTimeout(() => {
          enterTimerId = null;
          if (disposed) return;
          applyPhase('idle');
        }, LANG_TRANSITION_MS.enter);
      });
    });
  };

  const snapLanguage = (nextLanguage: Language) => {
    clearScheduled();
    pendingLanguage = null;
    applyPhase('idle');
    if (callbacks.getCurrentRenderedLanguage() !== nextLanguage) {
      callbacks.commitRenderedLanguage(nextLanguage);
    }
  };

  const requestLanguageChange = (nextLanguage: Language, reducedMotion: boolean) => {
    if (disposed) return;

    if (reducedMotion) {
      snapLanguage(nextLanguage);
      return;
    }

    const rendered = callbacks.getCurrentRenderedLanguage();

    // If currently exiting, coalesce to the newest target without restarting exit timer
    if (phase === 'exiting') {
      pendingLanguage = nextLanguage;
      return;
    }

    // No-op when idle and already showing this language
    if (phase === 'idle' && rendered === nextLanguage) {
      return;
    }

    // Cancel any ongoing enter/prep timers before starting a clean exit
    clearScheduled();
    pendingLanguage = nextLanguage;
    applyPhase('exiting');

    exitTimerId = callbacks.scheduleTimeout(() => {
      exitTimerId = null;
      if (disposed) return;
      const target = pendingLanguage ?? nextLanguage;
      if (target === callbacks.getCurrentRenderedLanguage() && phase === 'exiting') {
        // User toggled back to the original already-rendered language mid-exit: fade it cleanly back in
        applyPhase('entering');
        pendingLanguage = null;
        enterTimerId = callbacks.scheduleTimeout(() => {
          enterTimerId = null;
          if (disposed) return;
          applyPhase('idle');
        }, LANG_TRANSITION_MS.enter);
        return;
      }
      beginEnterPhase(target);
    }, LANG_TRANSITION_MS.exit);
  };

  const dispose = () => {
    disposed = true;
    clearScheduled();
    pendingLanguage = null;
  };

  return {
    requestLanguageChange,
    snapLanguage,
    dispose,
  };
}
