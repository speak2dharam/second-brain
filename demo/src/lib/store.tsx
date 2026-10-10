import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { initialState } from '../data/setup';
import { personById } from '../data/people';
import type { DemoState, Person } from '../data/types';

// Bump when the initial data changes shape (v2: UCLMS data source added), so old saved state is ignored.
const KEY = 'second-brain-demo-v2';

function load(): DemoState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...initialState(), ...JSON.parse(raw) };
  } catch {
    /* storage unavailable: start fresh */
  }
  return initialState();
}

interface Ctx {
  state: DemoState;
  update: (fn: (s: DemoState) => DemoState) => void;
  reset: () => void;
}

const DemoContext = createContext<Ctx | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const update = useCallback((fn: (s: DemoState) => DemoState) => setState((s) => fn(s)), []);
  const reset = useCallback(() => setState((s) => ({ ...initialState(), userId: s.userId })), []);

  return <DemoContext.Provider value={{ state, update, reset }}>{children}</DemoContext.Provider>;
}

export function useDemo(): Ctx {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo outside DemoProvider');
  return ctx;
}

export function useViewer(): Person {
  const { state } = useDemo();
  const p = state.userId ? personById(state.userId) : undefined;
  if (!p) throw new Error('No signed-in user');
  return p;
}
