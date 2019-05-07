const { EOSUtil } = require('@smontero/eos-listener-gql');
const { GyftieAccounts, TransferTypes } = require('../const');

class GyftEventInterpreter {

    interpret(data) {

        const {
            matchingActions,
            queryResults: {
                transfers: transferTraces
            },
            blockTime: transferTime,
            blockNum,
            cursor,
            undo
        } = data;

        let transfers = [];
        let gyft = {
            foundationReward: 0,
            liquidityReward: 0,
            eosAccountCreationReimbursement: 0,
            gyfterReward: 0,
            gyfteeReward: 0,
            gyftTime: transferTime,
            blockNum,
            cursor,
            undo,
            actionSeq: matchingActions[0].seq,
        };

        for (let transferTrace of transferTraces) {
            const { seq: actionSeq, json: { from, to, quantity: quantityAsset, memo } } = transferTrace;
            let lcMemo = memo.toLowerCase();
            let transferType = null;
            let { amount: quantity, symbol: quantitySymbol } = EOSUtil.parseAsset(quantityAsset);
            if (to == GyftieAccounts.FOUNDATION) {
                transferType = TransferTypes.GYFT_EVENT;
                gyft.foundationReward = quantity;
            } else if (to == GyftieAccounts.ORDER_BOOK) {
                if (lcMemo.indexOf('liquidity') != -1) {
                    transferType = TransferTypes.LIQUIDITY_REWARD;
                    gyft.liquidityReward = quantity;
                } else if (lcMemo.indexOf('reimbursement') != -1) {
                    transferType = TransferTypes.EOS_ACCOUNT_CREATION_REIMBURSEMENT;
                    gyft.eosAccountCreationReimbursement = quantity;
                }
            } else {
                if (lcMemo.indexOf('gyfter') != -1) {
                    transferType = TransferTypes.GYFTER;
                    gyft.gyfter = to;
                    gyft.gyfterReward = quantity;
                } else /* if (lcMemo.indexOf('new') != -1) */ {
                    transferType = TransferTypes.GYFTEE;
                    gyft.gyftee = to;
                    gyft.gyfteeReward = quantity;
                }
            }
            transfers.push({
                from,
                to,
                quantity,
                quantitySymbol,
                transferType,
                transferTime,
                blockNum,
                cursor,
                undo,
                actionSeq,
            });
        }
        for (let transfer of transfers) {
            transfer.gyfter = gyft.gyfter;
        }
        return {
            transfers,
            gyft,
        };
    }
}

module.exports = GyftEventInterpreter;