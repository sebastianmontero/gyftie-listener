const { ActionTraceKeys } = require('./const');

class ActionTraceFactory {

    static getActionTrace(actionTraceKey, extraProps) {
        return {
            ...this._getBaseProps(actionTraceKey),
            ...extraProps,
        };
    }

    static _getBaseProps(actionTraceKey) {
        switch (actionTraceKey) {
            case ActionTraceKeys.ORDER_BOOK_CHANGES:
                return {
                    query: "receiver:gftorderbook account:gftorderbook (action:marketsell OR action:marketbuy OR db.table:buyorders OR db.table:sellorders)",
                    dbOps: [{
                        account: "gftorderbook",
                        table: "buyorders",
                        type: "buyorder"
                    },
                    {
                        account: "gftorderbook",
                        table: "sellorders",
                        type: "sellorder"
                    }],
                    serialized: true,
                };
            case ActionTraceKeys.TRADES:
                return {
                    query: "receiver:gftorderbook account:gftorderbook action:tradeexec",
                    matchingActionsData: `
                        seq
                        receiver
                        account
                        name
                        json
                        creatorAction {
                          name
                        }
                    `,
                    serialized: true,
                };
            case ActionTraceKeys.GYFT_EVENTS:
                return {
                    query: "receiver:gyftietokens account:gyftietokens (action:gyft OR action:gyft2)",
                    executedActionsData: `
                        seq
                        receiver
                        account
                        name
                        json
                        creatorAction {
                            seq
                            receiver
                            account
                            name
                        }
                    `,
                    searches: {
                        transfers: {
                            listName: 'executedActions',
                            search: {
                                receiver: "gyftietokens",
                                account: "gyftietokens",
                                name: 'transfer',
                                creatorAction: {
                                    name: ['issue', 'issuetostake']
                                }
                            }
                        }
                    }
                };
        }
        throw new Error(`ActionTraceKey: ${actionTraceKey} does not exist`);
    }
}

module.exports = ActionTraceFactory;