import { RatesUpdated as RatesUpdatedEvent } from '../generated/ExchangeRates/ExchangeRates';
import { AnswerUpdated as AnswerUpdatedEvent } from '../generated/AggregatorBNB/Aggregator';
import { AddressResolver } from '../generated/AggregatorBNB/AddressResolver';
import { ExchangeRates } from '../generated/ExchangeRates/ExchangeRates';

import {
  RatesUpdated,
  RateUpdate,
  AggregatorAnswer,
  FifteenMinuteHZNPrice,
  DailyHZNPrice,
  LatestRate,
} from '../generated/schema';

import { contracts } from './contractsData';
import { contractsToProxies } from './contractsToProxies';
import { strToBytes } from './common';

import { ByteArray, Bytes, BigInt, Address, log } from '@graphprotocol/graph-ts';
import { updateDailyCandle } from './candle-helper';

function loadDailyHZNPrice(id: string): DailyHZNPrice {
  let newDailyHZNPrice = new DailyHZNPrice(id);
  newDailyHZNPrice.count = BigInt.fromI32(0);
  newDailyHZNPrice.averagePrice = BigInt.fromI32(0);
  return newDailyHZNPrice;
}

function loadFifteenMinuteHZNPrice(id: string): FifteenMinuteHZNPrice {
  let newFifteenMinuteHZNPrice = new FifteenMinuteHZNPrice(id);
  newFifteenMinuteHZNPrice.count = BigInt.fromI32(0);
  newFifteenMinuteHZNPrice.averagePrice = BigInt.fromI32(0);
  return newFifteenMinuteHZNPrice;
}

function calculateAveragePrice(oldAveragePrice: BigInt, newRate: BigInt, newCount: BigInt): BigInt {
  return oldAveragePrice
    .times(newCount.minus(BigInt.fromI32(1)))
    .plus(newRate)
    .div(newCount);
}

function handleSNXPrices(timestamp: BigInt, rate: BigInt): void {
  let dayID = timestamp.toI32() / 86400;
  let fifteenMinuteID = timestamp.toI32() / 900;

  let dailyHZNPrice = DailyHZNPrice.load(dayID.toString());
  let fifteenMinuteHZNPrice = FifteenMinuteHZNPrice.load(fifteenMinuteID.toString());

  if (dailyHZNPrice == null) {
    dailyHZNPrice = loadDailyHZNPrice(dayID.toString());
  }

  if (fifteenMinuteHZNPrice == null) {
    fifteenMinuteHZNPrice = loadFifteenMinuteHZNPrice(fifteenMinuteID.toString());
  }

  dailyHZNPrice.count = dailyHZNPrice.count.plus(BigInt.fromI32(1));
  dailyHZNPrice.averagePrice = calculateAveragePrice(dailyHZNPrice.averagePrice, rate, dailyHZNPrice.count);

  fifteenMinuteHZNPrice.count = fifteenMinuteHZNPrice.count.plus(BigInt.fromI32(1));
  fifteenMinuteHZNPrice.averagePrice = calculateAveragePrice(
    fifteenMinuteHZNPrice.averagePrice,
    rate,
    fifteenMinuteHZNPrice.count,
  );

  dailyHZNPrice.save();
  fifteenMinuteHZNPrice.save();
}

export function handleRatesUpdated(event: RatesUpdatedEvent): void {
  // addDollar('sUSD');
  // addDollar('nUSD');

  let entity = new RatesUpdated(event.transaction.hash.toHex() + '-' + event.logIndex.toString());
  entity.currencyKeys = event.params.currencyKeys;
  entity.newRates = event.params.newRates;
  entity.timestamp = event.block.timestamp;
  entity.block = event.block.number;
  entity.from = event.transaction.from;
  entity.gasPrice = event.transaction.gasPrice;
  entity.save();

  // required due to assemblyscript
  let keys = entity.currencyKeys;
  let rates = entity.newRates;
  // now save each individual update
  for (let i = 0; i < entity.currencyKeys.length; i++) {
    if (keys[i].toString() != '') {
      let rateEntity = new RateUpdate(event.transaction.hash.toHex() + '-' + keys[i].toString());
      rateEntity.block = event.block.number;
      rateEntity.timestamp = event.block.timestamp;
      rateEntity.currencyKey = keys[i];
      rateEntity.synth = keys[i].toString();
      rateEntity.rate = rates[i];
      rateEntity.save();
      if (keys[i].toString() == 'HZN') {
        handleSNXPrices(event.block.timestamp, rateEntity.rate);
      }
      addLatestRate(rateEntity.synth, rateEntity.rate);
    }
  }
}

