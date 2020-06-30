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
    console.log("---> START INSTALL TRIGGER");

    await alice.connect(); // Connect to Database

    const triggerList = [
        // require("./app/PIM/attribute-rule/tgr/importAttributeRule/module"),

    ];

    for (const _MODULE of triggerList) {
        try {
            dc.j(_MODULE, "_MODULE");
            // debug("createDataTrigger(%s)", jsonString(trigger));
            const result = await alice.createDataTrigger(_MODULE);
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