// The latest Synthetix and event invocations
import { Synthetix as SNX, Transfer as SNXTransferEvent } from '../generated/Synthetix/Synthetix';

import { Synthetix32 } from '../generated/Synthetix/Synthetix32';

import { Synthetix4 } from '../generated/Synthetix/Synthetix4';

import { AddressResolver } from '../generated/Synthetix/AddressResolver';

import { zUSD32, zUSD4, getTimeID, strToBytes, toDecimal } from './common';

// SynthetixState has not changed ABI since deployment
import { SynthetixState } from '../generated/Synthetix/SynthetixState';

import { TargetUpdated as TargetUpdatedEvent } from '../generated/ProxySynthetix/Proxy';
import { Vested as VestedEvent, RewardEscrow } from '../generated/RewardEscrow/RewardEscrow';

import {
  Synth,
  Transfer as SynthTransferEvent,
  Issued as IssuedEvent,
  Burned as BurnedEvent,
} from '../generated/SynthzUSD/Synth';
import { FeesClaimed as FeesClaimedEvent } from '../generated/FeePool/FeePool';
import { FeePoolv217 } from '../generated/FeePool/FeePoolv217';

import {
  Synthetix,
  Transfer,
  Issued,
  Burned,
  Issuer,
  ContractUpdated,
  SNXHolder,
  DebtSnapshot,
  DebtState,
  SynthHolder,
  RewardEscrowHolder,
  FeesClaimed,
  TotalActiveStaker,
  TotalDailyActiveStaker,
  ActiveStaker,
  DailyIssued,
  DailyBurned,
} from '../generated/schema';

import { store, BigInt, Address, ethereum, Bytes } from '@graphprotocol/graph-ts';

import { log } from '@graphprotocol/graph-ts';

let contracts = new Map<string, string>();
contracts.set('escrow', '0x073c0c427e677aab733DBD4bD2de02951Fd329CC');
contracts.set('rewardEscrow', '0x0C5db2579AAb8C56D1e395082A1c870a7d28f3DA');

let v219UpgradeBlock = BigInt.fromI32(9769220); // Archernar v2.19.x Feb 20, 2020

function getMetadata(): Synthetix {
  let synthetix = Synthetix.load('1');

  if (synthetix == null) {
    synthetix = new Synthetix('1');
    synthetix.issuers = BigInt.fromI32(0);
    synthetix.snxHolders = BigInt.fromI32(0);
    synthetix.save();
  }

  return synthetix as Synthetix;
}

function incrementMetadata(field: string): void {
  let metadata = getMetadata();
  if (field == 'issuers') {
    metadata.issuers = metadata.issuers.plus(BigInt.fromI32(1));
  } else if (field == 'snxHolders') {
    metadata.snxHolders = metadata.snxHolders.plus(BigInt.fromI32(1));
  }
  metadata.save();
}

function decrementMetadata(field: string): void {
  let metadata = getMetadata();
  if (field == 'issuers') {
    metadata.issuers = metadata.issuers.minus(BigInt.fromI32(1));
  } else if (field == 'snxHolders') {
    metadata.snxHolders = metadata.snxHolders.minus(BigInt.fromI32(1));
  }
  metadata.save();
}

function trackIssuer(account: Address): void {
  let existingIssuer = Issuer.load(account.toHex());
  if (existingIssuer == null) {
    incrementMetadata('issuers');
    let issuer = new Issuer(account.toHex());
    issuer.save();
  }
}

