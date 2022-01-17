# Synthetix Subgraph

[![CircleCI](https://circleci.com/gh/Synthetixio/synthetix-subgraph.svg?style=svg)](https://circleci.com/gh/Synthetixio/synthetix-subgraph)

The Graph exposes a GraphQL endpoint to query the events and entities within the Synthetix system.

Synthetix has eleven bundled subgraps, all generated from this one repository:

![image](https://user-images.githubusercontent.com/799038/79390156-32c93080-7f3d-11ea-812a-34ad3543fc28.png)

1. **chainlink**: 查询指定交易对的chainlink 价格，chainlik 合约地址对应
   -- `mainnet`:https://data.chain.link/bsc/mainnet
   -- `testnet`:https://docs.chain.link/docs/binance-smart-chain-addresses
   
2. **exchanger**: 交易对 交易记录 以及 用户指定币种的持币记录



## 运行

For any of the eleven subgraphs: `snx`, `exchanges`, `rates`, `depot`, `loans`, `binary-options` etc... as `[subgraph]`
1. 修改合约地址：`src/contractsData.ts` 中的合约地址
   修改对应 yaml 合约监听地址
1. Run the `npm run codegen:[subgraph]` task to prepare the TypeScript sources for the GraphQL (generated/schema) and the ABIs (generated/[ABI]/\*)
2. [Optional] run the `npm run build:[subgraph]` task for the subgraph
3. Deploy via `npm run deploy:[subgraph]`. Note: requires env variable of `$THEGRAPH_SNX_ACCESS_TOKEN` set in bash to work.

## 返回对象说明

1. chainlink
    ````
     Price:              单线币对价格，只有price
     FiveMinutePrice:    币对5分钟价格K线，包含 synth(币对)、open、high、low、close
     FifteenMinutePrice: 币对15分钟价格K线
     OneHourPrice:       币对60分钟价格K线
     FourHoursPrice:     币对 4h 价格K线
     WeekPrice:          币对 1周 价格K线
     DailyCandle:        币对 1天 价格K线
    ````
2. exchanger
   
   1). 交易记录
   ````
   Transaction
   
   {
     transactions(first:1){
       id
       transactionHash    #交易hash
       account            #操作地址
       fromCurrencyKey    #币对from
       fromAmount         #币对from 数量
       toCurrencyKey      #币对to  
       toAmount           #币对to  数量
       fee                #手续费
       block              #交易区块
       symbol             #币对
       trackingCode
       timstamp           #交易时间
     }
   }
   
   ````
  >Note: 查询指定币对的交易记录 和 指定地址的交易记录 可以通过 `where:{account:'',symbol:''}` 进行查询.
  
  
   2). 钱包地址 持币指定币记录
   ```
   {
     portfolios(first:1){
       account               #持币地址
       timstamp              #记录时间
       amount                #持有币总价值（USD）
       zasset{               #持有币明细
         account              
         currencyKey         #币种
         balance             #币种数量
         usdConvertBalance   #USD等价值
         rate                #币对价格
       }
     }
   }
   
   {
     oneHourPortFolios(first:1){    #最近 1H 持币价值(USD)对比
       account           #持币地址
       timstamp          #最新记录时间
       amount            #最新持币总价值（USD）
       startAmount       # 指定时间前的历史总价值（USD）
     }
   }
    OneDayPortFolios   #最近 7H 持币价值(USD)对比
    WeekPortFolios     #最近 7D 持币价值(USD)对比
    MonthPortFolio     #最近 30D 持币价值(USD)对比
    YearPortFolio      #最近 1Y 持币价值(USD)对比
   ```
  3).查询用户指定时间下某币种的持币情况
  ```
  
{
  zassetBalances(first:100,where:{currencyKey:"zETH",account:"",timstamp_lt:}){
    id
    currencyKey
    balance
    usdConvertBalance
    rate
  }
 
  
}
  ```
   
 