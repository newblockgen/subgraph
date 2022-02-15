import { BigInt, ethereum, log, Address, ByteArray, Bytes, BigDecimal } from "@graphprotocol/graph-ts";

import {  currencies } from "./contractsData";
import { AnswerUpdated } from "../generated/exchanger/Contract";

import {
  CoinIncrease, ZssetTradingVolOneDay,Transaction
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
    readCoinIncrease(block.timestamp,pair);
  }
}



function readCoinIncrease(timestamp: BigInt, synth: string): void {
  let id =synth;
  let coinIncrease = CoinIncrease.load(id);
  if (!coinIncrease) {
    coinIncrease = new CoinIncrease(id);
    coinIncrease.synth = synth;
    coinIncrease.volume = BigInt.zero();
    coinIncrease.fee = BigDecimal.zero();
  }
  coinIncrease.timestamp = timestamp;
  coinIncrease.save();
  //同步手续费
  let zssat = synth.split("/")[0].trim().toString();
  if (!zssat.startsWith("z")) {
    zssat = "z" + zssat;
  }
  let timeId = ((timestamp.toI32()+86400) / 86400).toString() + zssat;
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

