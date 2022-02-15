import { BigInt, log, Bytes, ethereum, dataSource, Address, BigDecimal } from "@graphprotocol/graph-ts";
import {  ExchangeEntrySettled as ExchangeEntrySettledEvent } from "../generated/exchangerSett/exchanger";

import { ExchangeEntrySettled } from "../generated/schema";
import {toDecimal} from "./common"

export function handleExchangeEntrySettled(event: ExchangeEntrySettledEvent): void {
  let entity = ExchangeEntrySettled.load(event.transaction.hash.toHex() + '-' + event.logIndex.toString());
  if (!entity){
     entity = new ExchangeEntrySettled(event.transaction.hash.toHex() + '-' + event.logIndex.toString());
  }

  entity.from = event.params.from;
  entity.src = event.params.src;
  entity.amount = toDecimal(event.params.amount);
  entity.dest = event.params.dest;
  entity.reclaim = toDecimal(event.params.reclaim);
  entity.rebate = toDecimal(event.params.rebate);
  entity.srcRoundIdAtPeriodEnd = event.params.srcRoundIdAtPeriodEnd;
  entity.destRoundIdAtPeriodEnd = event.params.destRoundIdAtPeriodEnd;
  entity.exchangeTimestamp = event.params.exchangeTimestamp;

  entity.save();
}