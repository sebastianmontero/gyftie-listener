const expect = require('chai').expect
const GyftieListener = require('../src/GyftieListener');

describe('trades', function () {
    const listener = new GyftieListener({
        apiKey: "your_api_key",
        network: "mainnet",
        endpoint: "mainnet.eos.dfuse.io",
    });


    it('trades', async function () {
        const subscription = await listener.trades({
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
