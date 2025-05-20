import { useEffect, useState } from "react";
import Card from "../../../components/ui/cards/Card";
import { usePorcentChartStore } from "../../../store/chart-indicator-store";
import { useCsvStore } from "../../../store/data-csv-store";
import TableOperations from "../../history-operation/components/TableOperations";
import { parseCsvToCandles } from "../utils/parse-csv-to-candles";
import ActionsMoveChart from "./ActionsMoveChart";
import ActionsTrading from "./ActionsTrading";
import CandleChart from "./CandleChart";
import GroupTagIndicator from "./GroupTagIndicator";
import { CandlestickData, Time } from "lightweight-charts";
import ProgressBar from "./ProgressBar";

const ChartWrapper = () => {
  const csv = useCsvStore((state) => state.csv);
  const [candles, setCandles] = useState<CandlestickData<Time>[]>([])
  const {porcentChart} = usePorcentChartStore()

  useEffect(()=>{
    if(csv){
      setCandles(parseCsvToCandles(csv.content))
    }
  }, [csv])

  useEffect(()=>{
    console.log((porcentChart*candles.length)/100)
  }, [porcentChart, candles])

  return (
    <Card className='lg:w-3/4 bg-white p-4 rounded-lg shadow-md mb-4 lg:mb-0 lg:mr-4'>
        {candles.length > 0 ? (
            <>
                <GroupTagIndicator/>
                <CandleChart data={candles}/>
                <ProgressBar max={candles.length}/>
                <ActionsMoveChart dataLength={candles.length}/>
                <ActionsTrading/>
                <TableOperations/>
            </>
        ): (
          <p className="text-center py-6">Cargue un archivo CSV para mostrar el gráfico</p>
        )}
    </Card>
  );
};

export default ChartWrapper;
