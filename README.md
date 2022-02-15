# Synthetix Subgraph

[![CircleCI](https://circleci.com/gh/Synthetixio/synthetix-subgraph.svg?style=svg)](https://circleci.com/gh/Synthetixio/synthetix-subgraph)

The Graph exposes a GraphQL endpoint to query the events and entities within the Synthetix system.

Synthetix has eleven bundled subgraps, all generated from this one repository:

![image](https://user-images.githubusercontent.com/799038/79390156-32c93080-7f3d-11ea-812a-34ad3543fc28.png)

1. **chainlink**: 查询指定交易对的chainlink 价格，chainlik 合约地址对应
   -- `mainnet`:https://data.chain.link/bsc/mainnet
   -- `testnet`:https://docs.chain.link/docs/binance-smart-chain-addresses
   -- Deployed to:http://119.8.19.36:8000/subgraphs/name/allenhyfay/sugmrms/graphql
   
2. **exchanger**: 交易对 交易记录 以及 用户指定币种的持币记录
   bsc testnet :
   -- Deployed to http://42.192.186.62:8000/subgraphs/name/synthetixio-team/synthetix/graphql
   -- Queries (HTTP):     http://42.192.186.62:8000/subgraphs/name/synthetixio-team/synthetix
   -- Subscriptions (WS): http://42.192.186.62:8001/subgraphs/name/synthetixio-team/synthetix


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



3、zsset币种

 
  1).交易量
  ```
     zssetTradingVolFiveMinutes{  #五分钟交易量
       id
       currencyKey          #币种
       startAmount          #开始时交易量
       finalAmount          #五分钟内交易量
       tradingTimes         #交易次数
       fee                  #消耗的手续费（交易时消耗的自身币种）
       timstamp             
     }
     zssetTradingVolFifteenMinutes # 15分钟币种交易量
     zssetTradingVolOneHours       # 1h 
     zssetTradingVolFourHours      # 4h
     zssetTradingVolOneDays        # 1d
     zssetTradingVolWeekly         # 1w
  ```
  
  
 2).币种排名
      每个币种只有一条数据, 对应字段的排序需 调用者自行处理 exchanger
   ```
   {  
     coinIncreases{ 
        id        
        synth                 #币种
        volume                #24h 交易量
        fee                   #24H 手续费
      }
   }
   ```
   币种的24小时排序移动到chainlink 获取价格的接口中
   ````
     {  
        coinIncreases{ 
           id        
           synth                 #币种
           price                 #最新价格
           bPrice                #24h前价格
           increase              # 价格涨幅
           timestamp             # 更新时间
           high                  #24H 最高价
           low                   #24H 最低价
           marketVal             #市值（USD）[发行量 * 当前价格]
         }
      }
   ````
