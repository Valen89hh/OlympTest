import React, { useState, useRef, useEffect } from "react";
import { IndicatorColor } from "../../../schemas/indicator-schema";
import { INDICATOR_COLORS } from "../../../data/indicators_data";

interface ColorSelectorProps {
  value: IndicatorColor;
  onChange: (color: IndicatorColor) => void;
}

const ColorSelector: React.FC<ColorSelectorProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cerrar si se hace click afuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative ml-2" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-6 h-6 cursor-pointer rounded-full border-2 border-gray-400"
        style={{ backgroundColor: value }}
        aria-label="Abrir selector de color"
      />
      {open && (
        <div className="absolute top-8 left-0 bg-white p-2 border rounded shadow grid grid-cols-3 gap-2 z-[999] w-max">
          {INDICATOR_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => {
                onChange(color);
                setOpen(false);
              }}
              className="w-6 h-6 cursor-pointer rounded-full border border-gray-300"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorSelector;
