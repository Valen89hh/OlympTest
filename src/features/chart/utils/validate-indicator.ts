import { Indicator } from "../../../schemas/indicator-schema";

export const parseValueByType = (value: any, type: string): string | number | boolean => {
  switch (type) {
    case "int":
      return parseInt(value, 10);
    case "float":
      return parseFloat(value);
    case "boolean":
      return Boolean(value);
    case "string":
    default:
      return value;
  }
};

export function generateIdNumber(indicators: Indicator[]){
    const ids = indicators.map(idc=>idc.id)
    if(ids.length > 0){
        return Math.max(...ids)+1
    }
    return 1
    
}