const { EOSUtil } = require('@smontero/eos-listener-gql');
const { OrderTypes } = require('../const');

class ExchangeTradeInterpreter {

    interpret(data) {
        const {
            actionData: {
                json: {
                    buyer,
                    seller,
                    market_maker: marketMaker,
                    gft_amount: amount,
                    price,
                    maker_reward: makerReward
                },
                creatorAction: {
                    name: creatorAction
                }
            },
            blockTime: tradeTime,
            blockNum,
            cursor,
            undo
        } = data;
        let buyOrderType, sellOrderType;

        if (creatorAction == "marketsell") {
            buyOrderType = OrderTypes.BUY_LIMIT;
            sellOrderType = OrderTypes.SELL;
        } else if (creatorAction == "marketbuy") {
            buyOrderType = OrderTypes.BUY;
            sellOrderType = OrderTypes.SELL_LIMIT;
        } else {
            buyOrderType = OrderTypes.BUY_LIMIT;
            sellOrderType = OrderTypes.SELL_LIMIT;
        }

        let { amount: amountQty, symbol: amountTkn } = EOSUtil.parseAsset(amount);
        let { amount: priceQty, symbol: priceTkn } = EOSUtil.parseAsset(price);
        let { amount: marketMakerFee, symbol: marketMakerFeeToken } = EOSUtil.parseAsset(makerReward);

        let boughtToken = amountTkn,
            priceBought = priceQty,
            soldToken = priceTkn,
            priceSold = 1 / priceBought;

        let marketMakerFeeInBoughtToken, marketMakerFeeInSoldToken;

        if (marketMakerFeeToken == boughtToken) {
            marketMakerFeeInBoughtToken = marketMakerFee;
            marketMakerFeeInSoldToken = marketMakerFee * priceBought;
        } else {
            marketMakerFeeInSoldToken = marketMakerFee;
            marketMakerFeeInBoughtToken = marketMakerFee * priceSold;
        }

        return {
            buyer,
            seller,
            boughtToken,
            priceBought,
            boughtAmount: amountQty,
            buyOrderType,
            soldToken,
            priceSold,
            soldAmount: amountQty * priceQty,
            sellOrderType,
            marketMaker,
            marketMakerFeeInBoughtToken,
            marketMakerFeeInSoldToken,
            tradeTime,
            blockNum,
            cursor,
            undo
        };
    }
}

module.exports = ExchangeTradeInterpreter;