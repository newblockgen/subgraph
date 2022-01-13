
const Contracts = require('./contracts');
const { createStartBlock } = require('../common');

// TODO - If Synthetix ran any aggregators that were not provided by
// Chainlink we need to add their names here to filter them out.
const SYNTHETIX_AGGREGATOR_NAMES = [];

module.exports = {
  createYaml: (env, universalTestBlock) => {
    const createAggregatorBlock = ({ name, startBlocks, address }) => ({
      name,
      mappingFile: '../src/chainlink-mapping.ts',
      startBlock: createStartBlock(startBlocks, env, universalTestBlock, false),
      address,
      abi: 'Contract',
      entities: ['ResponseReceived','OwnershipRenounced','OwnershipTransferred','ChainlinkRequested','ChainlinkFulfilled' ,
      'ChainlinkCancelled','AnswerUpdated','NewRound'],
      abis: [
        {
          name: 'Contract',
          path: '../abis/Contract.json',
        }
      ],
   /*    events: [
        {
          event: 'AnswerUpdated(indexed int256,indexed uint256,uint256)',
          handler: 'handleAggregatorAnswerUpdated',
        },
      ], */
      blockHandlers:[
          {
            handler: 'handleBlock'
          }
        ]
    });

    // note that the filter here will have to be changed and this section updated
    // as chainlink adds new contract types

    return Contracts.map(({ prod, test, type, name, address }) => {
      const startBlocks = { prod, test, exchanger: null };
        return createAggregatorBlock({ startBlocks, name, address });
    });
  },
};
