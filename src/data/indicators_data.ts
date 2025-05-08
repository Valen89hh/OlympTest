import { Indicator, IndicatorColor } from "../schemas/indicator-schema";

export const indicators: Indicator[] = [
    { 
        id: 1,
        name: "EMA", 
        params: { 
            period: {
                type: "int",
                color: "#17becf",
                value: 14
            }
        } 
    },
    { 
        id: 2,
        name: "Bandas De Bolinguer", 
        params: { 
            period: {
                type: "int",
                color: "#ff7f0e",
                value: 20
            },
            deviation: {
                type: "int",
                color: "#d62728",
                value: 2
            }
        } 
    },
    { 
        id: 3,
        name: "Stochastic", 
        params: { 
            k: {
                type: "int",
                color: "#ff7f0e",
                value: 14
            },
            d: {
                type: "int",
                color: "#17becf",
                value: 3
            }
        } 
    },
    { 
        id: 4,
        name: "RSI", 
        params: { 
            period: {
                type: "int",
                color: "#ff7f0e",
                value: 14
            }
        } 
    },
    {
        id: 5,
        name: "Rate of Change", 
        params: { 
            period: {
                type: "int",
                color: "#ff7f0e",
                value: 14
            },
        } 
    },
    {
        id: 6,
        name: "Parabolic SAR", 
        params: { 
            step: {
                type: "float",
                color: "#ff7f0e",
                value: 0.02
            },
        } 
    }
];

export const INDICATOR_COLORS: IndicatorColor[] = [
    "#1f77b4",
    "#ff7f0e",
    "#2ca02c",
    "#d62728",
    "#9467bd",
    "#17becf",
  ];
  
  