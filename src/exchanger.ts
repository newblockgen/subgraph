import { BigInt, log, Bytes, ethereum, dataSource, Address, BigDecimal } from "@graphprotocol/graph-ts";

import {
  ExchangeTracking,
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
} from "../generated/exchanger/Synthetix";
import { Contract } from "../generated/exchanger/Contract";
import { zssetValcolum,handleZssetTradingBlock } from "./ZssetTrading";

import {
  token
} from "../generated/exchanger/token";
import { strToBytes } from "./common";

import {
  Transaction,
  Account,
  RegisterMember,
  ZAssetBalance,
  Portfolio,
  OneHourPortFolio, OneDayPortFolio, WeekPortFolio, MonthPortFolio, YearPortFolio
} from "../generated/schema";
import { synthetixCurrencies, currencies, chainlinkContracts } from "./contractsData";

// 按区块统计用户余额
export function handleBlock(block: ethereum.Block): void {
  let address = dataSource.address();
  let time = block.timestamp;
  if ((time.mod(BigInt.fromI32(3600))) > BigInt.fromI32(5)) {
    log.info("time is not used {}", [time.mod(BigInt.fromI32(3600)).toString()]);
    return;
  }
  let accounts = RegisterMember.load(address.toHex() + "-account");
  if (accounts) {
    let currencyPrice = new Map<string, BigDecimal[]>();
    for (let i = 0; i < currencies.length; i++) {
      let pair = currencies[i];
      let price = getCurrecyPrice(pair);
      currencyPrice.set(pair, price);
    }
    let accountArray = accounts.accountList;
    log.info("accountArray:{}",[accountArray.length.toString()])
    for (let i = 0; i < accountArray.length; i++) {
      let accountId = accountArray[i];
      let account = Account.load(accountId);
      log.info("accountArray: account{}",[accountId])
      if (account) {
        memberTokenBalance(account.account, block, currencyPrice);
      }
    }
  }
  handleZssetTradingBlock(block);
}

//统计用户余额
function memberTokenBalance(accountId: Bytes, block: ethereum.Block, priceCurrcy: Map<string, BigDecimal[]>): void {
  let portfolio = Portfolio.load(accountId.toHexString() + "-" + block.timestamp.toString());
  if (!portfolio) {
    portfolio = new Portfolio(accountId.toHexString() + "-" + block.timestamp.toString());
  }
  let count = BigDecimal.zero();
  let zassetArray = portfolio.zasset;
  for (let i = 0; i < currencies.length; i++) {
    let pair = currencies[i];
    let pairAddress = synthetixCurrencies.get(pair);
    let balace = loadBalance(pairAddress, accountId);
    let ZAssetBalance = memberHistory(balace[0], accountId, block, pair, priceCurrcy);
    count = count.plus(ZAssetBalance.usdConvertBalance);
    zassetArray.push(ZAssetBalance.id);
  }
  portfolio.zasset = zassetArray;
  portfolio.account = accountId;
  portfolio.amount = count;
  portfolio.timstamp = block.timestamp;
  portfolio.save();

  updateOneHourPortFolio(portfolio);
  updateOneDayPortFolio(portfolio);
  updateWeekPortFolio(portfolio);
  updateMonthPortFolio(portfolio);
  updateYearPortFolio(portfolio);
}

//查询chinlink 币对价格
function getCurrecyPrice(pair: string): BigDecimal[] {
  let address = chainlinkContracts.get(pair);
  let oracle = Contract.bind(Address.fromString(address));
  let callResult = oracle.try_latestAnswer();
  let decimail = oracle.try_decimals();
  if (callResult.reverted) {
    log.info("Get Latest price reverted at pair", [pair]);
  }
  if (decimail.reverted) {
    log.warning("Get Latest price reverted at block: {}", [pair]);
  }
  let dex = (10 ** BigInt.fromI64(decimail.value).toI64()).toString();

  let price = callResult.value.divDecimal(BigDecimal.fromString(dex));
  return [callResult.value.toBigDecimal(), price];
}

//添加用户币对历史
function memberHistory(balace: BigInt, accountId: Bytes, block: ethereum.Block, pair: string, priceCurrcy: Map<string, BigDecimal[]>): ZAssetBalance {
  let id = accountId.toHexString() + block.timestamp.toHexString() + "-" + pair;
  let zAssetBalanceBo = ZAssetBalance.load(id);
  if (!zAssetBalanceBo) {
    zAssetBalanceBo = new ZAssetBalance(id);
  }
  zAssetBalanceBo.timstamp = block.timestamp;
  zAssetBalanceBo.account = accountId;
  zAssetBalanceBo.balance = balace;
  zAssetBalanceBo.currencyKey = pair;
  zAssetBalanceBo.rate = BigInt.fromString(priceCurrcy.get(pair)[0].toString());
  let balances = balace.divDecimal(BigInt.fromI32(10).pow(18).toBigDecimal());
  zAssetBalanceBo.usdConvertBalance = balances.times(priceCurrcy.get(pair)[1]).truncate(2);
  zAssetBalanceBo.save();
  return zAssetBalanceBo;
}

