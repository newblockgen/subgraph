import { BigInt, ethereum, log, Address, ByteArray, Bytes, dataSource } from "@graphprotocol/graph-ts";
import {
  Contract,
  AnswerUpdated
} from "../generated/chainlink/Contract"
import {  Price } from "../generated/schema"
import {
  updateDailyCandle,
  updateFiveCandle,
  updateFifteenCandle,
  updateOneHourCandle,
  updateFourHoursCandle,
  updateWeekCandle
} from "./candle-helper";

import {chainlinkContracts,currencies} from "./contractsData"

export function handleAggregatorAnswerUpdated(event:AnswerUpdated):void {
}

export function handleBlock(block: ethereum.Block): void {

  /*for (let i =0;i< currencies.length;i++){
    let pair = currencies[i];
    updatePrice(chainlinkContracts.get(pair),block);
  }*/
  let address = dataSource.address();
  updatePrice(address.toHexString(),block);
}

function updatePrice(contractAddress:string ,block: ethereum.Block) :void {
  let oracle = Contract.bind(Address.fromString(contractAddress))
  let PAIR = oracle.description();

  //Create a new Price object, with the block number as ID.
  let price = new Price(block.number.toString()+ PAIR)
  //Create a new instance of Chainlink Contract
  //Call to get price information
  let callResult = oracle.try_latestAnswer()
  if(callResult.reverted){
    log.warning("Get Latest price reverted at block: {}", [block.number.toString()])
    return;
  }
  //Add data onto Price
  price.timestamp = block.timestamp
  price.blockNumber = block.number
  price.price = callResult.value
  price.pair = PAIR

  //Save the Price
  price.save()

  let rate = callResult.value;

  updateDailyCandle(block.timestamp, PAIR, rate);
  updateFiveCandle(block.timestamp, PAIR, rate);
  updateFifteenCandle(block.timestamp, PAIR, rate);
  updateOneHourCandle(block.timestamp, PAIR, rate);
  updateFourHoursCandle(block.timestamp, PAIR, rate);
  updateWeekCandle(block.timestamp, PAIR, rate);
}
