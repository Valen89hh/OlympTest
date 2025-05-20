/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useOperationStore } from "../../../store/chart-indicator-store";
import { TradeResult } from "../../../schemas/operation-schema";
import Card from "../../../components/ui/cards/Card";
import { Download } from "lucide-react";

const Estadisticas = () => {
    const [totalProfit, setTotalProfit] = useState(0)
    const [winCount, setWinCount] = useState(0)
    const [winRate, setWinRate] = useState("0")
    const {operations} = useOperationStore()

    useEffect(()=>{
        const pr = operations.reduce((sum, curr)=>sum+curr.profit, 0)
        setTotalProfit(pr)
        setWinCount(operations.filter((op) => op.result == TradeResult.Won).length)
        const wr =
            operations.length > 0
            ? ((winCount / operations.length) * 100).toFixed(2)
            : "0";
        setWinRate(wr)
    }, [operations])

    const exportToJson = () => {
        const statsData = {
          totalOperations: operations.length,
          totalProfit,
          winRate:
            operations.length > 0
              ? (
                  (operations.filter((op) => op.result == TradeResult.Won).length / operations.length) *
                  100
                ).toFixed(2) + "%"
              : "0%",
          operations,
        };
    
        const dataStr = JSON.stringify(statsData, null, 2);
        const dataUri =
          "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    
        const exportFileDefaultName = "backtesting-stats.json";
    
        const linkElement = document.createElement("a");
        linkElement.setAttribute("href", dataUri);
        linkElement.setAttribute("download", exportFileDefaultName);
        linkElement.click();
      };

    return ( 
        <Card className="lg:w-1/4 bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200">
            Estadísticas
          </h2>

          <div className="mb-6">
            <div className="text-center">
              <h3 className="text-sm text-gray-500 uppercase">Profit Total</h3>
              <p
                className={`text-3xl font-bold ${totalProfit >= 0 ? "text-green-500" : "text-red-500"}`}
              >
                {totalProfit >= 0 ? "+" : ""}
                {totalProfit}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-100 p-3 rounded-lg text-center">
              <h3 className="text-sm text-gray-500">Operaciones</h3>
              <p className="text-xl font-semibold">{operations.length}</p>
            </div>

            <div className="bg-gray-100 p-3 rounded-lg text-center">
              <h3 className="text-sm text-gray-500">Aciertos</h3>
              <p className="text-xl font-semibold">{winRate}%</p>
            </div>

            <div className="bg-gray-100 p-3 rounded-lg text-center">
              <h3 className="text-sm text-gray-500">Ganadas</h3>
              <p className="text-xl font-semibold text-green-500">{winCount}</p>
            </div>

            <div className="bg-gray-100 p-3 rounded-lg text-center">
              <h3 className="text-sm text-gray-500">Perdidas</h3>
              <p className="text-xl font-semibold text-red-500">
                {operations.length - winCount}
              </p>
            </div>
          </div>

          {/* Gráfico de distribución */}
          {operations.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm text-gray-500 uppercase mb-2">
                Distribución
              </h3>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-4 bg-green-500"
                  style={{ width: `${winRate}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-green-500">{winRate}% Ganadas</span>
                <span className="text-red-500">
                  {(100 - Number(winRate)).toFixed(2)}% Perdidas
                </span>
              </div>
            </div>
          )}

          {/* Botón exportar */}
          <button
            onClick={exportToJson}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-sm cursor-pointer flex gap-2 items-center justify-center whitespace-nowrap"
          >
            <Download/>
            Exportar Estadísticas (JSON)
          </button>
        </Card>
     );
}
 
export default Estadisticas;