// 用户余额
function loadBalance(pairAddress: string, account: Bytes): BigInt[] {
  let tokenContract = token.bind(Address.fromString(pairAddress));
  let balancetr = tokenContract.try_balanceOf(Address.fromString(account.toHex()));
  let decimail = tokenContract.try_decimals();
  if (balancetr.reverted) {
    log.warning("Get Latest price reverted at block: {}", [account.toHex()]);
  }
  if (decimail.reverted) {
    log.warning("Get Latest price reverted at block: {}", [account.toHex()]);
  }
  let bigDecimail = BigInt.fromI32(decimail.value);
  return [balancetr.value, bigDecimail];
}

//交易记录
export function handleExchangeTracking(event: ExchangeTracking): void {
  let transaction = Transaction.load(event.transaction.hash.toHexString());
  if (!transaction) {
    transaction = new Transaction(event.transaction.hash.toHexString());
  }
  transaction.trackingCode = event.params.trackingCode.toString();
  transaction.fee = event.params.fee;
  transaction.save();

}


export function handleAccountLiquidated(event: AccountLiquidated): void {
  log.info("log in handleAccountLiquidated", []);
}

export function handleCacheUpdated(event: CacheUpdated): void {
  log.info("log in handleCacheUpdated", []);
}

export function handleExchangeRebate(event: ExchangeRebate): void {
  log.info("log in handleExchangeRebate", []);
}

export function handleExchangeReclaim(event: ExchangeReclaim): void {
  log.info("log in handleExchangeReclaim", []);
}

export function handleOwnerChanged(event: OwnerChanged): void {
  log.info("log in handleOwnerChanged", []);
}

export function handleOwnerNominated(event: OwnerNominated): void {
  log.info("log in handleOwnerNominated", []);
}

export function handleProxyUpdated(event: ProxyUpdated): void {
  log.info("log in handleProxyUpdated", []);
}

//交易记录
export function handleSynthExchange(event: SynthExchange): void {
  let trans = Transaction.load(event.transaction.hash.toHexString());
  if (!trans) {
    trans = new Transaction(event.transaction.hash.toHexString());
  }
  trans.transactionHash = event.transaction.hash;
  trans.account = event.params.account;
  trans.fromAmount = event.params.fromAmount;
  trans.fromCurrencyKey = event.params.fromCurrencyKey.toString();
  trans.toCurrencyKey = event.params.toCurrencyKey.toString();
  trans.toAmount = event.params.toAmount;
  trans.symbol = (trans.fromCurrencyKey as string).concat("/").concat((trans.toCurrencyKey as string));
  trans.block = event.block.number;
  trans.timstamp = event.block.timestamp;
  trans.save();
  addAccount(trans.account, event.block);
  zssetValcolum(trans);
}

// 凡是交易过的用户都添加监听
function addAccount(account: Bytes, block: ethereum.Block): void {
  let accounts = RegisterMember.load(dataSource.address().toHex() + "-account");
  if (accounts === null) {
    accounts = new RegisterMember(dataSource.address().toHex() + "-account");
  }
  let accountArray = accounts.accountList;
  if (accountArray.indexOf(account.toHexString()) == -1) {
    let accountBody = Account.load(account.toHexString());
    if (!accountBody) {
      accountBody = new Account(account.toHexString());
      accountBody.account = account;
      accountBody.save();
    }
    accountArray.push(accountBody.id);
    accounts.accountList = accountArray;
    accounts.count = accounts.count.plus(BigInt.fromI32(1));
  }
  accounts.timstamp = block.timestamp;
  accounts.save();

}

export function handleTokenStateUpdated(event: TokenStateUpdated): void {
  log.info("log in handleTokenStateUpdated", []);
}

export function handleTransaction(event: Transfer): void {
  log.info("log in handleTransaction", []);
}

// 用户每小时余额持币对比
function updateOneHourPortFolio(portfolio: Portfolio): void {
  let time = BigInt.fromI32(60 * 60);
  let id = portfolio.account.toHexString() + "-" + time.toString();
  let portBo = OneHourPortFolio.load(id);
  if (!portBo) {
    portBo = new OneHourPortFolio(id);
    portBo.account = portfolio.account;
    portBo.timstamp = portfolio.timstamp;
    portBo.amount = portfolio.amount;
    portBo.startAmount = portfolio.amount;
    portBo.save();
    return;
  }
  portBo.account = portfolio.account;
  portBo.timstamp = portfolio.timstamp;
  let beforAmount = portfolio.amount;
  let beforTime = portfolio.timstamp.minus(time);
  let beforPorfolioBo = Portfolio.load(portfolio.account.toHexString() + "-" + beforTime.toString());
  if (beforPorfolioBo) {
    portBo.startAmount = beforPorfolioBo.amount;
  } else {
    portBo.startAmount = beforAmount;
  }
  portBo.amount = portfolio.amount;
  portBo.save();

}

