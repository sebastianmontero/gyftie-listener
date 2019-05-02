const { Observable } = require('rxjs');
const { GQLEOSListener } = require('@smontero/eos-listener-gql');
const ActionTraceFactory = require('./ActionTraceFactory');
const { ActionTraceKeys } = require('./const');
const { ExchangeOrderInterpreter } = require('./interpreters');

class GyftieListener {

    constructor({
        apiKey,
        network,
        endpoint,
    }) {

        this.listener = new GQLEOSListener({
            apiKey,
            network,
            endpoint
        });
    }

    async orderBookChanges({
        blockNum,
        cursor,
        irreversible = false,
    }) {
        const interpreter = new ExchangeOrderInterpreter();

        const subscription = await this.listener.actionSubscription(
            ActionTraceFactory.getActionTrace(
                ActionTraceKeys.ORDER_BOOK_CHANGES,
                {
                    blockNum,
                    cursor,
                    irreversible,
                }
            )
        );

        return Observable.create(function (observer) {
            subscription.subscribe({
                next: value => {
                    const orders = interpreter.interpret(value);
                    for (let order of orders) {
                        observer.next(order);
                    }
                },
                error: error => observer.error(error),
                complete: error => observer.complete(error),
            });
        });

    }
}

module.exports = GyftieListener;

