export type IndicatorColor =
  | "#1f77b4" // Azul
  | "#ff7f0e" // Naranja
  | "#2ca02c" // Verde
  | "#d62728" // Rojo
  | "#9467bd" // Púrpura
  | "#17becf"; // Cian


export interface IndicatorParam {
    type: "int" | "float" | "string" | "boolean";
    color: IndicatorColor
    value: number | string | boolean;
}
  
export interface Indicator {
    id: number
    name: string;
    params: Record<string, IndicatorParam>;
}

  
