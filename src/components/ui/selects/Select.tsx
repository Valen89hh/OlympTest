import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react"; // o cualquier icono
import { twMerge } from "tailwind-merge";

interface Option {
  label: string;
  value: string;
};

interface SelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Selecciona...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  // cerrar menú si se da clic afuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!selectRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full max-w-xs" ref={selectRef}>
      <button
        className="w-full bg-white border border-gray-300 rounded-sm px-2 py-2 text-left flex gap-2 justify-between items-center text-gray-700 hover:border-gray-400 focus:outline-none"
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
      >
        <span>{selected?.label || placeholder}</span>
        <ChevronDown className="w-5 h-5 text-gray-500" />
      </button>

      {isOpen && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-sm shadow-md max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={twMerge(
                "cursor-pointer px-2 py-2 hover:bg-gray-100",
                value === opt.value && "bg-gray-100 font-medium"
              )}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
 
export default Select;