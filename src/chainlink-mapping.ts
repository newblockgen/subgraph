import { AnswerUpdated as AnswerUpdatedEvent } from '../generated/AggregatorBNB/Aggregator';
import { AddressResolver } from '../generated/AggregatorBNB/AddressResolver';
import { ExchangeRates } from '../generated/ExchangeRates/ExchangeRates';

import { AggregatorAnswer, LatestRate } from '../generated/schema';

import { contracts } from './contractsData';
import { contractsToProxies } from './contractsToProxies';
import { strToBytes } from './common';

import { ByteArray, Bytes, BigInt, Address, log } from '@graphprotocol/graph-ts';

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

  let latestRate = LatestRate.load(entity.synth);
  if (latestRate == null) {
    latestRate = new LatestRate(entity.synth);
  }
  latestRate.rate = entity.rate;
  latestRate.save();
}

// create a contract mapping to know which synth the aggregator corresponds to
export function handleAggregatorAnswerUpdated(event: AnswerUpdatedEvent): void {
  // From Pollux on, use the ExchangeRates to get the currency keys that use this aggregator
  if (event.block.number > BigInt.fromI32(1)) {
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
    let key = strToBytes('HZN', 32)
    currencyKeys = [key];


    // for each currency key using this aggregator
    for (let i = 0; i < currencyKeys.length; i++) {
      // create an answer entity for the non-zero entries
      if (currencyKeys[i].toString() != '') {
        createRates(event, currencyKeys[i], event.params.current);
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


export function handleAggregatorAnswerUpdated2(event: AnswerUpdatedEvent): void {
  // From Pollux on, use the ExchangeRates to get the currency keys that use this aggregator
  if (event.block.number > BigInt.fromI32(1)) {
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
    let key = strToBytes('HZN', 32)
    currencyKeys = [key];


    // for each currency key using this aggregator
    for (let i = 0; i < currencyKeys.length; i++) {
      // create an answer entity for the non-zero entries
      if (currencyKeys[i].toString() != '') {
        createRates(event, currencyKeys[i], event.params.current);
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