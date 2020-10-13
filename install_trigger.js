const alice = require("alice-runtime");
const R = require('ramda');
const dc = require("node-dev-console");
const triggerList = require("./install_trigger_list");
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

    /*const triggerList = [
        require("./app/AKENEO/import/tgr/importAttribute/module"),
    ];*/

    for (const _MODULE of triggerList) {
        try {
            // dc.j(_MODULE, "_MODULE");
            // debug("createTrigger(%s)", jsonString(trigger));
            // const result = await alice.createTrigger(_MODULE);
            // console.log("createTrigger() DONE");
            // dc.l("createTrigger().result", dc.stringify(result));
            // dc.l("DONE");

            const result = await alice.createTrigger(_MODULE);
            dc.l(
                R.pipe(
                    R.pick(["type", "streamType", "context", "aggregate", "trigger"]),
                    R.values,
                    R.join("/")
                )(result)
            );

        } catch (e) {
            dc.l("ERROR: %s", e.message);
            // console.error(e);
        }

    }

    await alice.disconnect();

})();
