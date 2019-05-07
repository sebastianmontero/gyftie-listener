# gyftie-listener

 Uses the dfuse GraphQL API and provides easy access to Gyftie related data. At the moment subscriptions to order book changes, trades and gyft events are available.
 
 Here is an example on how to make use of it:
 
 First create a GyftieListener object, indicating the parameters to connect to the dfuse Endpoint:
 
 ```
  const listener = new GyftieListener({
        apiKey: "your-api-key",
        network: "mainnet",
        endpoint: "mainnet.eos.dfuse.io",
    });
  ```
  
  Call the orderBookChanges on this object, optionally pass in:
  
  1. blockNum: Which indicates the block number from which to start the stream
  2. cursor: To restart from the point of a previous stream session, the cursor value is sent in each payload of the subscription, when using this parameter the blockNum should also be sent.
  
  If no parameter is sent, then the stream starts from the head of the chain.
  
  ```
  const subscription = await listener.orderBookChanges({
            blockNum: "42261484",
        });
```

Use the Observable object returned from the function call to subscribe to the stream.

```
    subscription.subscribe({
        next: data => {
            console.log(data);
        },
        error: error => console.log(error),
    });
 ```
 
 An example payload returned from the stream:
 
 
 ```
 { orderId: '49',
  price: 0.035,
  amount: 600,
  oldAmount: null,
  operationToken: 'GFT',
  counterpartToken: 'EOS',
  orderValue: 21,
  oldOrderValue: null,
  orderType: 'BUY_LIMIT',
  account: 'danielflora3',
  amountChange: 600,
  orderValueChange: 21,
  createdAt: 1549934230,
  tableOperation: 'REM',
  action: 'delbuyorder',
  actionSeq: '5724899971',
  hourOfDay: 21,
  operationTime: '2019-03-22T21:54:03.5Z',
  blockNum: 49015282,
  cursor: '32x4kf3HWXl80D0JYnFju_e7IJ84B19tXQnvIENC0Y2i-XaT3MykAQ==',
  undo: false }
  
  ```
  
  To subscribe to the gyfte exchange trades or gyft events stream oun would call the "trades" or "gyftEvents" methods on the listener object.
  
For trades:
  
  ```
 const subscription = await listener.trades({
            blockNum: "42261484",
        });
  ```
  
Example payload:

```
{ buyer: 'eggandbacon1',
  seller: 'gyftietokens',
  boughtToken: 'GFT',
  priceBought: 2.111,
  boughtAmount: 0.1913785,
  buyOrderType: 'BUY_LIMIT',
  soldToken: 'EOS',
  priceSold: 0.47370914258645186,
  soldAmount: 0.40400001350000003,
  sellOrderType: 'SELL',
  marketMaker: 'eggandbacon1',
  marketMakerFeeInBoughtToken: 0.0019422074846044528,
  marketMakerFeeInSoldToken: 0.0041,
  tradeTime: '2019-04-14T07:11:30Z',
  blockNum: 52881685,
  cursor: 'xTu1Buo732aGRm2cFVf9Ave7IZQwDltpXQ7vIEcU0Yr28CbE3pmnVg==',
  undo: false,
  actionSeq: '6196940835' }

```

For Gyft Events:

```
const subscription = await listener.gyftEvents({
            blockNum: "42261484",
        });
```

Example payload:

```

{ foundationReward: 5,
  liquidityReward: 0,
  eosAccountCreationReimbursement: 0,
  gyfterReward: 4,
  gyfteeReward: 1,
  gyftTime: '2019-03-08T19:26:15Z',
  blockNum: 46580969,
  cursor: 'hoNmSqQAnZ7XtTQxlWDe0_e7IJA9DlpmUwLvIBhB0Y339SPHj5r3CA==',
  undo: false,
  actionSeq: '5470492927',
  gyfter: 'timoandapril',
  gyftee: 'sampatsira12' }


```
