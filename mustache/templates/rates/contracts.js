const duplicateRateBlocks = {
  one: 9769220,
};

// NOTE at times we use different start blocks for the rates used in the exchanger yaml
// file to improve sync times; these rates are grouped into six different blocks.
// New contracts that are added will not need different start blocks for the exchanger yaml.
const exchangerBlocks = {
  RatesBlockOne: {
    prod: 9769220,
    test: null,
  },
};

module.exports = [
  {
    prod: duplicateRateBlocks.one,
    test: null,
    exchanger: exchangerBlocks.RatesBlockOne,
    name: 'ExchangeRates',
    address: "'0xaA739aE0d752b290F935b0807Ca2BB89A3A276EA'",
    abiPath: '../abis/ExchangeRates.json',
    type: 'bytes32',
  },
  {
    prod: 9769220,
    test: null,
    exchanger: exchangerBlocks.RatesBlockOne,
    name: 'AggregatorBNB',
    address: "'0x137924d7c36816e0dcaf016eb617cc2c92c05782'",
    proxyAddress: "'0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE'",
    type: 'aggregator',
  },
  {
    //prod: 9543789,
    prod: 9769220,
    test: null,
    exchanger: exchangerBlocks.RatesBlockOne,
    name: 'AggregatorHZN',
    address: "'0x8D9a3c662f5cAD6F0221a0C1760875350bb1c279'",
    proxyAddress: "'0x5cdC928307CeEe1d2DE35fe61e86b5ff438D43d3'",
    type: 'aggregator',
  },
];

