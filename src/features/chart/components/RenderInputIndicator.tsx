import { IndicatorParam } from "../../../schemas/indicator-schema";

export const renderInput = (
  key: string,
  param: IndicatorParam,
  onChange: (key: string, value: any) => void
) => {
  switch (param.type) {
    case "boolean":
      return (
        <input
          type="checkbox"
          required
          checked={Boolean(param.value)}
          onChange={(e) => onChange(key, e.target.checked)}
          className="h-4 w-4"
        />
      );
    case "int":
    case "float":
      return (
        <input
          type="number"
          step={param.type === "float" ? "any" : "1"}
          value={param.value as string | number | readonly string[] | undefined}
          onChange={(e) => onChange(key, e.target.value)}
          className="w-full px-3 py-2 border rounded-sm text-sm"
        />
      );
    case "string":
    default:
      return (
        <input
          type="text"
          required
          value={param.value as string | number | readonly string[] | undefined}
          onChange={(e) => onChange(key, e.target.value)}
          className="w-full px-3 py-2 border rounded-sm text-sm"
        />
      );
  }
};