// 用户最近1天余额持币对比
function updateOneDayPortFolio(portfolio: Portfolio): void {
  let time = BigInt.fromI32(60 * 60 * 24);
  let id = portfolio.account.toHexString() + "-" + time.toString();
  let portBo = OneDayPortFolio.load(id);
  if (!portBo) {
    portBo = new OneDayPortFolio(id);
    portBo.account = portfolio.account;
    portBo.timstamp = portfolio.timstamp;
    portBo.amount = portfolio.amount;
    portBo.startAmount = portfolio.amount;
    portBo.save();
    return;
  }
  portBo.account = portfolio.account;
  portBo.timstamp = portfolio.timstamp;

  let beforAmount = portfolio.amount;
  let beforTime = portfolio.timstamp.minus(time);
  let beforPorfolioBo = Portfolio.load(portfolio.account.toHexString() + "-" + beforTime.toString());
  if (beforPorfolioBo) {
    portBo.startAmount = beforPorfolioBo.amount;
  } else {
    portBo.startAmount = beforAmount;
  }
  portBo.amount = portfolio.amount;
  portBo.save();
}

// 用户最近1周余额持币对比
function updateWeekPortFolio(portfolio: Portfolio): void {
  let time = BigInt.fromI32(60 * 60 * 24 * 7);
  let id = portfolio.account.toHexString() + "-" + time.toString();
  let portBo = WeekPortFolio.load(id);
  if (!portBo) {
    portBo = new WeekPortFolio(id);
    portBo.account = portfolio.account;
    portBo.timstamp = portfolio.timstamp;
    portBo.amount = portfolio.amount;
    portBo.startAmount = portfolio.amount;
    portBo.save();
    return;
  }
  portBo.account = portfolio.account;
  portBo.timstamp = portfolio.timstamp;
  let beforAmount = portfolio.amount;
  let beforTime = portfolio.timstamp.minus(time);
  let beforPorfolioBo = Portfolio.load(portfolio.account.toHexString() + "-" + beforTime.toString());
  if (beforPorfolioBo) {
    portBo.startAmount = beforPorfolioBo.amount;
  } else {
    portBo.startAmount = beforAmount;
  }
  portBo.amount = portfolio.amount;
  portBo.save();
}


// 用户最近一个月余额持币对比
function updateMonthPortFolio(portfolio: Portfolio): void {
  let time = BigInt.fromI32(60 * 60 * 24 * 30);
  let id = portfolio.account.toHexString() + "-" + time.toString();
  let portBo = MonthPortFolio.load(id);
  if (!portBo) {
    portBo = new MonthPortFolio(id);
    portBo.account = portfolio.account;
    portBo.timstamp = portfolio.timstamp;
    portBo.amount = portfolio.amount;
    portBo.startAmount = portfolio.amount;
    portBo.save();
    return;
  }
  portBo.account = portfolio.account;
  portBo.timstamp = portfolio.timstamp;
  let beforAmount = portfolio.amount;
  let beforTime = portfolio.timstamp.minus(time);
  let beforPorfolioBo = Portfolio.load(portfolio.account.toHexString() + "-" + beforTime.toString());
  if (beforPorfolioBo) {
    portBo.startAmount = beforPorfolioBo.amount;
  } else {
    portBo.startAmount = beforAmount;
  }
  portBo.amount = portfolio.amount;
  portBo.save();

}

// 用户最近1年余额持币对比
function updateYearPortFolio(portfolio: Portfolio): void {
  let time = BigInt.fromI32(60 * 60 * 24 * 365);
  let id = portfolio.account.toHexString() + "-" + time.toString();
  let portBo = YearPortFolio.load(id);
  if (!portBo) {
    portBo = new YearPortFolio(id);
    portBo.account = portfolio.account;
    portBo.timstamp = portfolio.timstamp;
    portBo.amount = portfolio.amount;
    portBo.startAmount = portfolio.amount;
    portBo.save();
    return;
  }
  portBo.account = portfolio.account;
  portBo.timstamp = portfolio.timstamp;
  let beforAmount = portfolio.amount;
  let beforTime = portfolio.timstamp.minus(time);
  let beforPorfolioBo = Portfolio.load(portfolio.account.toHexString() + "-" + beforTime.toString());
  if (beforPorfolioBo) {
    portBo.startAmount = beforPorfolioBo.amount;
  } else {
    portBo.startAmount = beforAmount;
  }
  portBo.amount = portfolio.amount;
  portBo.save();
}