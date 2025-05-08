import React, { useState } from "react";
import { Indicator, IndicatorColor } from "../../../schemas/indicator-schema";
import { renderInput } from "./RenderInputIndicator";
import { parseValueByType } from "../utils/validate-indicator";
import ColorSelector from "./ColorSelector";

interface ModalIndicatorConfigProps {
  onClose: () => void;
  indicator: Indicator;
  onConfirm: (config: Indicator) => void;
}


const ModalIndicatorConfig: React.FC<ModalIndicatorConfigProps> = ({
  onClose,
  indicator,
  onConfirm,
}) => {
  const [params, setParams] = useState(indicator.params);

  const handleChangeParam = (key: string, value: any) => {
    const p = params[key]
    const parsedValue = parseValueByType(value, p.type);
    setParams((prev) => ({
      ...prev,
      [key]: {
        ...p,
        value: parsedValue,
      },
    }));
  };

  const handleColorParam = (key: string, color: IndicatorColor) => {
    const p = params[key]
    setParams((prev) => ({
      ...prev,
      [key]: {
        ...p,
        color: color,
      },
    }));
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const hasEmptyFields = Object.entries(params).some(([_, param]) => {
        const { value, type } = param;
    
        // Validar según tipo
        switch (type) {
          case "boolean":
            return false; // siempre es true o false
          case "int":
          case "float":
            return value === null || value === undefined || isNaN(value as number);
          case "string":
          default:
            return value === "" || value === null || value === undefined;
        }
    });
    
    if (hasEmptyFields) {
        alert("Por favor completa todos los campos antes de confirmar.");
        return;
    }

    onConfirm({
      ...indicator,
      params,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white p-6 rounded-md shadow-md w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Configurar {indicator.name}</h2>
        <form onSubmit={handleConfirm}>
          {Object.entries(params).map(([key, val]) => (
            <div key={key} className="mb-4">
              <label className="block text-sm text-gray-700 mb-1 capitalize">
                {key}
              </label>
              <div className="flex items-center">
                {renderInput(key, val, handleChangeParam)}
                <ColorSelector
                    value={val.color}
                    onChange={(color)=>handleColorParam(key, color)}
                />
              </div>
            </div>
          ))}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-200 rounded-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-sm"
            >
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalIndicatorConfig;