function trackSNXHolder(
  snxContract: Address,
  account: Address,
  block: ethereum.Block,
  txn: ethereum.Transaction,
): void {
  let holder = account.toHex();
  // ignore escrow accounts
  if (contracts.get('escrow') == holder || contracts.get('rewardEscrow') == holder) {
    return;
  }
  let existingSNXHolder = SNXHolder.load(holder);
  let snxHolder = new SNXHolder(holder);
  snxHolder.block = block.number;
  snxHolder.timestamp = block.timestamp;

  // // Don't bother trying these extra fields before v2 upgrade (slows down The Graph processing to do all these as try_ calls)
  if (block.number > v219UpgradeBlock) {
    let synthetix = SNX.bind(snxContract);
    let balanceTry = synthetix.try_balanceOf(account);
    if (!balanceTry.reverted) {
      snxHolder.balanceOf = balanceTry.value;
    }

    let collateralTry = synthetix.try_collateral(account);
    if (!collateralTry.reverted) {
      snxHolder.collateral = collateralTry.value;
    }
    // Check transferable because it will be null when rates are stale
    let transferableTry = synthetix.try_transferableSynthetix(account);
    if (!transferableTry.reverted) {
      snxHolder.transferable = transferableTry.value;
    }
    let resolverTry = synthetix.try_resolver();
    if (resolverTry.reverted) {
      log.info('Skipping SNX holder tracking: No resolver property from SNX holder from hash: {}, block: {}', [
        txn.hash.toHex(),
        block.number.toString(),
      ]);
      return;
    }
    let resolverAddress = resolverTry.value;
    log.info('resolverAddress: {}', [resolverAddress.toHexString()]);
    let resolver = AddressResolver.bind(resolverAddress);

    let synthetixStateAddress = resolver.try_getAddress(strToBytes('SynthetixState', 32));
    if (synthetixStateAddress.reverted) {
      return;
    }
    let synthetixState = SynthetixState.bind(synthetixStateAddress.value);
    // let synthetixState = SynthetixState.bind(resolver.try_getAddress(strToBytes('SynthetixState', 32)));
    let totalIssuerCount = synthetixState.try_totalIssuerCount();
    if (totalIssuerCount.reverted) {
      log.info('totalIssuerCount try erro : {}', [txn.hash.toHex()]);
    }
    log.info('totalIssuerCount : {}', [totalIssuerCount.value.toString()]);


    let issuanceDataTry = synthetixState.try_issuanceData(account);
    if(!issuanceDataTry.reverted){
      return;
    }
    snxHolder.initialDebtOwnership = issuanceDataTry.value.value0;
    let debtLedgerTry = synthetixState.try_debtLedger(issuanceDataTry.value.value1);
    if (!debtLedgerTry.reverted) {
      snxHolder.debtEntryAtIndex = debtLedgerTry.value;
    }
  }

  if (
    (existingSNXHolder == null && snxHolder.balanceOf > BigInt.fromI32(0)) ||
    (existingSNXHolder != null &&
      existingSNXHolder.balanceOf == BigInt.fromI32(0) &&
      snxHolder.balanceOf > BigInt.fromI32(0))
  ) {
    incrementMetadata('snxHolders');
  } else if (
    existingSNXHolder != null &&
    existingSNXHolder.balanceOf > BigInt.fromI32(0) &&
    snxHolder.balanceOf == BigInt.fromI32(0)
  ) {
    decrementMetadata('snxHolders');
  }

  snxHolder.save();
}

export function trackGlobalDebt(block: ethereum.Block): void {
  let timeSlot = block.timestamp.minus(block.timestamp.mod(BigInt.fromI32(900)));

  let curDebtState = DebtState.load(timeSlot.toString());

  if (curDebtState == null) {
    // this is tmp because this will be refactored soon anyway
    let resolver = AddressResolver.bind(Address.fromHexString('0x263A8220e9351c5d0cC13567Db4d7BF58e7470c6') as Address);

    let synthetixStateAddress = resolver.try_getAddress(strToBytes('SynthetixState', 32));

    if (synthetixStateAddress.reverted) {
      return;
    }

    let synthetixState = SynthetixState.bind(synthetixStateAddress.value);

    let synthetix = SNX.bind(Address.fromHexString('0xC0eFf7749b125444953ef89682201Fb8c6A917CD') as Address);
    let issuedSynths = synthetix.try_totalIssuedSynthsExcludeEtherCollateral(strToBytes('zUSD', 32));

    if (issuedSynths.reverted) {
      issuedSynths = synthetix.try_totalIssuedSynths(strToBytes('zUSD', 32));
    }

    let debtStateEntity = new DebtState(timeSlot.toString());

    debtStateEntity.timestamp = block.timestamp;
    let debtEntryTry = synthetixState.try_lastDebtLedgerEntry()
    if (!debtEntryTry.reverted){
      debtStateEntity.debtEntry = toDecimal(debtEntryTry.value);
    }
    debtStateEntity.totalIssuedSynths = toDecimal(issuedSynths.value);

    debtStateEntity.debtRatio = debtStateEntity.totalIssuedSynths.div(debtStateEntity.debtEntry);
    debtStateEntity.save();
  }
}

