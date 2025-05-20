/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { IndicatorSeries } from '../../../schemas/indicator-schema';

interface CandleChartProps {
  data: CandlestickData<Time>[];
}

const NEED_PANE = new Set(['RSI', 'Stochastic', 'Rate of Change']);

const CandleChart: React.FC<CandleChartProps> = ({ data}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const seriesMarkersRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null);
  const indicatorSeriesRef = useRef<Record<string, IndicatorSeries>>({});
  const { currentCount, setCount } = useNavigationChartStore();
  const { chartIndicators } = useChartIndicatorsStore();
  const { actionTrade, setActionTrade } = useActionTradeStore();
  const { operations, setOperations } = useOperationStore();
  const allIndicatorData = useRef<Record<string, any>>(null);
  const [from, setFrom] = useState(0)
  const [markersLenth, setMarkerLength] = useState(0)
  const window = 600



  

  
  

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
    setCount(Math.min(100, data.length))

    chart.timeScale().fitContent()
    

    // Resize
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        chart.applyOptions({ width, height });
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, []);

  useEffect(() => {
    console.log("Cambiando FRom", currentCount)
    const fr = Math.floor(currentCount/window)*window
    setFrom(Math.max(0, fr-1))
  }, [currentCount]);



  useEffect(() => {
    const obj: Record<string, any> = {};
    console.log("Cambiando DAtos")
    chartIndicators.forEach(indicator => {
      const key = indicator.name;
      const params = Object.values(indicator.params);

      switch (key) {
        case 'EMA':
          obj[key] = calculateEMA(data, params[0].value as number);
          break;
        case 'Bandas De Bolinguer':
          obj[key] = calculateBollingerBands(data, params[0].value as number, params[1].value as number);
          break;
        case 'RSI':
          obj[key] = calculateRSI(data, params[0].value as number);
          break;
        case 'Stochastic':
          obj[key] = calculateStochastic(data, params[0].value as number, params[1].value as number);
          break;
        case 'Rate of Change':
          obj[key] = calculateROC(data, params[0].value as number);
          break;
        case 'Parabolic SAR':
          obj[key] = calculateParabolicSAR(data, params[0].value as number);
          break;
      }
    });
    Object.entries(indicatorSeriesRef.current).forEach(([key, series])=>{
      if(!obj[key]){
        console.log("Eliminado ", key)
        switch (key) {
          case 'Bandas De Bolinguer':
            if(series.type == "bollinger"){
              chartRef.current?.removeSeries(series.upper)
              chartRef.current?.removeSeries(series.lower)
              chartRef.current?.removeSeries(series.middle)
            }
            break;
          case 'Stochastic':
            if(series.type == "stochastic"){
              chartRef.current?.removeSeries(series.kSeries)
              chartRef.current?.removeSeries(series.dSeries)
            }
            break;
          default: 
            if(series.type == "single"){
              chartRef.current?.removeSeries(series.series)
            }
            break;
        }
        delete indicatorSeriesRef.current[key]
      }
    })
    allIndicatorData.current = obj

  }, [data, chartIndicators]);
  

  useEffect(()=>{
    const chart = chartRef.current;
    const candleSeries = candleSeriesRef.current;
    if (!chart || !candleSeries || currentCount >= data.length) return;

    const slice = data.slice(from, currentCount);
    candleSeries.setData(slice);

  }, [currentCount, from])

  useEffect(()=>{
    const chart = chartRef.current;
    const candleSeries = candleSeriesRef.current;
    if (!chart || !candleSeries) return;

    const paneMap: Record<string, number> = {};
    let nextPane = 1;
    chartIndicators.forEach(idc => {
      if (NEED_PANE.has(idc.name) && paneMap[idc.name] == null) {
        paneMap[idc.name] = nextPane++;
      }
    });

    chartIndicators.forEach(idc => {
      const key = idc.name;
      const params = Object.values(idc.params);

      switch (idc.name) {
        case "EMA": {
          const color = params[0].color;
          const period = params[0].value as number;
          const fullEmaData = allIndicatorData.current?.EMA;
          const emaSlice = fullEmaData.slice(Math.max(0, from-period+1), Math.max(0, currentCount-period+1))
          //console.log("From Ema: ", Math.max(0, from-period+1), "To", Math.max(0, currentCount-period+1), "Cur", currentCount)
          //console.log("Ema: ", emaSlice)

          if (!indicatorSeriesRef.current[key]) {
            indicatorSeriesRef.current[key] = {
              type: "single",
              series: chart.addSeries(LineSeries, {
                color,
                lineWidth: 1,
                priceLineVisible: false,
                lastValueVisible: false
              })
            }
          }
          const series = indicatorSeriesRef.current[key]
          if(series.type == "single"){
            series.series.applyOptions({color})
            series.series.setData(emaSlice);
          }
          break;
        }

        case "Bandas De Bolinguer": {
          const period = params[0].value as number;
          const colorPeriod = params[0].color;
          const colorDeviation = params[1].color;

          const fullBB = allIndicatorData.current?.[key];
          const data =  fullBB.slice(Math.max(0, from-period+1), Math.max(0, currentCount-period+1))
          if (!indicatorSeriesRef.current[key]) {
            const upper = chart.addSeries(LineSeries, {
              color: colorPeriod,
              lineWidth: 2,
              priceLineVisible: false,
              lastValueVisible: false
            });
            const middle = chart.addSeries(LineSeries, {
              color: colorDeviation,
              lineWidth: 1,
              priceLineVisible: false,
              lastValueVisible: false
            });
            const lower = chart.addSeries(LineSeries, {
              color: colorPeriod,
              lineWidth: 2,
              priceLineVisible: false,
              lastValueVisible: false
            });

            indicatorSeriesRef.current[key] = {
              type: "bollinger",
              upper,
              middle,
              lower
            };
          } 
          const series = indicatorSeriesRef.current[key]
          if(series.type == "bollinger"){
            series.upper.applyOptions({color: colorPeriod})
            series.middle.applyOptions({color: colorDeviation})
            series.lower.applyOptions({color: colorPeriod})
            series.upper.setData(data.map((d: { upper: any; time: any; }) => ({ value: d.upper, time: d.time })));
            series.middle.setData(data.map((d: { middle: any; time: any; }) => ({ value: d.middle, time: d.time })));
            series.lower.setData(data.map((d: { lower: any; time: any; }) => ({ value: d.lower, time: d.time })));
          }
          break;
        }

        case "RSI": {
          const period = params[0].value as number;
          const color = params[0].color;
          const fullRsi = allIndicatorData.current?.[key];
          const data = fullRsi.slice(Math.max(0, from-period+1), Math.max(0, currentCount-period+1))

          if (!indicatorSeriesRef.current[key]) {
            indicatorSeriesRef.current[key] = {
              type: "single",
              series:  chart.addSeries(LineSeries, {
                color,
                lineWidth: 1,
                priceLineVisible: false,
                lastValueVisible: false
              }, paneMap["RSI"]!)
            };
          }
          const series = indicatorSeriesRef.current[key]
          if(series.type == "single"){
            series.series.applyOptions({color})
            series.series.setData(data);
          }
          break;
        }

        case "Stochastic": {
          const kPeriod = params[0].value as number;
          const kColor = params[0].color;
          const dColor = params[1].color;
          const fullSt = allIndicatorData.current?.[key];
          const data = fullSt.slice(Math.max(0, from-kPeriod+1), Math.max(0, currentCount-kPeriod+1))

          if (!indicatorSeriesRef.current[key]) {
            const kSeries = chart.addSeries(LineSeries, {
              color: kColor,
              lineWidth: 1,
              priceLineVisible: false,
              lastValueVisible: false
            }, paneMap["Stochastic"]!);
            const dSeries = chart.addSeries(LineSeries, {
              color: dColor,
              lineWidth: 1,
              priceLineVisible: false,
              lastValueVisible: false
            }, paneMap["Stochastic"]!);

            kSeries.createPriceLine({
              price: 80,
              color: "gray",
              lineStyle: LineStyle.Dashed,
              lineWidth: 1,
              axisLabelVisible: false,
              title: "Overbought"
            });

            kSeries.createPriceLine({
              price: 20,
              color: "gray",
              lineStyle: LineStyle.Dashed,
              lineWidth: 1,
              axisLabelVisible: false,
              title: "Oversold"
            });

            indicatorSeriesRef.current[key] = {
              type: "stochastic",
              kSeries,
              dSeries
            };
          }
          const series = indicatorSeriesRef.current[key]
          if(series.type == "stochastic"){
            series.kSeries.applyOptions({color: kColor})
            series.dSeries.applyOptions({color: dColor})
            series.kSeries.setData(data.map((d: { k: any; time: any; }) => ({ value: d.k, time: d.time })));
            series.dSeries.setData(data.map((d: { d: any; time: any; }) => ({ value: d.d, time: d.time })));
          }
          break;
        }

        case "Parabolic SAR": {
          const color = params[0].color;
          const fullSar = allIndicatorData.current?.[key];
          const data = fullSar.slice(from, currentCount)

          if (!indicatorSeriesRef.current[key]) {
            indicatorSeriesRef.current[key] = {
              type: "single",
              series: chart.addCustomSeries(
                new ParabolicSARSeries(chart),
                {
                  color,
                  size: 4
                } as ParabolicSAROptions
              )
            };
          }
          const series = indicatorSeriesRef.current[key]
          if(series.type == "single"){
            series.series.applyOptions({color})
            series.series.setData(data);
          }
          break;
        }

        case "Rate of Change": {
          const period = params[0].value as number;
          const color = params[0].color;
          const fullRoc = allIndicatorData.current?.[key];
          const data = fullRoc.slice(Math.max(0, from-period), Math.max(0, currentCount-period))

          if (!indicatorSeriesRef.current[key]) {
            indicatorSeriesRef.current[key] = {
              type: "single",
              series: chart.addSeries(HistogramSeries, {
                color,
                base: 0,
                priceLineVisible: false,
                lastValueVisible: false
              }, paneMap["Rate of Change"]!)
            };
          }
          const series = indicatorSeriesRef.current[key]
          if(series.type == "single"){
            series.series.applyOptions({color})
            series.series.setData(data);
          }
          break;
        }

        default:
          break;
      }
    });
  }, [chartIndicators, currentCount, from])

  useEffect(()=>{
    const chart = chartRef.current;
    const candleSeries = candleSeriesRef.current;
    if (!chart || !candleSeries) return;
    // Manejo de operaciones y marcadores
    const markers: SeriesMarker<Time>[] = [];
    operations.filter(p=>p.openDate >= data[from].time && p.openDate <= data[currentCount-1].time).forEach((operation) => {
      const candleOpen = data[operation.indexCandle];
      const openMarker: SeriesMarker<Time> = {
        time: operation.openDate,
        position: candleOpen.close < candleOpen.open ? 'atPriceBottom' : 'atPriceTop',
        color: operation.direction === Directions.Up ? '#2196F3' : '#e91e63',
        shape: operation.direction === Directions.Up ? 'arrowUp' : 'arrowDown',
        text: operation.direction,
        price: operation.openPrice,
      };
      markers.push(openMarker);

      if ((operation.indexCandle + operation.duration) < currentCount) {
        if (!operation.closeDate && !operation.closePrice) {
          const dif = currentCount - 1 - operation.indexCandle;
          if (dif === operation.duration) {
            const candleClose = data[currentCount-1];
            let result: Result | null = null;
            if (operation.direction === Directions.Up) {
              result = candleClose.close > operation.openPrice ? TradeResult.Won : TradeResult.Lost;
            } else if (operation.direction === Directions.Down) {
              result = candleClose.close < operation.openPrice ? TradeResult.Won : TradeResult.Lost;
            }

            let profit = 0;
            if (result === TradeResult.Won) profit = operation.amount * 0.85;
            else if (result === TradeResult.Lost) profit = -operation.amount;

            setOperations(
              operations.map((op) =>
                op.indexCandle !== operation.indexCandle
                  ? op
                  : {
                      ...op,
                      closeDate: candleClose.time,
                      closePrice: candleClose.close,
                      result: result,
                      profit: profit,
                    }
              )
            );
          }
        } else {
          const closeMarker: SeriesMarker<Time> = {
            time: operation.closeDate!,
            position: operation.closePrice! < operation.openPrice ? 'atPriceBottom' : 'atPriceTop',
            color: operation.result === TradeResult.Won ? '#2196F3' : '#e91e63',
            shape: 'circle',
            text: operation.result as string,
            price: operation.closePrice!,
          };
          markers.push(closeMarker);
        }
      }
    });
    if(markersLenth != markers.length){
      console.log("Markers: ", markers)
      /** @type {import('lightweight-charts').createSeriesMarkers} */
      if(seriesMarkersRef.current){
        seriesMarkersRef.current.setMarkers(markers)
      }else{
        seriesMarkersRef.current = createSeriesMarkers(candleSeries, markers)
      }
      setMarkerLength(markers.length)
    }
    
  }, [operations, currentCount, from])

  
  useEffect(()=>{
    if(actionTrade){
      if(currentCount > 0){

        const candle = data[currentCount - 1]
        const newOperation: Operation = {
          indexCandle: currentCount-1,
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
