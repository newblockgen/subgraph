import { BigInt,log } from "@graphprotocol/graph-ts"

import {
  ExchangeTracking
} from "../generated/exchanger/Synthetix"

import {Transaction} from "../generated/schema";

export  function handleExchangeTracking(event:ExchangeTracking):void{
   let transaction = Transaction.load(event.transaction.hash.toHexString());
   if (!transaction){
     transaction = new Transaction(event.transaction.hash.toHexString());
   }

  transaction.trackingCode = event.params.trackingCode
  transaction.toCurrencyKey = event.params.toCurrencyKey
  transaction.toAmount = event.params.toAmount
  transaction.fee = event.params.fee
  transaction.block = event.block.number
  transaction.timestamp = event.block.timestamp
  transaction.save()

}