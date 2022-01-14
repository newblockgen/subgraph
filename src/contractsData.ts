// ---------------------
// Chainlink Aggregators
// ---------------------
export let contracts = new Map<string, string>();
contracts.set(
  // zBNB
  '0x137924d7c36816e0dcaf016eb617cc2c92c05782', //合约地址
  '0x7341554400000000000000000000000000000000000000000000000000000000',
);

export let chainlinkContracts = new Array<string>();
//chainlink 交易对 合约地址
chainlinkContracts.push("0x0567f2323251f0aab15c8dfb1967e4e8a7d42aee"); //BTC

export let synthetixCurrencies = new Map<string,string>();
export const currencies =["zBNB","iBNB","zBTC","iBTC","zETH"];

synthetixCurrencies.set("zBNB","0x68861320b1DE9E21276E572bD0998ca04138291a");
synthetixCurrencies.set("iBNB","0x1D6F7EBF8411aa2d74b6385909Aa2a83360A7245");
synthetixCurrencies.set("zBTC","0xf7e760C95e17119aedac823d12fD60777ba2960B");
synthetixCurrencies.set("iBTC","0xc486d2B7150E2AD06ac8416de17158c8ED79c781");
synthetixCurrencies.set("zETH","0xc9311C9736449d659bBBdA9ad92e6A71099267B4");