function trackDebt(event: ethereum.Event): void {
  let snxContract = event.transaction.to as Address;
  let account = event.transaction.from;

  // ignore escrow accounts
  if (contracts.get('escrow') == account.toHex() || contracts.get('rewardEscrow') == account.toHex()) {
    return;
  }

  let entity = new DebtSnapshot(event.transaction.hash.toHex() + '-' + event.logIndex.toString());
  entity.block = event.block.number;
  entity.timestamp = event.block.timestamp.minus(event.block.timestamp.mod(BigInt.fromI32(900)));
  entity.account = account;

  if (event.block.number > v219UpgradeBlock) {
    let synthetix = SNX.bind(snxContract);
    let balanceTry = synthetix.try_balanceOf(account);
    if (!balanceTry.reverted) {
      entity.balanceOf = balanceTry.value;
    }
    let collateralTry = synthetix.try_collateral(account);
    if (!collateralTry.reverted) {
      entity.collateral = collateralTry.value;
    }
    let debtBalanceOfTry = synthetix.try_debtBalanceOf(account, zUSD32);
    entity.debtBalanceOf = debtBalanceOfTry.value;
  }
  // Use bytes32
  entity.save();
}

export function handleTransferSNX(event: SNXTransferEvent): void {
  let entity = new Transfer(event.transaction.hash.toHex() + '-' + event.logIndex.toString());
  entity.source = 'HZN';
  entity.from = event.params.from;
  entity.to = event.params.to;
  entity.value = event.params.value;
  entity.timestamp = event.block.timestamp;
  entity.block = event.block.number;
  entity.save();

  trackSNXHolder(event.address, event.params.from, event.block, event.transaction);
  trackSNXHolder(event.address, event.params.to, event.block, event.transaction);
}

function trackSynthHolder(contract: Synth, source: string, account: Address): void {
  let entityID = account.toHex() + '-' + source;
  let entity = SynthHolder.load(entityID);
  if (entity == null) {
    entity = new SynthHolder(entityID);
  }
  entity.synth = source;
  let contractBalanceTry = contract.try_balanceOf(account);
  if (!contractBalanceTry.reverted) {
    entity.balanceOf = contractBalanceTry.value;
  }
  entity.save();
}

export function handleTransferSynth(event: SynthTransferEvent): void {
  let contract = Synth.bind(event.address);
  let entity = new Transfer(event.transaction.hash.toHex() + '-' + event.logIndex.toString());
  entity.source = 'zUSD';
  if (event.block.number > v219UpgradeBlock) {
    // sUSD contract didn't have the "currencyKey" field prior to the v2 (multicurrency) release
    let currencyKeyTry = contract.try_currencyKey();
    if (!currencyKeyTry.reverted) {
      entity.source = currencyKeyTry.value.toString();
    }
  }
  entity.from = event.params.from;
  entity.to = event.params.to;
  entity.value = event.params.value;
  entity.timestamp = event.block.timestamp;
  entity.block = event.block.number;
  entity.save();

  trackSynthHolder(contract, entity.source, event.params.from);
  trackSynthHolder(contract, entity.source, event.params.to);
}

/**
 * Track when underlying contracts change
 */
function contractUpdate(source: string, target: Address, block: ethereum.Block, hash: Bytes): void {
  let entity = new ContractUpdated(hash.toHex());
  entity.source = source;
  entity.target = target;
  entity.block = block.number;
  entity.timestamp = block.timestamp;
  entity.save();
}

