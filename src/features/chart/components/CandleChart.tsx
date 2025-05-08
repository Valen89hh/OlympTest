import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  ColorType,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  CandlestickData,
  IChartApi,
  Time,
  LineStyle,
  ISeriesApi,
  createSeriesMarkers,
  SeriesMarker,
  ISeriesMarkersPluginApi,
} from 'lightweight-charts';
import { useActionTradeStore, useChartIndicatorsStore, useNavigationChartStore, useOperationStore } from '../../../store/chart-indicator-store';
import {
  calculateBollingerBands,
  calculateEMA,
  calculateParabolicSAR,
  calculateROC,
  calculateRSI,
  calculateStochastic,
} from '../utils/calculate-indicators';
import { ParabolicSAROptions, ParabolicSARSeries } from '../utils/parabolic-sar-panel-view';
import { Directions, Operation, TradeResult, type Result } from '../../../schemas/operation-schema';

interface CandleChartProps {
  data: CandlestickData<Time>[];
  initialWindow?: number; // número inicial de velas visibles
}

const NEED_PANE = new Set(['RSI', 'Stochastic', 'Rate of Change']);

const CandleChart: React.FC<CandleChartProps> = ({ data, initialWindow = 20 }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesMarkersRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const {currentCount} = useNavigationChartStore()
  //const [currentCount, setCurrentCount] = useState(() => Math.min(initialWindow, data.length));
  const { chartIndicators } = useChartIndicatorsStore();
  const [indicatorSeries, setIndicatorSeries] = useState<ISeriesApi<any, any>[]>([]);
  //const [isPlaying, setIsPlaying] = useState(false);
  const {actionTrade, setActionTrade} = useActionTradeStore()
  const {operations, setOperations} = useOperationStore()
    const handleAddSerieTrash = (serie: ISeriesApi<any, any>)=>{
        setIndicatorSeries(prev=>[...prev, serie])
    }

  // Inicializar el chart
  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#ffffff' },
        textColor: '#000',
        panes: { enableResize: false },
      },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    });
    chartRef.current = chart;
    // Serie de velas
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      priceLineVisible: false,
      lastValueVisible: false,
    });
    candleSeriesRef.current = candleSeries;

    // Resize
    const ro = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        chart.applyOptions({ width, height });
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      //if (playInterval.current) clearInterval(playInterval.current);
      chart.remove();
    };
  }, []);

  // Actualizar datos visibles y recalcular indicadores
  useEffect(() => {
    const chart = chartRef.current;
    const candleSeries = candleSeriesRef.current;
    const sereiesMarkers = seriesMarkersRef.current;
    if (!chart || !candleSeries) return;

    // slice de datos
    // 1) Capturamos zoom/pan actual
    const logicalRange = chart.timeScale().getVisibleLogicalRange();
    const visibleData = data.slice(0, currentCount);
    candleSeries.setData(visibleData);
    chart.timeScale().fitContent();

    // remover series anteriores de indicadores
    indicatorSeries.forEach(serie=>{
        chart.removeSeries(serie)
    })
    setIndicatorSeries([])

    if(sereiesMarkers) sereiesMarkers.setMarkers([])

    if(operations.length > 0){

      const markers: SeriesMarker<Time>[] = []
      operations.forEach((operation, i)=>{
        if(operation.indexCandle < visibleData.length){
          const candleOpen = visibleData[operation.indexCandle]
          const openMarker: SeriesMarker<Time> = {
            time: candleOpen.time,
            position: candleOpen.close < candleOpen.open ? "atPriceBottom" : "atPriceTop",
            color: operation.direction == Directions.Up ? "#2196F3" : "#e91e63",
            shape: operation.direction == Directions.Up ? "arrowUp" : "arrowDown",
            text: operation.direction,
            price: candleOpen.close
          }
          markers.push(openMarker)
          if(operation.indexCandle+operation.duration < visibleData.length){

            if(!operation.closeDate && !operation.closePrice){
              const dif = (visibleData.length-1)-operation.indexCandle
              if(dif == operation.duration){
                const candleClose = visibleData[visibleData.length-1]
                let result: Result | null = null
                if(operation.direction == Directions.Up){
                  if(candleClose.close > operation.openPrice) result = TradeResult.Won
                  else if(candleClose.close < operation.openPrice) result = TradeResult.Lost
                }else if(operation.direction == Directions.Down){
                  if(candleClose.close < operation.openPrice) result = TradeResult.Won
                  else if(candleClose.close > operation.openPrice) result = TradeResult.Lost
                }

                let profit = 0
                if(result == TradeResult.Won) profit = operation.amount*0.85
                else if(result == TradeResult.Lost) profit = -operation.amount

                
                setOperations(
                  operations.map((op, a)=>a!=i ? op : {
                    ...op,
                    closeDate: candleClose.time,
                    closePrice: candleClose.close,
                    result: result,
                    profit: profit
                  })
                )
              }
            }else{
              const closeMarker: SeriesMarker<Time> = {
                time: operation.closeDate!,
                position: operation.closePrice! < operation.openPrice ? "atPriceBottom" : "atPriceTop",
                color: operation.result == TradeResult.Won ? "#2196F3" : "#e91e63",
                shape: "circle",
                text: operation.result as string,
                price: operation.closePrice!
              }
              markers.push(closeMarker)
            }
          }
        }
      })
      /** @type {import('lightweight-charts').createSeriesMarkers} */
      seriesMarkersRef.current = createSeriesMarkers(candleSeries, markers);
    }

    // mapear panes para indicadores que requieren panel
    const paneMap: Record<string, number> = {};
    let nextPane = 1;
    chartIndicators.forEach(idc => {
      if (NEED_PANE.has(idc.name) && paneMap[idc.name] == null) {
        paneMap[idc.name] = nextPane++;
      }
    });

    // agregar indicadores basados en visibleData
    chartIndicators.forEach(idc => {
      switch (idc.name) {
        case "EMA":
            const periodEma = Object.values(idc.params)[0].value as number
            const colorEma = Object.values(idc.params)[0].color
            const dEma = calculateEMA(visibleData, periodEma)
            const seriesEma = chart.addSeries(LineSeries, {
                color: colorEma,
                lineWidth: 1,
                priceLineVisible: false,
                lastValueVisible: false
            })
            seriesEma.setData(dEma)
            handleAddSerieTrash(seriesEma)
            break;
        case "Bandas De Bolinguer":
            const periodB = Object.values(idc.params)[0].value as number
            const colorPediodB = Object.values(idc.params)[0].color
            const desviationB = Object.values(idc.params)[1].value as number
            const colorDesviationB = Object.values(idc.params)[1].color
            const dBolinguer = calculateBollingerBands(visibleData, periodB, desviationB)
            const upperB = chart.addSeries(LineSeries, {
                color: colorPediodB,
                lineWidth: 2,
                priceLineVisible: false,
                lastValueVisible: false
            })
            const middleB = chart.addSeries(LineSeries, {
                color: colorDesviationB,
                lineWidth: 1,
                priceLineVisible: false,
                lastValueVisible: false
            })
            const lowerB = chart.addSeries(LineSeries, {
                color: colorPediodB,
                lineWidth: 2,
                priceLineVisible: false,
                lastValueVisible: false
            })
            upperB.setData(dBolinguer.map(d=>({value: d.upper, time: d.time})))
            lowerB.setData(dBolinguer.map(d=>({value: d.lower, time: d.time})))
            middleB.setData(dBolinguer.map(d=>({value: d.middle, time: d.time})))
            handleAddSerieTrash(upperB)
            handleAddSerieTrash(lowerB)
            handleAddSerieTrash(middleB)
            break;
        case "RSI":
            const periodRsi = Object.values(idc.params)[0].value as number;
            const colorRsi = Object.values(idc.params)[0].color;
            const rsiData = calculateRSI(visibleData, periodRsi);
            const rsiSeries = chart.addSeries(LineSeries, {
                color: colorRsi,
                lineWidth: 1,
                priceLineVisible: false,
                lastValueVisible: false
            },paneMap['RSI']!);
            rsiSeries.setData(rsiData);
            handleAddSerieTrash(rsiSeries)
            break;
        
        case "Stochastic":
            const kPeriod = Object.values(idc.params)[0].value as number;
            const kColor = Object.values(idc.params)[0].color;
            const dPeriod = Object.values(idc.params)[1].value as number;
            const dColor = Object.values(idc.params)[1].color;
            const stochData = calculateStochastic(visibleData, kPeriod, dPeriod);
            const kSeries = chart.addSeries(LineSeries, 
                { 
                    color: kColor, 
                    lineWidth: 1,
                    priceLineVisible: false,
                    lastValueVisible: false
                }, paneMap['Stochastic']!)
            const dSeries = chart.addSeries(LineSeries, 
                { 
                    color: dColor, 
                    lineWidth: 1,
                    priceLineVisible: false,
                    lastValueVisible: false
                }, paneMap['Stochastic']!)
            kSeries.setData(stochData.map(d => ({ value: d.k, time: d.time })));
            dSeries.setData(stochData.map(d => ({ value: d.d, time: d.time })));
            handleAddSerieTrash(kSeries)
            handleAddSerieTrash(dSeries)
            kSeries.createPriceLine({
                price: 80,
                color: 'gray',
                lineStyle: LineStyle.Dashed,
                lineWidth: 1,
                axisLabelVisible: false,
                title: 'Overbought'
            });
            kSeries.createPriceLine({
                price: 20,
                color: 'gray',
                lineStyle: LineStyle.Dashed,
                lineWidth: 1,
                axisLabelVisible: false,
                title: 'Oversold'
            });
            break;
        
        case "Parabolic SAR":
            const step = Object.values(idc.params)[0].value as number;
            const sarColor = Object.values(idc.params)[0].color;
            const sarData = calculateParabolicSAR(visibleData, step);
            const seriesSar = chart.addCustomSeries(

                new ParabolicSARSeries(chart),
                {
                    color: sarColor,
                    size: 4
                } as ParabolicSAROptions,
            )
            seriesSar.setData(sarData)
            handleAddSerieTrash(seriesSar)
            break;
        
        case "Rate of Change":
            const periodRoc = Object.values(idc.params)[0].value as number;
            const colorRoc = Object.values(idc.params)[0].color;
            const rocData = calculateROC(visibleData, periodRoc);
            const rocSeries = chart.addSeries(HistogramSeries, {
                color: colorRoc,
                base: 0,
                priceLineVisible: false,
                lastValueVisible: false
            },paneMap['Rate of Change']!)
            rocSeries.setData(rocData);
            handleAddSerieTrash(rocSeries)
            break;
        
        default:
            break;
      }
    });
    // Restauramos el zoom/pan
    if (logicalRange) {
        chart.timeScale().setVisibleLogicalRange(logicalRange);
    }
  }, [currentCount, chartIndicators, operations, data]);

  useEffect(()=>{
    if(actionTrade){
      const visibleData = data.slice(0, currentCount-1);
      if(visibleData.length > 0){

        const candle = visibleData[visibleData.length - 1]
        const newOperation: Operation = {
          indexCandle: visibleData.length-1,
          openDate: candle.time,
          closeDate: null,
          openPrice: candle.close,
          closePrice: null,
          direction: actionTrade.direction,
          amount: actionTrade.mount,
          duration: actionTrade.duration,
          result: null,
          profit: 0

        }
        setOperations([...operations, newOperation])
      }
      setActionTrade(null)
    }
  }, [actionTrade])

  

  return (
      <div ref={containerRef} className="w-full h-[600px]" />

  );
};

export default CandleChart;
