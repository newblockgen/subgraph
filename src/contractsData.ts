// ---------------------
// Chainlink Aggregators
// ---------------------
export let contracts = new Map<string, string>();
contracts.set(
  // zBNB
  '0x137924d7c36816e0dcaf016eb617cc2c92c05782', //合约地址
  '0x7341554400000000000000000000000000000000000000000000000000000000',
);


export const currencies =["zBTC",
  "zETH",
  "zBNB",
  "zADA",
  "zMATIC",
  "zDOGE",
  "zDOT",
  "zSOL",
  "zXRP",
  "zCAKE",
  "zLINK",
  "zXLM",
  "zCOMP",
  "zXAU",
  "zXAG",
  "zWTI",
  "zEUR",
  "zJPY",
  "zGBP",
  "zAUD",
  "zSPY",
  "zQQQ",
  "zARKK",
  "zGOOGL",
  "zAAPL",
  "zTSLA",
  "zCOIN",
  "zAMZN",
  "zFB",
  "zMRNA",
  "zNFLX",
  "zNVDA",
  "zPFE"];

export let chainlinkContracts = new Map<string,string>();
//chainlink 交易对 合约地址 正式链
chainlinkContracts.set("zBTC","0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf");
chainlinkContracts.set("zETH","0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e");
chainlinkContracts.set("zBNB","0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE");
chainlinkContracts.set("zADA","0xa767f745331D267c7751297D982b050c93985627");
chainlinkContracts.set("zMATIC","0x7CA57b0cA6367191c94C8914d7Df09A57655905f");
chainlinkContracts.set("zDOGE","0x3AB0A0d137D4F946fBB19eecc6e92E64660231C8");
chainlinkContracts.set("zDOT","0xC333eb0086309a16aa7c8308DfD32c8BBA0a2592");
chainlinkContracts.set("zSOL","0x0E8a53DD9c13589df6382F13dA6B3Ec8F919B323");
chainlinkContracts.set("zXRP","0x93A67D414896A280bF8FFB3b389fE3686E014fda");
chainlinkContracts.set("zCAKE","0xB6064eD41d4f67e353768aA239cA86f4F73665a1");
chainlinkContracts.set("zLINK","0xca236E327F629f9Fc2c30A4E95775EbF0B89fac8");
chainlinkContracts.set("zXLM","0x27Cc356A5891A3Fe6f84D0457dE4d108C6078888");
chainlinkContracts.set("zCOMP","0x0Db8945f9aEf5651fa5bd52314C5aAe78DfDe540");
chainlinkContracts.set("zXAU","0x86896fEB19D8A607c3b11f2aF50A0f239Bd71CD0");
chainlinkContracts.set("zXAG","0x817326922c909b16944817c207562B25C4dF16aD");
chainlinkContracts.set("zWTI","0xb1BED6C1fC1adE2A975F54F24851c7F410e27718");
chainlinkContracts.set("zEUR","0x0bf79F617988C472DcA68ff41eFe1338955b9A80");
chainlinkContracts.set("zJPY","0x22Db8397a6E77E41471dE256a7803829fDC8bC57");
chainlinkContracts.set("zGBP","0x8FAf16F710003E538189334541F5D4a391Da46a0");
chainlinkContracts.set("zAUD","0x498F912B09B5dF618c77fcC9E8DA503304Df92bF");
chainlinkContracts.set("zSPY","0xb24D1DeE5F9a3f761D286B56d2bC44CE1D02DF7e");
chainlinkContracts.set("zQQQ","0x9A41B56b2c24683E2f23BdE15c14BC7c4a58c3c4");
chainlinkContracts.set("zARKK","0x234c7a1da64Bdf44E1B8A25C94af53ff2A199dE0");
chainlinkContracts.set("zGOOGL","0xeDA73F8acb669274B15A977Cb0cdA57a84F18c2a");
chainlinkContracts.set("zAAPL","0xb7Ed5bE7977d61E83534230f3256C021e0fae0B6");
chainlinkContracts.set("zTSLA","0xEEA2ae9c074E87596A85ABE698B2Afebc9B57893");
chainlinkContracts.set("zCOIN","0x2d1AB79D059e21aE519d88F978cAF39d74E31AEB");
chainlinkContracts.set("zAMZN","0x51d08ca89d3e8c12535BA8AEd33cDf2557ab5b2a");
chainlinkContracts.set("zFB","0xfc76E9445952A3C31369dFd26edfdfb9713DF5Bb");
chainlinkContracts.set("zMRNA","0x6101F4DFBb24Cac3D64e28A815255B428b93639f");
chainlinkContracts.set("zNFLX","0x1fE6c9Bd9B29e5810c2819f37dDa8559739ebeC9");
chainlinkContracts.set("zNVDA","0xea5c2Cbb5cD57daC24E26180b19a929F3E9699B8");
chainlinkContracts.set("zPFE","0xe96fFdE2ba50E0e869520475ee1bC73cA2dEE326");

export let synthetixCurrencies = new Map<string,string>();

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
