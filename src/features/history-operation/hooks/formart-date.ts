import { Time } from "lightweight-charts";

export function formatTimeToDate(time: Time): string {
    const date = new Date((time as number) * 1000); // `time` es tipo `Time`, usualmente un número
    return date.toLocaleString(); // Puedes usar .toLocaleDateString() si solo quieres la fecha
}
  