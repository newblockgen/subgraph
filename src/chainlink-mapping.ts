import { BigInt, ethereum, log, Address } from "@graphprotocol/graph-ts"
import {
  Contract,
} from "../generated/Contract/Contract"
import { History, Price } from "../generated/schema"

export function handleBlock(block: ethereum.Block): void {

  let PAIR = "ETH/USD"

  //Create a new Price object, with the block number as ID.
  let price = new Price(block.number.toString())

  //Try to load the History object, but if not, then create it.
  let history = History.load(PAIR)
  if(history == null){
    history = new History(PAIR)
    history.latestBlock = BigInt.fromI32(0)
    history.lastPrice = BigInt.fromI32(0)
    history.priceHistory = []
  }

  //Create a new instance of Chainlink Contract
  let oracle = Contract.bind(Address.fromString("0xF79D6aFBb6dA890132F9D7c355e3015f15F3406F"))


  //Call to get price information
  let callResult = oracle.try_latestAnswer()
  if(callResult.reverted){
    log.warning("Get Latest price reverted at block: {}", [block.number.toString()])
  }

  log.warning("The Price of ETH at Block: {} was: {}", [block.number.toString(),callResult.value.toString()])

  //Add data onto Price
  price.timestamp = block.timestamp
  price.blockNumber = block.number
  price.price = callResult.value
  price.pair = PAIR


  //Update History
  history.latestBlock = block.number
  history.lastPrice = callResult.value


  //Add this price to this history array
  let priceHistory = history.priceHistory
  priceHistory.push(price.id)
  history.priceHistory = priceHistory


  //Save the Price
  price.save()
  //Save the History
  history.save()
}
