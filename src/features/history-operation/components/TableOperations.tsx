import { Directions, TradeResult } from "../../../schemas/operation-schema";
import { useOperationStore } from "../../../store/chart-indicator-store";
import { formatTimeToDate } from "../hooks/formart-date";

const TableOperations = () => {
    const {operations} = useOperationStore()
    return ( 
        <div>
            <h3 className="text-lg font-semibold mb-2">
              Historial de Operaciones
            </h3>
            <div className="overflow-x-auto overflow-y-auto  max-h-[600px]">
              <table className="min-w-full  bg-white">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 uppercase text-sm">
                    <th className="py-3 px-4 text-left">Fecha</th>
                    <th className="py-3 px-4 text-left">Dirección</th>
                    <th className="py-3 px-4 text-left">Monto</th>
                    <th className="py-3 px-4 text-left">Resultado</th>
                    <th className="py-3 px-4 text-right">Ganancia/Pérdida</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  {operations.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-4 text-center text-gray-500"
                      >
                        No hay operaciones registradas
                      </td>
                    </tr>
                  ) : (
                    operations.map((op) => (
                      <tr
                        key={op.openDate.toString()}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">{formatTimeToDate(op.openDate)}</td>
                        <td className="py-3 px-4">
                          <span
                            className={
                              op.direction === Directions.Up
                                ? "text-green-500"
                                : "text-red-500"
                            }
                          >
                            {op.direction === Directions.Up ? "Up ▲" : "Down ▼"}
                          </span>
                        </td>
                        <td className="py-3 px-4">{op.amount}</td>
                        <td className="py-3 px-4">
                          <span
                            className={
                              op.result == TradeResult.Won ? "text-green-500" : "text-red-500"
                            }
                          >
                            {op.result}
                          </span>
                        </td>
                        <td
                          className={`py-3 px-4 text-right ${op.result == TradeResult.Won ? "text-green-500" : "text-red-500"} font-medium`}
                        >
                          {op.profit > 0 ? "+"+op.profit : op.profit}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
        </div>
    );
}
 
export default TableOperations;