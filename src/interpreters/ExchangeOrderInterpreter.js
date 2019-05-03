const { EOSUtil, DBOps } = require('@smontero/eos-listener-gql');
const { OrderTypes } = require('../const');
const { TimeUtil } = require('../util');

const BUY_TABLE = "gftorderbook/buyorders";
const SELL_TABLE = "gftorderbook/sellorders";

class ExchangeOrderInterpreter {

    interpret(data, includeMarketOps = false) {

        const { actionData: { name: action, seq: actionSeq, dbOps, json: actionData }, blockTime: operationTime, blockNum, cursor, undo } = data;
        /* console.log('action: ', action);
        console.log('dbOps: ', JSON.stringify(dbOps)); */

        let orders = [];

        const operationTimeDate = new Date(operationTime);

        let extraFields = {
            action,
            actionSeq,
            hourOfDay: operationTimeDate.getUTCHours(),
            operationTime,
            blockNum,
            cursor,
            undo,
        };

        let pDBOps = this.processDBOps(BUY_TABLE, dbOps[BUY_TABLE], extraFields);
        pDBOps = pDBOps.concat(
            this.processDBOps(SELL_TABLE, dbOps[SELL_TABLE], extraFields)
        );
        pDBOps = this.orderByType(pDBOps);

        /* console.log('processedDBOps: ', JSON.stringify(pDBOps)); */

        if (includeMarketOps && (action == 'marketsell' || action == 'marketbuy')) {
            let {
                totalAmount,
                totalOrderValue,
                avgPrice,
            } = this.getMarketOpStats(pDBOps);

            let account, amount, amountAsset, orderValue, orderValueAsset, orderType,
                remainingAmount, remainingOrderValue;

            if (action == 'marketsell') {
                ({ seller: account, gft_amount: amountAsset } = actionData);
                ({ amount } = EOSUtil.parseAsset(amountAsset));
                orderType = OrderTypes.SELL;
                if (totalAmount >= amount) {
                    orderValue = totalOrderValue;
                    remainingAmount = 0;
                    remainingOrderValue = 0;
                } else {
                    orderValue = amount * avgPrice;
                    remainingAmount = amount - totalAmount;
                    remainingOrderValue = orderValue - totalOrderValue;
                }
            } else {
                ({ buyer: account, eos_amount: orderValueAsset } = actionData);
                ({ amount: orderValue } = EOSUtil.parseAsset(orderValueAsset));
                orderType = OrderTypes.BUY;
                if (totalOrderValue >= orderValue) {
                    amount = totalAmount;
                    remainingAmount = 0;
                    remainingOrderValue = 0;
                } else {
                    amount = orderValue / avgPrice;
                    remainingAmount = amount - totalAmount;
                    remainingOrderValue = orderValue - totalOrderValue;
                }
            }
            orders.push({
                orderId: operationTimeDate.getTime(),
                price: avgPrice,
                amount,
                oldAmount: null,
                operationToken: Tokens.GFT,
                counterpartToken: Tokens.EOS,
                orderValue,
                oldOrderValue: null,
                orderType,
                account,
                remainingAmount,
                remainingOrderValue,
                tableOperation: DBOps.INSERT,
                createdAt: TimeUtil.toUnixTimestamp(operationTimeDate),
                ...extraFields
            });
        }

        for (const pDBOp of pDBOps) {
            orders.push(pDBOp);
        }
        return orders;
    }

    orderByType(pDBOps) {
        let inserts = [],
            updates = [],
            deletes = [];

        for (let pDBOp of pDBOps) {
            switch (pDBOp.tableOperation.toLowerCase()) {
                case DBOps.INSERT:
                    inserts.push(pDBOp);
                    break;
                case DBOps.UPDATE:
                    updates.push(pDBOp);
                    break;
                case DBOps.REMOVE:
                    deletes.push(pDBOp);
                    break;
            }
        }
        return inserts.concat(updates).concat(deletes);
    }

    getMarketOpStats(pDBOps) {
        let totalOrderValue = 0,
            totalAmount = 0;
        for (let pDBOp of pDBOps) {
            const { amountChange, orderValueChange } = pDBOp;
            totalOrderValue += orderValueChange;
            totalAmount += amountChange;
        }
        return {
            totalAmount,
            totalOrderValue,
            avgPrice: totalAmount > 0 ? totalOrderValue / totalAmount : 0,
        };
    }

    processDBOps(table, dbOps, extraFields) {
        let processed = [];
        dbOps = dbOps || [];
        extraFields = extraFields || {};
        for (let dbOp of dbOps) {
            let result = this.processDBOp(table, dbOp);
            /* console.log('pDBOp:', result); */
            processed.push({
                ...result,
                ...extraFields
            });
        }
        return processed;
    }

    processDBOp(table, dbOp) {
        const { operation, oldData, newData } = dbOp;

        let result = this.processDBData(table, oldData, newData);
        result.tableOperation = operation;
        return result;
    }

    processDBData(table, oldData, newData) {

        const data = newData || oldData;
        const {
            order_id: orderId,
            price_per_gft: priceAsset,
            gft_amount: amountAsset,
            order_value: orderValueAsset,
            created_date: createdAt,
        } = data;

        let orderType, account;
        if (table == BUY_TABLE) {
            orderType = OrderTypes.BUY_LIMIT;
            account = data.buyer;
        } else {
            orderType = OrderTypes.SELL_LIMIT;
            account = data.seller;
        }

        let { amount: price } = EOSUtil.parseAsset(priceAsset);
        let { amount, symbol: operationToken } = EOSUtil.parseAsset(amountAsset);
        let { amount: orderValue, symbol: counterpartToken } = EOSUtil.parseAsset(orderValueAsset);

        let amountChange = 0,
            orderValueChange = 0,
            oldAmount = null,
            oldOrderValue = null;
        if (oldData && newData) {
            const {
                gft_amount: oldAmountAsset,
                order_value: oldOrderValueAsset,
            } = oldData;
            ({ amount: oldAmount } = EOSUtil.parseAsset(oldAmountAsset));
            ({ amount: oldOrderValue } = EOSUtil.parseAsset(oldOrderValueAsset));
            amountChange = oldAmount - amount;
            orderValueChange = oldOrderValue - orderValue;
        } else if (oldData) {
            amountChange = amount;
            orderValueChange = orderValue;
        }

        return {
            orderId,
            price,
            amount,
            oldAmount,
            operationToken,
            counterpartToken,
            orderValue,
            oldOrderValue,
            orderType,
            account,
            amountChange,
            orderValueChange,
            createdAt,
        };
    }
}

module.exports = ExchangeOrderInterpreter;