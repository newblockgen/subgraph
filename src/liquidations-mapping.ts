import { Synthetix32 } from '../generated/Liquidations/Synthetix32';

import { AddressResolver } from '../generated/Liquidations/AddressResolver';

import {
  AccountFlaggedForLiquidation as AccountFlaggedForLiquidationEvent,
  AccountRemovedFromLiquidation as AccountRemovedFromLiquidationEvent,
  Liquidations,
} from '../generated/Liquidations/Liquidations';

import { AccountLiquidated as AccountLiquidatedEvent } from '../generated/Synthetix_proxy/Synthetix';

import { AccountFlaggedForLiquidation, AccountRemovedFromLiquidation, AccountLiquidated } from '../generated/schema';

import { strToBytes } from './common';

export function handleAccountFlaggedForLiquidation(event: AccountFlaggedForLiquidationEvent): void {
  let liquidationsContract = Liquidations.bind(event.address);
  let resolver = AddressResolver.bind(liquidationsContract.resolver());
  let synthetix = Synthetix32.bind(resolver.getAddress(strToBytes('Synthetix', 32)));
  let accountFlaggedForLiquidation = new AccountFlaggedForLiquidation(
    event.params.deadline.toString() + '-' + event.params.account.toHex(),
  );
  accountFlaggedForLiquidation.account = event.params.account;
  accountFlaggedForLiquidation.deadline = event.params.deadline;
  accountFlaggedForLiquidation.collateralRatio = synthetix.collateralisationRatio(event.params.account);
  accountFlaggedForLiquidation.collateral = synthetix.collateral(event.params.account);
  accountFlaggedForLiquidation.liquidatableNonEscrowSNX = synthetix.balanceOf(event.params.account);
  accountFlaggedForLiquidation.save();
}

export function handleAccountRemovedFromLiquidation(event: AccountRemovedFromLiquidationEvent): void {
  let accountRemovedFromLiquidation = new AccountRemovedFromLiquidation(
    event.params.time.toString() + '-' + event.params.account.toHex(),
  );
  accountRemovedFromLiquidation.account = event.params.account;
  accountRemovedFromLiquidation.time = event.params.time;
  accountRemovedFromLiquidation.save();
}

export function handleAccountLiquidated(event: AccountLiquidatedEvent): void {
  let entity = new AccountLiquidated(event.transaction.hash.toHex() + '-' + event.logIndex.toString());

  entity.account = event.params.account;
  entity.hznRedeemed = event.params.hznRedeemed;
  entity.amountLiquidated = event.params.amountLiquidated;
  entity.liquidator = event.params.liquidator;
  entity.time = event.block.timestamp;

  entity.save();
}
