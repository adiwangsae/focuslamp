import test from 'node:test';
import assert from 'node:assert/strict';
import { Language } from '../types';
import {
  createLanguageTransitionController,
  LANG_TRANSITION_MS,
  LanguageTransitionPhase,
} from './languageTransition';

function createFakeScheduler(initialLang: Language = 'en') {
  let renderedLang: Language = initialLang;
  const phases: LanguageTransitionPhase[] = [];
  const commits: Language[] = [];
  let nextId = 1;
  const timeouts = new Map<number, { fn: () => void; at: number }>();
  const frames = new Map<number, () => void>();
  let now = 0;

  const controller = createLanguageTransitionController({
    getCurrentRenderedLanguage: () => renderedLang,
    setPhase: (p) => phases.push(p),
    commitRenderedLanguage: (lang) => {
      renderedLang = lang;
      commits.push(lang);
    },
    scheduleTimeout: (fn, ms) => {
      const id = nextId++;
      timeouts.set(id, { fn, at: now + ms });
      return id;
    },
    clearTimeoutHandle: (id) => {
      timeouts.delete(id);
    },
    scheduleFrame: (fn) => {
      const id = nextId++;
      frames.set(id, fn);
      return id;
    },
    cancelFrame: (id) => {
      frames.delete(id);
    },
  });

  const flushNextFrame = () => {
    const entries = Array.from(frames.entries());
    frames.clear();
    for (const [, fn] of entries) {
      fn();
    }
  };

  const advanceMs = (ms: number) => {
    const target = now + ms;
    while (true) {
      let earliest: { id: number; at: number; fn: () => void } | null = null;
      for (const [id, item] of timeouts.entries()) {
        if (item.at <= target && (!earliest || item.at < earliest.at)) {
          earliest = { id, at: item.at, fn: item.fn };
        }
      }
      if (!earliest) break;
      now = earliest.at;
      timeouts.delete(earliest.id);
      earliest.fn();
    }
    now = target;
  };

  return {
    controller,
    phases,
    commits,
    getRenderedLang: () => renderedLang,
    flushNextFrame,
    advanceMs,
    pendingCount: () => timeouts.size + frames.size,
  };
}

test('transitions cleanly from EN to ID across exit -> entering-prep -> entering -> idle', () => {
  const sim = createFakeScheduler('en');
  sim.controller.requestLanguageChange('id', false);

  assert.deepEqual(sim.phases, ['exiting']);
  assert.equal(sim.getRenderedLang(), 'en');

  sim.advanceMs(LANG_TRANSITION_MS.exit);
  assert.equal(sim.getRenderedLang(), 'id');
  assert.deepEqual(sim.phases, ['exiting', 'entering-prep']);

  sim.flushNextFrame();
  sim.flushNextFrame();
  assert.deepEqual(sim.phases, ['exiting', 'entering-prep', 'entering']);

  sim.advanceMs(LANG_TRANSITION_MS.enter);
  assert.deepEqual(sim.phases, ['exiting', 'entering-prep', 'entering', 'idle']);
  assert.equal(sim.pendingCount(), 0);
});

test('coalesces rapid language switches during exit without overlapping timers', () => {
  const sim = createFakeScheduler('en');
  sim.controller.requestLanguageChange('id', false);
  sim.advanceMs(40);
  sim.controller.requestLanguageChange('en', false);
  sim.advanceMs(20);
  sim.controller.requestLanguageChange('id', false);

  // Only the single original exit timer runs; commits happen once at exit completion
  assert.deepEqual(sim.commits, []);
  sim.advanceMs(LANG_TRANSITION_MS.exit);
  assert.deepEqual(sim.commits, ['id']);
  sim.flushNextFrame();
  sim.flushNextFrame();
  sim.advanceMs(LANG_TRANSITION_MS.enter);
  assert.equal(sim.getRenderedLang(), 'id');
  assert.equal(sim.phases[sim.phases.length - 1], 'idle');
  assert.equal(sim.pendingCount(), 0);
});

test('prefers-reduced-motion swaps immediately without phase delays', () => {
  const sim = createFakeScheduler('en');
  sim.controller.requestLanguageChange('id', true);

  assert.equal(sim.getRenderedLang(), 'id');
  assert.deepEqual(sim.phases, ['idle']);
  assert.equal(sim.pendingCount(), 0);
});

test('snapLanguage cancels in-flight transition cleanly on account change', () => {
  const sim = createFakeScheduler('en');
  sim.controller.requestLanguageChange('id', false);
  assert.deepEqual(sim.phases, ['exiting']);

  sim.controller.snapLanguage('en');
  assert.equal(sim.getRenderedLang(), 'en');
  assert.equal(sim.phases[sim.phases.length - 1], 'idle');
  assert.equal(sim.pendingCount(), 0);
});
