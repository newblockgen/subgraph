// ---------------------
// Chainlink Aggregators
// ---------------------
export let contracts = new Map<string, string>();
contracts.set(
  // zBNB
  '0x137924d7c36816e0dcaf016eb617cc2c92c05782', //合约地址
  '0x7341554400000000000000000000000000000000000000000000000000000000',
);


export const currencies =["zADA","zBNB","zBTC","zCAKE","zDOGE","zDOT","zETH","zLINK","zMATIC","zXRP","zUSD"];

export let chainlinkContracts = new Map<string,string>();
//chainlink 交易对 合约地址 正式链
/*chainlinkContracts.set("zBTC","0x264990fbd0a4796a3e3d8e37c4d5f87a3aca5ebf"); //BTC
chainlinkContracts.set("iBTC","0x264990fbd0a4796a3e3d8e37c4d5f87a3aca5ebf"); //BTC
chainlinkContracts.set("zBNB","0x0567f2323251f0aab15c8dfb1967e4e8a7d42aee"); //BNB
chainlinkContracts.set("iBNB","0x0567f2323251f0aab15c8dfb1967e4e8a7d42aee"); //BNB
chainlinkContracts.set("zETH","0x9ef1b8c0e4f7dc8bf5719ea496883dc6401d5b2e"); //zETH*/
//测试链
chainlinkContracts.set("zADA","0x5e66a1775BbC249b5D51C13d29245522582E671C"); //BTC
chainlinkContracts.set("zBNB","0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526"); //BNB
chainlinkContracts.set("zBTC","0x5741306c21795FdCBb9b265Ea0255F499DFe515C"); //BNB
chainlinkContracts.set("zCAKE","0x81faeDDfeBc2F8Ac524327d70Cf913001732224C"); //zETH
chainlinkContracts.set("zDOGE","0x963D5e7f285Cc84ed566C486c3c1bC911291be38"); //BTC
chainlinkContracts.set("zDOT","0xEA8731FD0685DB8AeAde9EcAE90C4fdf1d8164ed"); //BTC
chainlinkContracts.set("zETH","0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7"); //BNB
chainlinkContracts.set("zLINK","0x1B329402Cb1825C6F30A0d92aB9E2862BE47333f"); //BNB
chainlinkContracts.set("zMATIC","0x957Eb0316f02ba4a9De3D308742eefd44a3c1719"); //zETH
chainlinkContracts.set("zXRP","0x4046332373C24Aed1dC8bAd489A04E187833B28d"); //zETH
chainlinkContracts.set("zUSD","0x42c104EC42713466C04ecC83DB64587EbC03a345"); //zETH

export let synthetixCurrencies = new Map<string,string>();
/*synthetixCurrencies.set("zBNB","0x68861320b1DE9E21276E572bD0998ca04138291a");
synthetixCurrencies.set("iBNB","0x1D6F7EBF8411aa2d74b6385909Aa2a83360A7245");
synthetixCurrencies.set("zBTC","0xf7e760C95e17119aedac823d12fD60777ba2960B");
synthetixCurrencies.set("iBTC","0xc486d2B7150E2AD06ac8416de17158c8ED79c781");
synthetixCurrencies.set("zETH","0xc9311C9736449d659bBBdA9ad92e6A71099267B4");*/

// synthetixCurrencies.set("HZN","0xE7C79a9e5Dd67f237323523f573a3359542fa7C4");
synthetixCurrencies.set("zADA","0x960CaeB681EE37fB259B6caBB1b6BD075421C4ca");
synthetixCurrencies.set("zBNB","0x62641D0Cb18fC2751A0a478BfaE635BFF5ACA508");
synthetixCurrencies.set("zBTC","0x1b9357580Bd8b939A1c1685953F18f9C22eA15fC");
synthetixCurrencies.set("zETH","0x67E49A3F4F19A3A6a7E46f4264Aa176068eDbECF");
synthetixCurrencies.set("zDOT","0x7ea660B5FbEc26c3A74f598384bC6397Fe1A3005");
synthetixCurrencies.set("zLINK","0xEA4add20BDA400d20B301028C5da82DF10B32983");
synthetixCurrencies.set("zMATIC","0x90CF193bD9c236d9b0D425C35b407a24E21C058E");
synthetixCurrencies.set("zXRP","0xef1bc2A008aA9e45808a049c53560c7fBC447d57");
synthetixCurrencies.set("zCAKE","0xa40644645Fe97963C7eDE6B8FB2049b5177D590f");
synthetixCurrencies.set("zDOGE","0xeE025E221c0f72A3356fF8580E6A3d53F63BB1AD");
synthetixCurrencies.set("zUSD","0x42c104EC42713466C04ecC83DB64587EbC03a345"); //zETH
