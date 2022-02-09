import { BigInt, ethereum, log, Address, ByteArray, Bytes, BigDecimal } from "@graphprotocol/graph-ts";

import { chainlinkContracts, currencies, synthetixCurrencies } from "./contractsData";
import { AnswerUpdated, Contract } from "../generated/exchanger/Contract";
import { token } from "../generated/exchanger/token";
import {
  CoinIncrease, ZssetTradingVolOneDay,
  DailyCandle, FiveMinutePrice, Transaction
} from "../generated/schema";

import {
  CurrencyOneDayVol, CurrencyFiveMinuteVol, CurrencyFifteenMinuteVol,
  CurrencyOneHourVol, CurrencyFourHourVol, CurrencyWeeklyVol
} from "./ZssetTrading-helper";

export function handleAggregatorAnswerUpdated(event: AnswerUpdated): void {
}

export function handleZssetTradingBlock(block: ethereum.Block): void {
  for (let i = 0; i < currencies.length; i++) {
    let pair = currencies[i];
    updatePrice(chainlinkContracts.get(pair), block, pair);
  }
}

function updatePrice(contractAddress: string, block: ethereum.Block, pair: string): void {
  let oracle = Contract.bind(Address.fromString(contractAddress));

  let callResult = oracle.try_latestAnswer();
  let decimail = oracle.try_decimals();
  if (callResult.reverted) {
    log.info("Get Latest price reverted at pair {}", [pair]);
    return;
  }
  if (decimail.reverted) {
    log.warning("Get Latest price reverted at block: {}", [pair]);
  }
  let dex = (10 ** BigInt.fromI64(decimail.value).toI64()).toString();

  let price = callResult.value.divDecimal(BigDecimal.fromString(dex));

  let rate = callResult.value;

  updateDailyCandle(block.timestamp, pair, rate);
  updateFiveCandle(block.timestamp, pair, rate, price);
}

