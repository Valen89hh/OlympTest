import { Plus } from "lucide-react";
import TagIndicator from "./TagIndicator";
import { useState } from "react";
import ModalIndicatorConfig from "./ModalIndicatorConfig";
import { Indicator } from "../../../schemas/indicator-schema";
import { indicators } from "../../../data/indicators_data";
import { generateIdNumber } from "../utils/validate-indicator";
import { useChartIndicatorsStore } from "../../../store/chart-indicator-store";



const GroupTagIndicator = () => {
    const {chartIndicators, setChartIndicators} = useChartIndicatorsStore()
  const [openIndicators, setOpenIndicators] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<null | Indicator>(null);

  const handleSelectIndicator = (indicator: Indicator) => {
    setSelectedIndicator(indicator);
    setModalOpen(true);
    setOpenIndicators(false);
  };


  const handleConfirmConfig = (indicator: Indicator) => {
      const exists = chartIndicators.some((idc) => idc.id === indicator.id);
  
      if (exists) {
        // Si existe, lo actualizamos
        const idcUpdate = chartIndicators.map((idc) =>
          idc.id === indicator.id ? indicator : idc
        );
        setChartIndicators(idcUpdate)
      } else {
        // Si no existe, lo añadimos
        setChartIndicators([...chartIndicators, indicator])
      }
  };

  return (
    <div className="relative">
      <ul className="flex flex-wrap items-center justify-start gap-2">
        <li className="rounded-sm text-sm whitespace-nowrap bg-gray-200 text-gray-700">
          <button
            onClick={() => setOpenIndicators(!openIndicators)}
            className="flex cursor-pointer px-2 py-1 items-center justify-center"
          >
            <Plus size={20} />
          </button>
        </li>
        {chartIndicators.map((idc) => (
          <li key={"indicator-" + idc.id}>
            <TagIndicator
              indicator={idc}
              onSelect={()=>handleSelectIndicator(idc)}
              onDelete={() =>
                setChartIndicators(chartIndicators.filter((a) => a.id !== idc.id))
              }
            />
          </li>
        ))}
      </ul>

      {openIndicators && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-sm shadow-md max-h-60 overflow-y-auto">
          {indicators.map((idc) => (
            <li
              key={"list-indicator-"+idc.id}
              onClick={() => handleSelectIndicator({...idc, id: generateIdNumber(chartIndicators)})}
              className="cursor-pointer px-2 py-2 hover:bg-gray-100"
            >
              {idc.name}
            </li>
          ))}
        </ul>
      )}

      {(modalOpen && selectedIndicator) && (
        <ModalIndicatorConfig
            onClose={() => setModalOpen(false)}
            indicator={selectedIndicator}
            onConfirm={handleConfirmConfig}
        />
      )}
    </div>
  );
};

export default GroupTagIndicator;
