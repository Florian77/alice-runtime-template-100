const alice = require("alice-runtime");
const {resolve} = require('path');
const dc = require("node-dev-console");

module.exports.fn = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    // dc.j(event, 'event');
    // dc.j(context, 'context');
    console.log("start process");
    let result;
    try {
        // Connect to Database
        await alice.connect();

        const functionPath = resolve(
            __dirname,
            "../",
            "../",
            "../",
            "app"
        );
        // dc.l("functionPath:", functionPath);

        result = await alice.process({
            functionPath,
            maxRuntime: 5 * 60,
        });
        console.log("result:", dc.stringify(result));


    } catch (e) {
        console.error(e);
        result = "ERROR";
    }
    if (process.env.IS_LOCAL) {
        console.log("SERVERLESS: invoke local");
        await alice.disconnect();
    }
    console.log("process completed");
    return result; //{result, event, context};
};
