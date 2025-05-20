/* eslint-disable react-hooks/exhaustive-deps */
import { ArrowDown, ArrowUp } from "lucide-react";
import { useActionTradeStore } from "../../../store/chart-indicator-store";
import {  useEffect, useState } from "react";
import { Directions, type Direction } from "../../../schemas/operation-schema";


const ActionsTrading = () => {
    const {setActionTrade} = useActionTradeStore()
    const [mount, setMount] = useState(10)
    const [duration, setDuration] = useState(1)

    const onTrade = (direction: Direction, mount: number, duration: number)=>{
        setActionTrade({
            direction: direction,
            mount: mount,
            duration: duration
        })
        //stepForward(dataLength)
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === "ArrowUp") {
            e.preventDefault()
            onTrade(Directions.Up, mount, duration)
          } else if (e.key === "ArrowDown") {
            e.preventDefault()
            onTrade(Directions.Down, mount, duration)
          } 
        };
    
        window.addEventListener("keydown", handleKeyDown);
        return () => {
          window.removeEventListener("keydown", handleKeyDown);
        };
      }, [onTrade]);

    return ( 
        <div className="flex items-center justify-center flex-wrap gap-4 space-x-4 mb-6 p-4 bg-gray-100 rounded-lg">
            <div className="flex items-center flex-wrap gap-2">
                <div className="flex items-center">
                <span className="mr-2 font-medium">Monto:</span>
                <input
                    type="number"
                    min="1"
                    value={mount}
                    onChange={(e)=>setMount(parseFloat(e.target.value))}
                    className="w-24 p-2 bg-white border border-gray-300 rounded-sm text-center"
                />
                </div>

                <div className="flex items-center">
                <span className="mr-2 font-medium">Duration:</span>
                <input
                    type="number"
                    min="1"
                    value={duration}
                    onChange={(e)=>setDuration(parseInt(e.target.value))}
                    className="w-24 p-2 bg-white border border-gray-300 rounded-sm text-center"
                />
                </div>
            </div>

            <div className="flex items-center flex-wrap gap-4">
                <button
                    onClick={()=>onTrade(Directions.Up, mount, duration)}
                    className="flex justify-between items-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 px-8 rounded-sm text-lg font-bold cursor-pointer whitespace-nowrap"
                >
                    <ArrowUp/>
                    COMPRAR
                </button>

                <button
                    onClick={()=>onTrade(Directions.Down, mount, duration)}
                    className="flex justify-between items-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 px-8 rounded-sm text-lg font-bold cursor-pointer whitespace-nowrap"
                >
                    <ArrowDown/>
                    VENDER
                </button>
            </div>

          </div>
     );
}
 
export default ActionsTrading;