export function updateDailyCandle(timestamp: BigInt, synth: string, rate: BigInt): void {
  let dayID = timestamp.toI32() / 86400;
  let newCandle = DailyCandle.load(dayID.toString() + "-" + synth);
  if (newCandle == null) {
    newCandle = new DailyCandle(dayID.toString() + "-" + synth);
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

export function updateFiveCandle(timestamp: BigInt, synth: string, rate: BigInt, synPrice: BigDecimal): void {
  let dayID = timestamp.toI32() / 300;
  let newCandle = FiveMinutePrice.load(dayID.toString() + "-" + synth);
  if (newCandle == null) {
    newCandle = new FiveMinutePrice(dayID.toString() + "-" + synth);
    newCandle.synth = synth;
    newCandle.open = rate;
    newCandle.high = rate;
    newCandle.low = rate;
    newCandle.close = rate;
    newCandle.timestamp = timestamp;
    newCandle.save();
    readCoinIncrease(newCandle, timestamp, synPrice);
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

function readCoinIncrease(coinPrice: FiveMinutePrice, timestamp: BigInt, synPrice: BigDecimal): void {
  let id = coinPrice.synth.toString();
  let coinIncrease = CoinIncrease.load(id);
  if (!coinIncrease) {
    coinIncrease = new CoinIncrease(id);
    coinIncrease.synth = coinPrice.synth;
    coinIncrease.bPrice = coinPrice.close;
    coinIncrease.increase = BigDecimal.zero();
    coinIncrease.volume = BigInt.zero();
    coinIncrease.fee = BigDecimal.zero();
    coinIncrease.high = coinPrice.close;
    coinIncrease.low = coinPrice.close;
  }
  coinIncrease.timestamp = timestamp;
  //当前市值
  let supply = coinTotalSupply(coinPrice.synth);
  log.info("价格转换：{} , {},{}", [supply.toString(), synPrice.toString(), ""]);
  coinIncrease.marketVal = supply.times(synPrice).truncate(2);
  let rate = (coinIncrease.price.minus(coinIncrease.bPrice)).divDecimal(coinIncrease.bPrice.toBigDecimal()).truncate(4);
  log.info("coinIncrease price : {},bfprice :{} ,rate :{}",
    [coinIncrease.price.toString(), coinIncrease.bPrice.toString(), rate.toString()]);
  coinIncrease.increase = rate;
  coinIncrease.price = coinPrice.close;
  coinIncrease.save();
  //同步二十四小时最高低价 todo *24
  let beforDayTime = timestamp.minus(BigInt.fromI32(60 * 60 *24));
  let dayID = beforDayTime.toI32() / 86400;
  let newCandle = DailyCandle.load(dayID.toString() + "-" + coinPrice.synth);
  if (newCandle) {
    coinIncrease.high = newCandle.high;
    coinIncrease.low = newCandle.low;
    /* coinIncrease.bPrice = newCandle.close;
     let rate = (coinIncrease.price.minus(coinIncrease.bPrice)).divDecimal(coinIncrease.bPrice.toBigDecimal()).truncate(4);
     log.info("coinIncrease price : {},bfprice :{} ,rate :{}",
       [coinIncrease.price.toString(), coinIncrease.bPrice.toString(), rate.toString()]);
     coinIncrease.increase = rate;*/
    coinIncrease.save();
  }
  //同步二十四小时前的价格
  let beforFiveTime = timestamp.minus(BigInt.fromI32(60 * 60 * 24));
  let fiveId = beforFiveTime.toI32() / 300;
  let newFiveCandle = FiveMinutePrice.load(fiveId.toString() + "-" + coinPrice.synth);
  if (newFiveCandle) {
    coinIncrease.bPrice = newFiveCandle.close;
    let rate = (coinIncrease.price.minus(coinIncrease.bPrice)).divDecimal(coinIncrease.bPrice.toBigDecimal()).truncate(4);
    log.info("coinIncrease price : {},bfprice :{} ,rate :{}",
      [coinIncrease.price.toString(), coinIncrease.bPrice.toString(), rate.toString()]);
    coinIncrease.increase = rate;
    coinIncrease.save();
  }
  //同步手续费
  let zssat = coinPrice.synth.split("/")[0].trim().toString();
  if (!zssat.startsWith("z")) {
    zssat = "z" + zssat;
  }
  let timeId = (timestamp.toI32() / 86400).toString() + zssat;
  let zsset = ZssetTradingVolOneDay.load(timeId);
  if (zsset) {
    coinIncrease.volume = zsset.finalAmount;
    coinIncrease.fee = zsset.fee.toBigDecimal();
    coinIncrease.save();
  }
}

//币种的交易记录\
export function zssetValcolum(transaction: Transaction): void {
  let fromcurrency = transaction.fromCurrencyKey as string;
  let tocurrency = transaction.toCurrencyKey as string;
  CurrencyOneDayVol(fromcurrency, transaction.fromAmount, transaction.fee, transaction.timstamp);
  CurrencyOneDayVol(tocurrency, transaction.toAmount, BigInt.zero(), transaction.timstamp);


  CurrencyFiveMinuteVol(fromcurrency, transaction.fromAmount, transaction.fee, transaction.timstamp);
  CurrencyFiveMinuteVol(tocurrency, transaction.toAmount, BigInt.zero(), transaction.timstamp);

  CurrencyFifteenMinuteVol(fromcurrency, transaction.fromAmount, transaction.fee, transaction.timstamp);
  CurrencyFifteenMinuteVol(tocurrency, transaction.toAmount, BigInt.zero(), transaction.timstamp);

  CurrencyOneHourVol(fromcurrency, transaction.fromAmount, transaction.fee, transaction.timstamp);
  CurrencyOneHourVol(tocurrency, transaction.toAmount, BigInt.zero(), transaction.timstamp);

  CurrencyFourHourVol(fromcurrency, transaction.fromAmount, transaction.fee, transaction.timstamp);
  CurrencyFourHourVol(tocurrency, transaction.toAmount, BigInt.zero(), transaction.timstamp);

  CurrencyWeeklyVol(fromcurrency, transaction.fromAmount, transaction.fee, transaction.timstamp);
  CurrencyWeeklyVol(tocurrency, transaction.toAmount, BigInt.zero(), transaction.timstamp);
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
