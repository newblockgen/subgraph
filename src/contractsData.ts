// ---------------------
// Chainlink Aggregators
// ---------------------
export let contracts = new Map<string, string>();
contracts.set(
  // zBNB
  '0x137924d7c36816e0dcaf016eb617cc2c92c05782', //合约地址
  '0x7341554400000000000000000000000000000000000000000000000000000000',
);


export const currencies =["zBNB","iBNB","zBTC","iBTC","zETH"];

export let chainlinkContracts = new Map<string,string>();
//chainlink 交易对 合约地址 正式链
/*chainlinkContracts.set("zBTC","0x264990fbd0a4796a3e3d8e37c4d5f87a3aca5ebf"); //BTC
chainlinkContracts.set("iBTC","0x264990fbd0a4796a3e3d8e37c4d5f87a3aca5ebf"); //BTC
chainlinkContracts.set("zBNB","0x0567f2323251f0aab15c8dfb1967e4e8a7d42aee"); //BNB
chainlinkContracts.set("iBNB","0x0567f2323251f0aab15c8dfb1967e4e8a7d42aee"); //BNB
chainlinkContracts.set("zETH","0x9ef1b8c0e4f7dc8bf5719ea496883dc6401d5b2e"); //zETH*/
//测试链
chainlinkContracts.set("zBTC","0x1a602D4928faF0A153A520f58B332f9CAFF320f7"); //BTC
chainlinkContracts.set("iBTC","0x1a602D4928faF0A153A520f58B332f9CAFF320f7"); //BTC
chainlinkContracts.set("zBNB","0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526"); //BNB
chainlinkContracts.set("iBNB","0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526"); //BNB
chainlinkContracts.set("zETH","0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7"); //zETH


export let synthetixCurrencies = new Map<string,string>();
synthetixCurrencies.set("zBNB","0x68861320b1DE9E21276E572bD0998ca04138291a");
synthetixCurrencies.set("iBNB","0x1D6F7EBF8411aa2d74b6385909Aa2a83360A7245");
synthetixCurrencies.set("zBTC","0xf7e760C95e17119aedac823d12fD60777ba2960B");
synthetixCurrencies.set("iBTC","0xc486d2B7150E2AD06ac8416de17158c8ED79c781");
synthetixCurrencies.set("zETH","0xc9311C9736449d659bBBdA9ad92e6A71099267B4");