export function handleProxyTargetUpdated(event: TargetUpdatedEvent): void {
  contractUpdate('Synthetix', event.params.newTarget, event.block, event.transaction.hash);
}

// export function handleSetExchangeRates(call: SetExchangeRatesCall): void {
//   contractUpdate('ExchangeRates', call.inputs._exchangeRates, call.block, call.transaction.hash);
// }

// export function handleSetFeePool(call: SetFeePoolCall): void {
//   contractUpdate('FeePool', call.inputs._feePool, call.block, call.transaction.hash);
// }

/**
 * Handle reward vest events so that we know which addresses have rewards, and
 * to recalculate SNX Holders staking details.
 */
// Note: we use VestedEvent here even though is also handles VestingEntryCreated (they share the same signature)
export function handleRewardVestEvent(event: VestedEvent): void {
  let entity = new RewardEscrowHolder(event.params.beneficiary.toHex());
  let contract = RewardEscrow.bind(event.address);

  let balanceTry = contract.try_balanceOf(event.params.beneficiary);
  if (!balanceTry.reverted) {
    entity.balanceOf = balanceTry.value;
  }

  let vestedBalanceOfTry = contract.try_totalVestedAccountBalance(event.params.beneficiary)
  entity.vestedBalanceOf = vestedBalanceOfTry.value;
  entity.save();
  // now track the SNX holder as this action can impact their collateral
  let synthetixAddressTry = contract.try_synthetix();
  if(synthetixAddressTry.reverted){
    return;
  }
  trackSNXHolder(synthetixAddressTry.value, event.params.beneficiary, event.block, event.transaction);
}

export function handleIssuedSynths(event: IssuedEvent): void {
  // We need to figure out if this was generated from a call to Synthetix.issueSynths, issueMaxSynths or any earlier
  // versions.

  let functions = new Map<string, string>();

  functions.set('0xaf086c7e', 'issueMaxSynths()');
  functions.set('0x320223db', 'issueMaxSynthsOnBehalf(address)');
  functions.set('0x8a290014', 'issueSynths(uint256)');
  functions.set('0xe8e09b8b', 'issueSynthsOnBehalf(address,uint256');

  // Prior to Vega we had the currency key option in issuance
  functions.set('0xef7fae7c', 'issueMaxSynths(bytes32)'); // legacy
  functions.set('0x0ee54a1d', 'issueSynths(bytes32,uint256)'); // legacy

  // Prior to Sirius release, we had currency keys using bytes4
  functions.set('0x9ff8c63f', 'issueMaxSynths(bytes4)'); // legacy
  functions.set('0x49755b9e', 'issueSynths(bytes4,uint256)'); // legacy

  // Prior to v2
  functions.set('0xda5341a8', 'issueMaxNomins()'); // legacy
  functions.set('0x187cba25', 'issueNomins(uint256)'); // legacy

  // so take the first four bytes of input
  let input = event.transaction.input.subarray(0, 4) as Bytes;

  // and for any function calls that don't match our mapping, we ignore them
  if (!functions.has(input.toHexString())) {
    log.debug('Ignoring Issued event with input: {}, hash: {}, address: {}', [
      event.transaction.input.toHexString(),
      event.transaction.hash.toHex(),
      event.address.toHexString(),
    ]);
    return;
  }

  let entity = new Issued(event.transaction.hash.toHex() + '-' + event.logIndex.toString());
  entity.account = event.transaction.from;

  // Note: this amount isn't in sUSD for sETH or sBTC issuance prior to Vega
  entity.value = event.params.value;

  let synth = Synth.bind(event.address);
  let currencyKeyTry = synth.try_currencyKey();
  if (!currencyKeyTry.reverted) {
    entity.source = currencyKeyTry.value.toString();
  } else {
    entity.source = 'zUSD';
  }

  // Don't bother getting data pre-Archernar to avoid slowing The Graph down. Can be changed later if needed.
  if (event.block.number > v219UpgradeBlock && entity.source == 'zUSD') {
    let dayId = getTimeID(event.block.timestamp.toI32(), 86400);
    let synthetix = SNX.bind(event.transaction.to as Address);
    let totalIssuedTry = synthetix.try_totalIssuedSynthsExcludeEtherCollateral(zUSD32);

    let dailyIssuedEntity = DailyIssued.load(dayId);
    if (dailyIssuedEntity == null) {
      dailyIssuedEntity = new DailyIssued(dayId);
      dailyIssuedEntity.value = event.params.value;
    } else {
      dailyIssuedEntity.value = dailyIssuedEntity.value + event.params.value;
    }
    dailyIssuedEntity.totalDebt = totalIssuedTry.value;
    dailyIssuedEntity.save();
  }

  entity.timestamp = event.block.timestamp;
  entity.block = event.block.number;
  entity.gasPrice = event.transaction.gasPrice;
  entity.save();

  if (event.block.number > v219UpgradeBlock) {
    trackActiveStakers(event, false);
  }

  // track this issuer for reference
  trackIssuer(event.transaction.from);

  // update SNX holder details
  trackSNXHolder(event.transaction.to as Address, event.transaction.from, event.block, event.transaction);

  // now update SNXHolder to increment the number of claims
  let snxHolder = SNXHolder.load(entity.account.toHexString());
  if (snxHolder != null) {
    if (snxHolder.mints == null) {
      snxHolder.mints = BigInt.fromI32(0);
    }
    snxHolder.mints = snxHolder.mints.plus(BigInt.fromI32(1));
    snxHolder.save();
  }

  // update Debt snapshot history
  trackDebt(event);
}

