import Papa from "papaparse";
import { CandlestickData, Time } from "lightweight-charts";

interface RawCandle {
  time: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume?: string;
}

export function parseCsvToCandles(csvContent: string): CandlestickData<Time>[] {
  const parsed = Papa.parse<RawCandle>(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    console.error("CSV Parse Errors:", parsed.errors);
    return [];
  }

  return parsed.data.map((row) => ({
    time: Math.floor(new Date(row.time).getTime() / 1000) as Time, // convertir a timestamp UNIX (segundos)
    open: parseFloat(row.open),
    high: parseFloat(row.high),
    low: parseFloat(row.low),
    close: parseFloat(row.close),
  }));
}