function createRates(event: AnswerUpdatedEvent, currencyKey: Bytes, rate: BigInt): void {
  let entity = new AggregatorAnswer(event.transaction.hash.toHex() + '-' + currencyKey.toString());
  entity.block = event.block.number;
  entity.timestamp = event.block.timestamp;
  entity.currencyKey = currencyKey;
  entity.synth = currencyKey.toString();
  entity.rate = rate;
  entity.roundId = event.params.roundId;
  entity.aggregator = event.address;
  entity.save();

  addLatestRate(entity.synth, entity.rate);
  updateDailyCandle(event.block.timestamp, currencyKey.toString(), rate);

  // save aggregated event as rate update from v2.17.5 (Procyon)
  if (event.block.number > BigInt.fromI32(9769220)) {
    let rateEntity = new RateUpdate(event.transaction.hash.toHex() + '-' + entity.synth);
    rateEntity.block = entity.block;
    rateEntity.timestamp = entity.timestamp;
    rateEntity.currencyKey = currencyKey;
    rateEntity.synth = entity.synth;
    rateEntity.rate = entity.rate;
    rateEntity.save();
    if (entity.currencyKey.toString() == 'HZN') {
      handleSNXPrices(entity.timestamp, entity.rate);
    }
  }
}

// create a contract mapping to know which synth the aggregator corresponds to
export function handleAggregatorAnswerUpdated(event: AnswerUpdatedEvent): void {
  // From Pollux on, use the ExchangeRates to get the currency keys that use this aggregator
  if (event.block.number > BigInt.fromI32(9769220)) {
    // Note: hard coding the latest ReadProxyAddressResolver address
    let readProxyAdressResolver = '0x263A8220e9351c5d0cC13567Db4d7BF58e7470c6';
    let resolver = AddressResolver.bind(Address.fromHexString(readProxyAdressResolver) as Address);
    let exrates = ExchangeRates.bind(resolver.getAddress(strToBytes('ExchangeRates', 32)));

    let tryCurrencyKeys = exrates.try_currenciesUsingAggregator(Address.fromHexString(
      // for the aggregator, we need the proxy
      contractsToProxies.get(event.address.toHexString()),
    ) as Address);

    if (tryCurrencyKeys.reverted) {
      log.debug('currenciesUsingAggregator was reverted in tx hash: {}, from block: {}', [
        event.transaction.hash.toHex(),
        event.block.number.toString(),
      ]);
      return;
    }

    let currencyKeys = tryCurrencyKeys.value;
    // for each currency key using this aggregator
    for (let i = 0; i < currencyKeys.length; i++) {
      // create an answer entity for the non-zero entries
      if (currencyKeys[i].toString() != '') {
        createRates(event, currencyKeys[i], exrates.rateForCurrency(currencyKeys[i]));
      }
    }
  } else {
    // for pre-pollux, use a contract mapping to get the currency key
    let currencyKey = contracts.get(event.address.toHexString());
    // and calculate the rate from Chainlink's Aggregator directly by multiplying by 1e10 to
    // turn the 8 decimal int to a 18 decimal one
    let rate = event.params.current.times(BigInt.fromI32(10).pow(10));
    createRates(event, ByteArray.fromHexString(currencyKey) as Bytes, rate);
  }
}

function addLatestRate(synth: string, rate: BigInt): void {
  let latestRate = LatestRate.load(synth);
  if (latestRate == null) {
    latestRate = new LatestRate(synth);
  }
  latestRate.rate = rate;
  latestRate.save();
}

function addDollar(dollarID: string): void {
  let dollarRate = LatestRate.load(dollarID);
  if (dollarRate == null) {
    dollarRate = new LatestRate(dollarID);
    let oneDollar = BigInt.fromI32(10);
    dollarRate.rate = oneDollar.pow(18);
    dollarRate.save();
  }
}