export function handleBurnedSynths(event: BurnedEvent): void {
  // We need to figure out if this was generated from a call to Synthetix.burnSynths, burnSynthsToTarget or any earlier
  // versions.

  let functions = new Map<string, string>();
  functions.set('0x295da87d', 'burnSynths(uint256)');
  functions.set('0xc2bf3880', 'burnSynthsOnBehalf(address,uint256');
  functions.set('0x9741fb22', 'burnSynthsToTarget()');
  functions.set('0x2c955fa7', 'burnSynthsToTargetOnBehalf(address)');

  // Prior to Vega we had the currency key option in issuance
  functions.set('0xea168b62', 'burnSynths(bytes32,uint256)');

  // Prior to Sirius release, we had currency keys using bytes4
  functions.set('0xaf023335', 'burnSynths(bytes4,uint256)');

  // Prior to v2 (i.e. in Havven times)
  functions.set('0x3253ccdf', 'burnNomins(uint256');

  // so take the first four bytes of input
  let input = event.transaction.input.subarray(0, 4) as Bytes;

  // and for any function calls that don't match our mapping, we ignore them
  if (!functions.has(input.toHexString())) {
    log.debug('Ignoring Burned event with input: {}, hash: {}, address: {}', [
      event.transaction.input.toHexString(),
      event.transaction.hash.toHex(),
      event.address.toHexString(),
    ]);
    return;
  }

  let entity = new Burned(event.transaction.hash.toHex() + '-' + event.logIndex.toString());
  entity.account = event.transaction.from;

  // Note: this amount isn't in sUSD for sETH or sBTC issuance prior to Vega
  entity.value = event.params.value;

  let synth = Synth.bind(event.address);
  let currencyKeyTry = synth.try_currencyKey();
  if (!currencyKeyTry.reverted) {
    entity.source = currencyKeyTry.value.toString();
  } else {
    entity.source = 'zUSD';
  }

  // Don't bother getting data pre-Archernar to avoid slowing The Graph down. Can be changed later if needed.
  if (event.block.number > v219UpgradeBlock && entity.source == 'zUSD') {
    let dayId = getTimeID(event.block.timestamp.toI32(), 86400);
    let synthetix = SNX.bind(event.transaction.to as Address);
    let totalIssuedTry = synthetix.try_totalIssuedSynthsExcludeEtherCollateral(zUSD32);

    let dailyBurnedEntity = DailyBurned.load(dayId);
    if (dailyBurnedEntity == null) {
      dailyBurnedEntity = new DailyBurned(dayId);
      dailyBurnedEntity.value = event.params.value;
    } else {
      dailyBurnedEntity.value = dailyBurnedEntity.value + event.params.value;
    }
    dailyBurnedEntity.totalDebt = totalIssuedTry.value;
    dailyBurnedEntity.save();
  }

  entity.timestamp = event.block.timestamp;
  entity.block = event.block.number;
  entity.gasPrice = event.transaction.gasPrice;
  entity.save();

  if (event.block.number > v219UpgradeBlock) {
    trackActiveStakers(event, true);
  }

  // update SNX holder details
  trackSNXHolder(event.transaction.to as Address, event.transaction.from, event.block, event.transaction);
  // update Debt snapshot history
  trackDebt(event);
}

