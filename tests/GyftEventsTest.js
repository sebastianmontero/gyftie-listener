const expect = require('chai').expect
const GyftieListener = require('../src/GyftieListener');

describe('GyftEvents', function () {
    const listener = new GyftieListener({
        apiKey: "server_d34dc9a715ac76a7a0293ee554067628",
        network: "mainnet",
        endpoint: "mainnet.eos.dfuse.io",
    });


    it('GyftEvents', async function () {
        const subscription = await listener.gyftEvents({
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
