import {
    ICustomSeriesPaneView,
    ICustomSeriesPaneRenderer,
    CustomSeriesOptions,
    Time,
    PriceToCoordinateConverter,
    ISeriesApi,
    PaneRendererCustomData,
    CustomSeriesWhitespaceData,
    CustomSeriesPricePlotValues,
    LineStyle,
    PriceLineSource,
    CustomBarItemData,
    IRange,
    IChartApi,
  } from 'lightweight-charts';
  import { CanvasRenderingTarget2D } from 'fancy-canvas';
  
  // Tus tipos
  export interface ParabolicSARData extends CustomSeriesWhitespaceData<Time> {
    time: Time;
    value: number;
  }
  
  export interface ParabolicSAROptions extends CustomSeriesOptions {
    size: number;
    color: string
  }
  
  // El renderer que ya tienes
  class ParabolicSARRenderer implements ICustomSeriesPaneRenderer {
    private _data: readonly CustomBarItemData<Time, ParabolicSARData>[] = [];
    private _options!: ParabolicSAROptions;
    private _chart!: IChartApi;

    setChart(chart: IChartApi): void {
      this._chart = chart;
    }
  
    setOptions(options: ParabolicSAROptions): void {
      this._options = options;
    }
  
    update(data: readonly CustomBarItemData<Time, ParabolicSARData>[], seriesOptions: ParabolicSAROptions): void {
      this._data = data;
      this._options = seriesOptions
    }
  
    draw(
      target: CanvasRenderingTarget2D,
      priceToCoordinate: PriceToCoordinateConverter,
      isHovered: boolean,
      hitTestData?: unknown
    ): void {
      target.useBitmapCoordinateSpace(({ context, horizontalPixelRatio, verticalPixelRatio }) => {
        context.save();
        context.fillStyle = this._options.color as string;
        const radius = this._options.size ?? 3;

        // 1) Obtenemos visibleRange
        const vr = this._chart.timeScale().getVisibleLogicalRange();
        if (!vr) {
          console.log('no visibleRange');
          return;
        }
        // 2) Asumimos que son números (UTCTimestamp)
        const from = typeof vr.from === 'number' ? vr.from : (vr.from as any).timestamp;
        const to   = typeof vr.to   === 'number' ? vr.to   : (vr.to   as any).timestamp;
        //console.log('visibleRange.from=', from, ' to=', to);

        for (const bar of this._data) {
          const t = bar.time; 
          // 3) Log de cada bar
          //console.log(' bar.time=', t);
          //console.log(' to=>', to)
          //console.log(' from=>', from)

          if (t < from-1 || t > to+1) {
            //console.log('   -> fuera de rango, se ignora');
            continue;
          }
          //console.log('   -> dentro de rango, se dibuja');

          const x = bar.x;
          const y = priceToCoordinate(bar.originalData.value);
          if (x != null && y != null) {
            const xr = x * horizontalPixelRatio;
            const yr = y * verticalPixelRatio;
            const r  = radius * horizontalPixelRatio;
            context.beginPath();
            context.arc(xr, yr, r, 0, 2 * Math.PI);
            context.fill();
          }
        }

        context.restore();
      });
    }
  }
  
  
 export class ParabolicSARSeries implements ICustomSeriesPaneView<Time, ParabolicSARData, ParabolicSAROptions> {
    private _renderer: ParabolicSARRenderer;
    private _data: PaneRendererCustomData<Time, ParabolicSARData> = {
      bars: [],
      barSpacing: 0,
      visibleRange: null,
    };
    private _options: ParabolicSAROptions = {
        color: 'blue',
        size: 3,
        lastValueVisible: false,
        title: '',
        visible: true,
        priceLineVisible: false,
        priceLineSource: PriceLineSource.LastBar,
        priceLineWidth: 3,
        priceLineColor: '',
        priceLineStyle: LineStyle.Solid,
        priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
        baseLineVisible: false,
        baseLineColor: '',
        baseLineWidth: 3,
        baseLineStyle: LineStyle.Solid
    };
  
    constructor(chart: IChartApi) {
      this._renderer = new ParabolicSARRenderer();
      this._renderer.setChart(chart)
    }
  
    renderer(): ICustomSeriesPaneRenderer {
      return this._renderer;
    }
  
    update(data: PaneRendererCustomData<Time, ParabolicSARData>, seriesOptions: ParabolicSAROptions): void {
      this._data = data;
      this._options = seriesOptions;
      this._renderer.setOptions(this._options);
      this._renderer.update(data.bars, seriesOptions);
    }
  
    priceValueBuilder(plotRow: ParabolicSARData): CustomSeriesPricePlotValues {
      const v = plotRow.value;
      return [v, v, v];
    }
  
    isWhitespace(data: ParabolicSARData | CustomSeriesWhitespaceData<Time> ): data is CustomSeriesWhitespaceData<Time>{
      //console.log(data)
      return false
    }
  
    defaultOptions(): ParabolicSAROptions {
      console.log('defaultOptions')
      return {
            color: 'blue',
            size: 3,
            lastValueVisible: false,
            title: '',
            visible: true,
            priceLineVisible: false,
            priceLineSource: PriceLineSource.LastBar,
            priceLineWidth: 3,
            priceLineColor: '',
            priceLineStyle: LineStyle.Solid,
            priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
            baseLineVisible: false,
            baseLineColor: '',
            baseLineWidth: 3,
            baseLineStyle: LineStyle.Solid
        };
    }
  
    destroy(): void {
      // Limpieza de recursos si es necesario
      console.log('defaultOptions')
    }
  }
  