export function handleFeesClaimed(event: FeesClaimedEvent): void {
  let entity = new FeesClaimed(event.transaction.hash.toHex() + '-' + event.logIndex.toString());

  entity.account = event.params.account;
  entity.rewards = event.params.snxRewards;
  if (event.block.number > v219UpgradeBlock) {
    // post Achernar, we had no XDRs, so use the value as sUSD
    entity.value = event.params.zUSDAmount;
  }

  entity.block = event.block.number;
  entity.timestamp = event.block.timestamp;

  entity.save();

  // now update SNXHolder to increment the number of claims
  let snxHolder = SNXHolder.load(entity.account.toHexString());
  if (snxHolder != null) {
    if (snxHolder.claims == null) {
      snxHolder.claims = BigInt.fromI32(0);
    }
    snxHolder.claims = snxHolder.claims.plus(BigInt.fromI32(1));
    snxHolder.save();
  }
}

export function handleBlock(block: ethereum.Block): void {
  if (block.number.mod(BigInt.fromI32(25)).equals(BigInt.fromI32(0))) {
    trackGlobalDebt(block);
  }

}

function trackActiveStakers(event: ethereum.Event, isBurn: boolean): void {
  let account = event.transaction.from;
  let timestamp = event.block.timestamp;
  let snxContract = event.transaction.to as Address;
  let accountDebtBalance = BigInt.fromI32(0);

  if (event.block.number > v219UpgradeBlock) {
    let synthetix = SNX.bind(snxContract);
    accountDebtBalance = synthetix.try_debtBalanceOf(account, zUSD32).value;
  }

  let dayID = timestamp.toI32() / 86400;

  let totalActiveStaker = TotalActiveStaker.load('1');
  let activeStaker = ActiveStaker.load(account.toHex());

  if (totalActiveStaker == null) {
    totalActiveStaker = loadTotalActiveStaker();
  }

  // You are burning and have been counted before as active and have no debt balance
  // we reduce the count from the total and remove the active staker entity
  if (isBurn && activeStaker != null && accountDebtBalance == BigInt.fromI32(0)) {
    totalActiveStaker.count = totalActiveStaker.count.minus(BigInt.fromI32(1));
    totalActiveStaker.save();
    store.remove('ActiveStaker', account.toHex());
    // else if you are minting and have not been accounted for as being active, add one
    // and create a new active staker entity
  } else if (!isBurn && activeStaker == null) {
    activeStaker = new ActiveStaker(account.toHex());
    activeStaker.save();
    totalActiveStaker.count = totalActiveStaker.count.plus(BigInt.fromI32(1));
    totalActiveStaker.save();
  }

  // Once a day we stor the total number of active stakers in an entity that is easy to query for charts
  let totalDailyActiveStaker = TotalDailyActiveStaker.load(dayID.toString());
  if (totalDailyActiveStaker == null) {
    updateTotalDailyActiveStaker(dayID.toString(), totalActiveStaker.count);
  }
}

function loadTotalActiveStaker(): TotalActiveStaker {
  let newActiveStaker = new TotalActiveStaker('1');
  newActiveStaker.count = BigInt.fromI32(0);
  return newActiveStaker;
}

function updateTotalDailyActiveStaker(id: string, count: BigInt): void {
  let newTotalDailyActiveStaker = new TotalDailyActiveStaker(id);
  newTotalDailyActiveStaker.count = count;
  newTotalDailyActiveStaker.save();
}
