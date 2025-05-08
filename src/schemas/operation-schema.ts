import { Time } from "lightweight-charts";

export const Directions = {
    Down: "DOWN",
    Up: "UP"
} as const;

export type Direction = (typeof Directions)[keyof typeof Directions];

export const TradeResult = {
    Won: "WON",
    Lost: "LOST"
} as const;

export type Result = (typeof TradeResult)[keyof typeof TradeResult];

export interface Operation {
    indexCandle: number;
    openDate: Time;
    closeDate: Time | null;
    direction: Direction;
    openPrice: number;
    closePrice: number | null;
    amount: number;
    duration: number; 
    result: Result | null;
    profit: number;
}
  