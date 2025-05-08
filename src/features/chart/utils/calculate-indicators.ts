import {
    EMA,
    BollingerBands,
    RSI,
    Stochastic,
    ROC,
    PSAR
  } from 'technicalindicators';
  import { CandlestickData } from 'lightweight-charts';
  
  // EMA
  export function calculateEMA(data: CandlestickData[], period: number) {
    const closes = data.map(candle => candle.close);
    const emaValues = EMA.calculate({ period, values: closes });
  
    return emaValues.map((value, index) => ({
      time: data[index + (data.length - emaValues.length)].time,
      value
    }));
  }
  
  // Bollinger Bands
  export function calculateBollingerBands(data: CandlestickData[], period: number, deviation: number) {
    const closes = data.map(candle => candle.close);
    const bb = BollingerBands.calculate({ period, stdDev: deviation, values: closes });
  
    return bb.map((value, index) => ({
      time: data[index + (data.length - bb.length)].time,
      upper: value.upper,
      middle: value.middle,
      lower: value.lower,
    }));
  }
  
  // RSI
  export function calculateRSI(data: CandlestickData[], period: number) {
    const closes = data.map(candle => candle.close);
    const rsiValues = RSI.calculate({ period, values: closes });
  
    return rsiValues.map((value, index) => ({
      time: data[index + (data.length - rsiValues.length)].time,
      value
    }));
  }
  
  // Stochastic Oscillator
  export function calculateStochastic(data: CandlestickData[], kPeriod: number, dPeriod: number) {
    const input = {
      high: data.map(c => c.high),
      low: data.map(c => c.low),
      close: data.map(c => c.close),
      period: kPeriod,
      signalPeriod: dPeriod
    };
    const stoch = Stochastic.calculate(input);
  
    return stoch.map((value, index) => ({
      time: data[index + (data.length - stoch.length)].time,
      k: value.k,
      d: value.d
    }));
  }
  
  // ROC - Rate of Change
  export function calculateROC(data: CandlestickData[], period: number) {
    const closes = data.map(candle => candle.close);
    const rocValues = ROC.calculate({ period, values: closes });
  
    return rocValues.map((value, index) => ({
      time: data[index + (data.length - rocValues.length)].time,
      value
    }));
  }
  
  // Parabolic SAR
  export function calculateParabolicSAR(data: CandlestickData[], step = 0.02, max = 0.2) {
    const input = {
      high: data.map(c => c.high),
      low: data.map(c => c.low),
      step,
      max
    };
    const psarValues = PSAR.calculate(input);
  
    return psarValues.map((value, index) => ({
      time: data[index + (data.length - psarValues.length)].time,
      value
    }));
  }
  