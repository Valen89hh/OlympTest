import { create } from 'zustand';
import { Indicator } from '../schemas/indicator-schema';
import { type Direction, Operation } from '../schemas/operation-schema';


interface IndicatorsStore{
    chartIndicators: Indicator[]
    setChartIndicators: (indicators: Indicator[])=>void 
}

export const useChartIndicatorsStore = create<IndicatorsStore>((set) => ({
  chartIndicators: [],
  setChartIndicators: (indicators)=>set({chartIndicators: indicators})
}));

interface PorcentChartStore{
  porcentChart: number,
  setPorcentChart: (porcent: number)=>void
}
export const usePorcentChartStore = create<PorcentChartStore>((set) => ({
  porcentChart: 100,
  setPorcentChart: (porcent)=>set({porcentChart: porcent})
}));

interface NavigationChartStore {
  currentCount: number
  isPlaying: boolean
  intervalId?: number
  setCount: (n: number) => void
  stepForward: (maxCount: number) => void
  stepBackward: () => void
  toggleAuto: (maxCount: number) => void
  clearAuto: () => void
}

export const useNavigationChartStore = create<NavigationChartStore>((set, get) => ({
  currentCount: 20,
  isPlaying: false,
  intervalId: undefined,
  setCount: (n) => set({ currentCount: n }),
  stepForward: (maxCount) => {
    const { currentCount, setCount } = get()
    setCount(Math.min(maxCount, currentCount + 1))
  },
  stepBackward: () => {
    const { currentCount, setCount } = get()
    setCount(Math.max(1, currentCount - 1))
  },
  toggleAuto: (maxCount) => {
    const { isPlaying, stepForward, intervalId } = get()
    if (isPlaying) {
      if (intervalId) {
        clearInterval(intervalId)
      }
      set({ isPlaying: false, intervalId: undefined })
    } else {
      const id = window.setInterval(() => stepForward(maxCount), 500)
      set({ isPlaying: true, intervalId: id })
    }
  },
  clearAuto: () => {
    const { intervalId } = get()
    if (intervalId) clearInterval(intervalId)
    set({ isPlaying: false, intervalId: undefined })
  },
}))

interface OperationStore{
  operations: Operation[],
  setOperations: (ops: Operation[])=>void
}

export const useOperationStore = create<OperationStore>((set)=>({
  operations: [],
  setOperations: (ops)=>set({operations: ops})
}))


interface ActionTradeStore{
  actionTrade: {
    direction: Direction,
    mount: number,
    duration: number
  } | null,
  setActionTrade: (action: {
    direction: Direction,
    mount: number,
    duration: number
  } | null)=>void
}

export const useActionTradeStore = create<ActionTradeStore>((set)=>({
  actionTrade: null,
  setActionTrade: (action)=>set({actionTrade: action})
}))
