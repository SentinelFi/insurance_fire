import { xdr, Address } from "@stellar/stellar-sdk";

export class converter {
  static toString(value: string): xdr.ScVal {
    return xdr.ScVal.scvString(value);
  }

  static toSymbol(value: string): xdr.ScVal {
    return xdr.ScVal.scvSymbol(value);
  }

  static toBytes(value: Buffer): xdr.ScVal {
    return xdr.ScVal.scvBytes(value);
  }

  static toAddress(value: Address): xdr.ScVal {
    const addressXdr = value.toScAddress();
    return xdr.ScVal.scvAddress(addressXdr);
  }

  static stringToAddress(publicKey: string): xdr.ScVal {
    const address = Address.fromString(publicKey);
    return this.toAddress(address);
  }

  static toBool(value: boolean): xdr.ScVal {
    return xdr.ScVal.scvBool(value);
  }

  static toU32(value: number): xdr.ScVal {
    return xdr.ScVal.scvU32(value);
  }

  static toI32(value: number): xdr.ScVal {
    return xdr.ScVal.scvI32(value);
  }

  static toU64(value: bigint): xdr.ScVal {
    return xdr.ScVal.scvU64(new xdr.Uint64(BigInt.asUintN(64, value)));
  }

  static toI64(value: bigint): xdr.ScVal {
    return xdr.ScVal.scvI64(new xdr.Int64(value));
  }

  // https://github.com/stellar/js-stellar-base/blob/master/src/numbers/xdr_large_int.js

  static toU128(value: bigint): xdr.ScVal {
    return xdr.ScVal.scvU128(
      new xdr.UInt128Parts({
        hi: new xdr.Uint64(BigInt.asUintN(64, value >> BigInt(64))),
        lo: new xdr.Uint64(BigInt.asUintN(64, value)),
      })
    );
  }

  static toI128(value: bigint): xdr.ScVal {
    const hi64 = BigInt.asIntN(64, value >> BigInt(64));
    const lo64 = BigInt.asUintN(64, value);
    return xdr.ScVal.scvI128(
      new xdr.Int128Parts({
        hi: new xdr.Int64(hi64),
        lo: new xdr.Uint64(lo64),
      })
    );
  }

  static toMap(entries: xdr.ScMapEntry[]): xdr.ScVal {
    return xdr.ScVal.scvMap(entries);
  }

  static stringNumberMapToMap(map: Map<number, string>): xdr.ScVal {
    const entries: xdr.ScMapEntry[] = Array.from(map.entries()).map(
      ([key, value]) =>
        new xdr.ScMapEntry({ key: this.toU32(key), val: this.toString(value) })
    );
    return this.toMap(entries);
  }

  static toVec(values: xdr.ScVal[]): xdr.ScVal {
    return xdr.ScVal.scvVec(values);
  }

  static toStringsVec(entries: string[]): xdr.ScVal {
    const array = entries.map((e) => this.toString(e));
    return this.toVec(array);
  }

  static toVoid(): xdr.ScVal {
    return xdr.ScVal.scvVoid();
  }
}
