import { DailyCandle,FiveMinutePrice,FifteenMinutePrice,OneHourPrice,FourHoursPrice,WeekPrice } from '../generated/schema';
import { BigInt } from '@graphprotocol/graph-ts';

export function updateDailyCandle(timestamp: BigInt, synth: string, rate: BigInt): void {
  let dayID = timestamp.toI32() / 86400;
  let newCandle = DailyCandle.load(dayID.toString() + '-' + synth);
  if (newCandle == null) {
    newCandle = new DailyCandle(dayID.toString() + '-' + synth);
    newCandle.synth = synth;
    newCandle.open = rate;
    newCandle.high = rate;
    newCandle.low = rate;
    newCandle.close = rate;
    newCandle.timestamp = timestamp;
    newCandle.save();
    return;
  }
  if (newCandle.low > rate) {
    newCandle.low = rate;
  }
  if (newCandle.high < rate) {
    newCandle.high = rate;
  }
  newCandle.close = rate;
  newCandle.save();
}


export function updateFiveCandle(timestamp: BigInt, synth: string, rate: BigInt): void {
  let dayID = timestamp.toI32() / 300;
  let newCandle = FiveMinutePrice.load(dayID.toString() + '-' + synth);
  if (newCandle == null) {
    newCandle = new FiveMinutePrice(dayID.toString() + '-' + synth);
    newCandle.synth = synth;
    newCandle.open = rate;
    newCandle.high = rate;
    newCandle.low = rate;
    newCandle.close = rate;
    newCandle.timestamp = timestamp;
    newCandle.save();
    return;
  }
  if (newCandle.low > rate) {
    newCandle.low = rate;
  }
  if (newCandle.high < rate) {
    newCandle.high = rate;
  }
  newCandle.close = rate;
  newCandle.save();
}

export function updateFifteenCandle(timestamp: BigInt, synth: string, rate: BigInt): void {
  let dayID = timestamp.toI32() / 900;
  let newCandle = FifteenMinutePrice.load(dayID.toString() + '-' + synth);
  if (newCandle == null) {
    newCandle = new FifteenMinutePrice(dayID.toString() + '-' + synth);
    newCandle.synth = synth;
    newCandle.open = rate;
    newCandle.high = rate;
    newCandle.low = rate;
    newCandle.close = rate;
    newCandle.timestamp = timestamp;
    newCandle.save();
    return;
  }
  if (newCandle.low > rate) {
    newCandle.low = rate;
  }
  if (newCandle.high < rate) {
    newCandle.high = rate;
  }
  newCandle.close = rate;
  newCandle.save();
}

export function updateOneHourCandle(timestamp: BigInt, synth: string, rate: BigInt): void {
  let dayID = timestamp.toI32() / 3600;
  let newCandle = OneHourPrice.load(dayID.toString() + '-' + synth);
  if (newCandle == null) {
    newCandle = new OneHourPrice(dayID.toString() + '-' + synth);
    newCandle.synth = synth;
    newCandle.open = rate;
    newCandle.high = rate;
    newCandle.low = rate;
    newCandle.close = rate;
    newCandle.timestamp = timestamp;
    newCandle.save();
    return;
  }
  if (newCandle.low > rate) {
    newCandle.low = rate;
  }
  if (newCandle.high < rate) {
    newCandle.high = rate;
  }
  newCandle.close = rate;
  newCandle.save();
}

export function  updateFourHoursCandle (timestamp: BigInt, synth: string, rate: BigInt): void {
  let dayID = timestamp.toI32() / 14400;
  let newCandle = FourHoursPrice.load(dayID.toString() + '-' + synth);
  if (newCandle == null) {
    newCandle = new FourHoursPrice(dayID.toString() + '-' + synth);
    newCandle.synth = synth;
    newCandle.open = rate;
    newCandle.high = rate;
    newCandle.low = rate;
    newCandle.close = rate;
    newCandle.timestamp = timestamp;
    newCandle.save();
    return;
  }
  if (newCandle.low > rate) {
    newCandle.low = rate;
  }
  if (newCandle.high < rate) {
    newCandle.high = rate;
  }
  newCandle.close = rate;
  newCandle.save();
}

export function  updateWeekCandle (timestamp: BigInt, synth: string, rate: BigInt): void {
  let dayID = timestamp.toI32() / 604800;
  let newCandle = WeekPrice.load(dayID.toString() + '-' + synth);
  if (newCandle == null) {
    newCandle = new WeekPrice(dayID.toString() + '-' + synth);
    newCandle.synth = synth;
    newCandle.open = rate;
    newCandle.high = rate;
    newCandle.low = rate;
    newCandle.close = rate;
    newCandle.timestamp = timestamp;
    newCandle.save();
    return;
  }
  if (newCandle.low > rate) {
    newCandle.low = rate;
  }
  if (newCandle.high < rate) {
    newCandle.high = rate;
  }
  newCandle.close = rate;
  newCandle.save();
}