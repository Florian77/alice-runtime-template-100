const alice = require("alice-runtime");
const R = require('ramda');

// process.env.DEV_CONSOLE_ON = 1;
const dc = require("node-dev-console");


require("debug").log = console.log.bind(console);
const _loggerNs = "sys:dashboardApi";
const _logger = require("debug")(_loggerNs);
const log = _logger.extend("log");
require("debug").enable(""
    + ",*:log"
    // +",*:debug"
    + `,${_loggerNs}:log`
    // + `,${_loggerNs}:debug`
    // + ",alice:processTrigger:debug"
    // + ",alice:processCommands:debug"
    // + ",alice:storeDataEvent:debug"
    // + ",alice:db:debug"
    + ",alice:db:connect"
);

const makeResponse = (statusCode = 200, body = {}) => ({
    statusCode,
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        "Content-Type": "application/json"
    },
    body: JSON.stringify(
        R.mergeLeft(
            body,
            {
                ok: true,
                ack: 'success',
                message: '',
            }
        )
    ),
});


// const isGetRequest = R.propEq('httpMethod', 'GET');
// const isPostRequest = propEq('httpMethod', 'POST');
const getFuncParameter = R.pathOr(false, ['pathParameters', 'func']);
const getQueryStringParameter = (event) => R.propOr({}, 'queryStringParameters', event);


module.exports.fn = async (event, context) => {
    // dc.j(event, 'event');
    // dc.j(context, 'context');
    // return ;

    let responseCode, responseBody;
    try {
        // Connect to Database
        await alice.connect();

        const action = getFuncParameter(event);
        const query = getQueryStringParameter(event);
        [responseCode, responseBody] = await alice.dashboardApi(action, query);

    } catch (e) {
        console.error("dashboard-api:ERROR:", e.message);
        responseCode = 400;
        responseBody = {ok: false, ack: "error", message: e.message};
    }

    if (process.env.IS_LOCAL) {
        log("SERVERLESS: invoke local");
        await alice.disconnect();
    }
    return makeResponse(responseCode, responseBody);
};

