const expect = require('chai').expect
const GyftieListener = require('../src/GyftieListener');

describe('orderBookChanges', function () {
    let listener = new GyftieListener({
        apiKey: "your-api-key",
        network: "mainnet",
        endpoint: "mainnet.eos.dfuse.io",
    });


    it('orderBookChanges', async function () {
        const subscription = await listener.orderBookChanges({
            blockNum: "42261484",
        });

        subscription.subscribe({
            next: data => {
                console.log(data);
            },
            error: error => console.log(error),
        });

    });

});
