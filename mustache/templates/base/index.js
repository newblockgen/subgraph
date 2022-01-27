module.exports = {
  yaml: [
    {
      specVersion: '0.0.2',
      repository: 'https://github.com/Synthetixio/synthetix-subgraph',
      dataSourceKind: 'ethereum/contract',
      network: 'bsctest',
      mapping: {
        kind: 'ethereum/events',
        version: '0.0.5',
        language: 'wasm/assemblyscript',
      },
    },
  ],
};

