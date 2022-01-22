import {
  ZssetTradingVolOneDay,
  ZssetTradingVolFiveMinute,
  ZssetTradingVolFifteenMinute,
  ZssetTradingVolOneHour,
  ZssetTradingVolFourHour,
  ZssetTradingVolWeekly

} from "../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";

export function CurrencyOneDayVol(currency: string, number: BigInt, fee: BigInt, timestamp: BigInt): void {
  let id = (timestamp.toI32() / 86400).toString() + currency;
  let zssetTradingVolOneDay = ZssetTradingVolOneDay.load(id);
  if (!zssetTradingVolOneDay) {
    zssetTradingVolOneDay = new ZssetTradingVolOneDay(id);
    zssetTradingVolOneDay.currencyKey = currency;
    zssetTradingVolOneDay.timstamp = timestamp;
    zssetTradingVolOneDay.tradingTimes = BigInt.fromI32(1);
    zssetTradingVolOneDay.startAmount = number;
    zssetTradingVolOneDay.fee = fee;
    zssetTradingVolOneDay.finalAmount = number;
    zssetTradingVolOneDay.save();
    return;
  }
  zssetTradingVolOneDay.timstamp = timestamp;
  zssetTradingVolOneDay.tradingTimes = zssetTradingVolOneDay.tradingTimes.plus(BigInt.fromI32(1));
  zssetTradingVolOneDay.finalAmount = zssetTradingVolOneDay.finalAmount.plus(number);
  zssetTradingVolOneDay.fee = zssetTradingVolOneDay.fee.plus(fee);
  zssetTradingVolOneDay.save();
}

export function CurrencyFiveMinuteVol(currency: string, number: BigInt, fee: BigInt, timestamp: BigInt): void {
  let id = (timestamp.toI32() / 300).toString() + currency;
  let zssetTradingVol = ZssetTradingVolFiveMinute.load(id);
  if (!zssetTradingVol) {
    zssetTradingVol = new ZssetTradingVolFiveMinute(id);
    zssetTradingVol.currencyKey = currency;
    zssetTradingVol.timstamp = timestamp;
    zssetTradingVol.tradingTimes = BigInt.fromI32(1);
    zssetTradingVol.startAmount = number;
    zssetTradingVol.fee = fee;
    zssetTradingVol.finalAmount = number;
    zssetTradingVol.save();
    return;
  }
  zssetTradingVol.timstamp = timestamp;
  zssetTradingVol.tradingTimes = zssetTradingVol.tradingTimes.plus(BigInt.fromI32(1));
  zssetTradingVol.finalAmount = zssetTradingVol.finalAmount.plus(number);
  zssetTradingVol.fee = zssetTradingVol.fee.plus(fee);
  zssetTradingVol.save();
}

export function CurrencyFifteenMinuteVol(currency: string, number: BigInt, fee: BigInt, timestamp: BigInt): void {
  let id = (timestamp.toI32() / 900).toString() + currency;
  let zssetTradingVol = ZssetTradingVolFifteenMinute.load(id);
  if (!zssetTradingVol) {
    zssetTradingVol = new ZssetTradingVolFifteenMinute(id);
    zssetTradingVol.currencyKey = currency;
    zssetTradingVol.timstamp = timestamp;
    zssetTradingVol.tradingTimes = BigInt.fromI32(1);
    zssetTradingVol.startAmount = number;
    zssetTradingVol.fee = fee;
    zssetTradingVol.finalAmount = number;
    zssetTradingVol.save();
    return;
  }
  zssetTradingVol.timstamp = timestamp;
  zssetTradingVol.tradingTimes = zssetTradingVol.tradingTimes.plus(BigInt.fromI32(1));
  zssetTradingVol.finalAmount = zssetTradingVol.finalAmount.plus(number);
  zssetTradingVol.fee = zssetTradingVol.fee.plus(fee);
  zssetTradingVol.save();
}

export function CurrencyOneHourVol(currency: string, number: BigInt, fee: BigInt, timestamp: BigInt): void {
  let id = (timestamp.toI32() / 3600).toString() + currency;
  let zssetTradingVol = ZssetTradingVolOneHour.load(id);
  if (!zssetTradingVol) {
    zssetTradingVol = new ZssetTradingVolOneHour(id);
    zssetTradingVol.currencyKey = currency;
    zssetTradingVol.timstamp = timestamp;
    zssetTradingVol.tradingTimes = BigInt.fromI32(1);
    zssetTradingVol.startAmount = number;
    zssetTradingVol.fee = fee;
    zssetTradingVol.finalAmount = number;
    zssetTradingVol.save();
    return;
  }
  zssetTradingVol.timstamp = timestamp;
  zssetTradingVol.tradingTimes = zssetTradingVol.tradingTimes.plus(BigInt.fromI32(1));
  zssetTradingVol.finalAmount = zssetTradingVol.finalAmount.plus(number);
  zssetTradingVol.fee = zssetTradingVol.fee.plus(fee);
  zssetTradingVol.save();
}

export function CurrencyFourHourVol(currency: string, number: BigInt, fee: BigInt, timestamp: BigInt): void {
  let id = (timestamp.toI32() / 14400).toString() + currency;
  let zssetTradingVol = ZssetTradingVolFourHour.load(id);
  if (!zssetTradingVol) {
    zssetTradingVol = new ZssetTradingVolFourHour(id);
    zssetTradingVol.currencyKey = currency;
    zssetTradingVol.timstamp = timestamp;
    zssetTradingVol.tradingTimes = BigInt.fromI32(1);
    zssetTradingVol.startAmount = number;
    zssetTradingVol.fee = fee;
    zssetTradingVol.finalAmount = number;
    zssetTradingVol.save();
    return;
  }
  zssetTradingVol.timstamp = timestamp;
  zssetTradingVol.tradingTimes = zssetTradingVol.tradingTimes.plus(BigInt.fromI32(1));
  zssetTradingVol.finalAmount = zssetTradingVol.finalAmount.plus(number);
  zssetTradingVol.fee = zssetTradingVol.fee.plus(fee);
  zssetTradingVol.save();
}

export function CurrencyWeeklyVol(currency: string, number: BigInt, fee: BigInt, timestamp: BigInt): void {
  let id = (timestamp.toI32() / 604800).toString() + currency;
  let zssetTradingVol = ZssetTradingVolWeekly.load(id);
  if (!zssetTradingVol) {
    zssetTradingVol = new ZssetTradingVolWeekly(id);
    zssetTradingVol.currencyKey = currency;
    zssetTradingVol.timstamp = timestamp;
    zssetTradingVol.tradingTimes = BigInt.fromI32(1);
    zssetTradingVol.startAmount = number;
    zssetTradingVol.fee = fee;
    zssetTradingVol.finalAmount = number;
    zssetTradingVol.save();
    return;
  }
  zssetTradingVol.timstamp = timestamp;
  zssetTradingVol.tradingTimes = zssetTradingVol.tradingTimes.plus(BigInt.fromI32(1));
  zssetTradingVol.finalAmount = zssetTradingVol.finalAmount.plus(number);
  zssetTradingVol.fee = zssetTradingVol.fee.plus(fee);
  zssetTradingVol.save();
}