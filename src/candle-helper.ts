import {
  DailyCandle,
  FiveMinutePrice,
  FifteenMinutePrice,
  OneHourPrice,
  FourHoursPrice,
  WeekPrice,
  CoinIncrease
} from "../generated/schema";
import { BigInt } from '@graphprotocol/graph-ts';
import { Address, BigDecimal, log } from "@graphprotocol/graph-ts/index";
import { synthetixCurrencies } from "./contractsData";
import { token } from "../generated/chainlink/token";

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
  updateCoinIncreases(newCandle,timestamp);
}

export function updateCoinIncreases(newCandle:DailyCandle,timestamp: BigInt):void{
  let synth = newCandle.synth.split("/")[0].trim().toString();
  if (!synth.startsWith("z")) {
    synth = "z" + synth;
  }
  let id = synth.toString();
  let coinIncrease = CoinIncrease.load(id);
  if (!coinIncrease) {
    coinIncrease = new CoinIncrease(id);
    coinIncrease.synth = synth;
    coinIncrease.bPrice = newCandle.open;
    coinIncrease.high = newCandle.high;
    coinIncrease.low = newCandle.low;
    coinIncrease.price = newCandle.close
  }else{
    coinIncrease.bPrice = newCandle.open;
    coinIncrease.high = newCandle.high;
    coinIncrease.low = newCandle.low;
    coinIncrease.price = newCandle.close
  }
  coinIncrease.timestamp = timestamp;
  let supply = coinTotalSupply(synth);
  log.info("价格转换：{} , {},{}", [supply.toString(), coinIncrease.price.toString(), ""]);
  coinIncrease.marketVal = supply.times(coinIncrease.price.toBigDecimal()).truncate(2);
  let rate = (coinIncrease.price.minus(coinIncrease.bPrice)).divDecimal(coinIncrease.bPrice.toBigDecimal()).truncate(4);
  coinIncrease.increase = rate;
  coinIncrease.save();
}


function coinTotalSupply(coin: string): BigDecimal {
  const coinAddress = synthetixCurrencies.get(coin);
  let coinContract = token.bind(Address.fromString(coinAddress));
  let totalSupply = coinContract.try_totalSupply();
  let decimail = coinContract.try_decimals();
  if (totalSupply.reverted) {
    log.info("Get Latest price reverted at pair {}", [coin]);
    return BigDecimal.zero();
  }
  if (decimail.reverted) {
    log.warning("Get Latest price reverted at block: {}", []);
  }
  let dex = (10 ** BigInt.fromI64(decimail.value).toI64()).toString();

  let number = totalSupply.value.divDecimal(BigDecimal.fromString(dex));
  return number;
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