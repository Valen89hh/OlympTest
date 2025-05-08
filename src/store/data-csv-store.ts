import { create } from 'zustand';

interface CsvData {
  name: string;
  content: string;
}

interface CsvStore {
  csv: CsvData | null;
  setCsv: (data: CsvData) => void;
  clearCsv: () => void;
}

export const useCsvStore = create<CsvStore>((set) => ({
  csv: null,
  setCsv: (data) => set({ csv: data }),
  clearCsv: () => set({ csv: null }),
}));
