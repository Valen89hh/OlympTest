/* eslint-disable react-hooks/exhaustive-deps */
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useNavigationChartStore } from "../../../store/chart-indicator-store";
import { useEffect } from "react";

interface Props{
  dataLength: number
}

const ActionsMoveChart: React.FC<Props> = ({dataLength}) => {
  const {
    isPlaying,
    stepForward,
    stepBackward,
    toggleAuto
  } = useNavigationChartStore()

  const onStepBackward = () => stepBackward();
  const onStepForward = () => stepForward(dataLength);
  const onToggleAuto = () => toggleAuto(dataLength);

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        onStepBackward();
      } else if (e.key === "ArrowRight") {
        onStepForward();
      } else if (e.code === "Space") {
        e.preventDefault(); // evita scroll cuando se presiona espacio
        onToggleAuto();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onStepForward, onStepBackward, onToggleAuto]);

  return ( 
      <div className="flex justify-between items-center mb-6">
          <button
            onClick={onStepBackward}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-sm flex justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <SkipBack/>
            Anterior
          </button>

          <button
            onClick={onToggleAuto}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-sm flex justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            {isPlaying ? <Pause/> : <Play/>}
            
          </button>

          <button
            onClick={onStepForward}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-sm flex justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            Siguiente
            <SkipForward/>
          </button>
        </div>
    );
}
 
export default ActionsMoveChart;