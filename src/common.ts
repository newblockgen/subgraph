import { BigDecimal, BigInt, Bytes, ByteArray ,} from '@graphprotocol/graph-ts';

// import { Synthetix32 as SNX } from '../generated/Synthetix/Synthetix32';

export let ZERO = BigInt.fromI32(0);
export let ONE = BigInt.fromI32(1);


export function strToBytes(str: string, length: i32 = 32): Bytes {
  return Bytes.fromByteArray(Bytes.fromUTF8(str));
}

