const alice = require("alice-runtime");
const R = require('ramda');
const dc = require("node-dev-console");
dc.activate();

const options = require('command-line-args')([{name: 'stage', alias: 's', type: String}]);
const stage = R.propOr("local", "stage", options);
console.log("[STAGE=%s]", stage);

alice.loadRuntimeConfig(__dirname, stage);

// const app = require("./app");
// TODO -> add test app


(async () => {
    console.log("---> START INSTALL COMMANDS");

    await alice.connect(); // Connect to Database

    const multiCommandList = [
        /*{
            "context": "EBAY",
            "aggregate": "seller-list",
            "command": "getSellerList",
            "invokeId": "sellerId=auktionberlin2013",
            "payload": {
                "sellerId": "auktionberlin2013"
            }
        },*/
    ];

    for (const multiCommand of multiCommandList) {
        try {
            dc.j(multiCommand, "multiCommand");
            // debug("createDataTrigger(%s)", jsonString(trigger));
            const result = await alice.emitMultiCommand(multiCommand);
            // console.log("createDataTrigger() DONE");
            // dc.l("createDataTrigger().result", dc.stringify(result));
            dc.l("DONE");

        } catch (e) {
            dc.l("ERROR: %s", e.message);
            // console.error(e);
        }

    }

    await alice.disconnect();

})();