import { BigInt, log, Bytes, ethereum,dataSource } from "@graphprotocol/graph-ts";

import {
  ExchangeTracking ,
  Transfer,
  AccountLiquidated,
  CacheUpdated,
  ExchangeRebate,
  ExchangeReclaim,
  OwnerChanged,
  OwnerNominated,
  ProxyUpdated,
  SynthExchange,
  TokenStateUpdated,
  Synthetix
} from "../generated/exchanger/Synthetix"

import {
  token
} from "../generated/exchanger/token"

import {Transaction,Account} from "../generated/schema";
import {synthetixCurrencies , currencies} from "./contractsData";

export function handleBlock(block: ethereum.Block): void {
   let address = dataSource.address()
  log.info("balock address: {}",[address.toHexString()])
}
/**
 *
  - AccountLiquidated(indexed address,uint256,uint256,address)
 - Approval(indexed address,indexed address,uint256)
 - CacheUpdated(bytes32,address)
 - ExchangeRebate(indexed address,bytes32,uint256)
 - ExchangeReclaim(indexed address,bytes32,uint256)
 - ExchangeTracking(indexed bytes32,bytes32,uint256,uint256)
 - OwnerChanged(address,address)
 - OwnerNominated(address)
 - ProxyUpdated(address)
 - SynthExchange(indexed address,bytes32,uint256,bytes32,uint256,address)
 - TokenStateUpdated(address)
 - Transfer(indexed address,indexed address,uint256)
 * @param event
 */
export  function handleExchangeTracking(event:ExchangeTracking):void{
   let transaction = Transaction.load(event.transaction.hash.toHexString());
   if (!transaction){
     transaction = new Transaction(event.transaction.hash.toHexString());
   }
  transaction.trackingCode = event.params.trackingCode.toString()
  transaction.fee = event.params.fee
  transaction.save()

  addAccount(transaction.account)
}


export function handleAccountLiquidated(event:AccountLiquidated):void{
  log.info("log in handleAccountLiquidated",[]);
}

export function handleCacheUpdated(event:CacheUpdated):void{
  log.info("log in handleCacheUpdated",[]);
}
export function handleExchangeRebate(event:ExchangeRebate):void{
  log.info("log in handleExchangeRebate",[]);
}
export function handleExchangeReclaim(event:ExchangeReclaim):void{
  log.info("log in handleExchangeReclaim",[]);
}
export function handleOwnerChanged(event:OwnerChanged):void{
  log.info("log in handleOwnerChanged",[]);
}
export function handleOwnerNominated(event:OwnerNominated):void{
  log.info("log in handleOwnerNominated",[]);
}export function handleProxyUpdated(event:ProxyUpdated):void{
  log.info("log in handleProxyUpdated",[]);
}
export function handleSynthExchange(event:SynthExchange):void{
  let trans = Transaction.load(event.transaction.hash.toHexString());
  if (!trans){
    trans = new Transaction(event.transaction.hash.toHexString());
  }
  trans.transactionHash = event.transaction.hash;
  trans.account = event.params.account
  trans.fromAmount =event.params.fromAmount
  trans.fromCurrencyKey = event.params.fromCurrencyKey.toString()
  trans.toCurrencyKey = event.params.toCurrencyKey.toString()
  trans.toAmount = event.params.toAmount
  trans.symbol = (trans.fromCurrencyKey as string).concat("/").concat((trans.toCurrencyKey as string));
  trans.block = event.block.number
  trans.timstamp = event.block.timestamp
  trans.save();

  addAccount(event.params.account)

  AccountPortfolios(event,trans);
}

function  addAccount(account:Bytes):void{
  let accounts =  Account.load(dataSource.address().toHexString()+"_account" )
  if (!accounts){
    accounts = new Account(dataSource.address().toHexString()+"__account");
    accounts.accouts.push(account);
  } else{
    log.info("accounts is includes:{}",[(accounts.accouts.indexOf(account)).toString(1)])
    if (!accounts.accouts.includes(account)){
      accounts.accouts.push(account);
    }
  }
  accounts.save();
}

function AccountPortfolios(event:SynthExchange,transaction:Transaction):void {

  for (let index =0;index<currencies.length;index++){
    let k = currencies[index];
    log.info(" AccountPortfolios key {},value {}",[k,synthetixCurrencies.get(k)])
  }
}

export function handleTokenStateUpdated(event:TokenStateUpdated):void{
  log.info("log in handleTokenStateUpdated",[]);
}

export function handleTransaction(event:Transfer):void{
  log.info("log in handleTransaction",[]);
}