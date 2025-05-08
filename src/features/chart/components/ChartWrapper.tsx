import Card from "../../../components/ui/cards/Card";
import { useCsvStore } from "../../../store/data-csv-store";
import TableOperations from "../../history-operation/components/TableOperations";
import { parseCsvToCandles } from "../utils/parse-csv-to-candles";
import ActionsMoveChart from "./ActionsMoveChart";
import ActionsTrading from "./ActionsTrading";
import CandleChart from "./CandleChart";
import GroupTagIndicator from "./GroupTagIndicator";

const ChartWrapper = () => {
  const csv = useCsvStore((state) => state.csv);

  if (!csv) return <Card className='w-full'>
        <p className="text-center py-6">Cargue un archivo CSV para mostrar el gráfico</p>
    </Card>

  const candles = parseCsvToCandles(csv.content);

  return (
    <Card className='lg:w-3/4 bg-white p-4 rounded-lg shadow-md mb-4 lg:mb-0 lg:mr-4'>
        {candles ? (
            <>
                <GroupTagIndicator/>
                <CandleChart data={candles}/>
                <ActionsMoveChart dataLength={candles.length}/>
                <ActionsTrading dataLength={candles.length}/>
                <TableOperations/>
            </>
        ): (
            <p className="text-center py-6">Los datos del archivo no son validos</p>
        )}
    </Card>
  );
};

export default ChartWrapper;
