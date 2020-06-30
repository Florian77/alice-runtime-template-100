const alice = require("alice-runtime");
const dc = require("node-dev-console");


module.exports.fn = async (event, context) => {
    // dc.j(event, 'event');
    // dc.j(context, 'context');
    console.log("start process");
    let result;
    try {
        await alice.connect(); // Connect to Database

        result = await alice.checkIndexes();
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
    return result;
};

