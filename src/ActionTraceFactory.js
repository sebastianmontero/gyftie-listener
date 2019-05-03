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
        }
        throw new Error(`ActionTraceKey: ${actionTraceKey} does not exist`);
    }
}

module.exports = ActionTraceFactory;