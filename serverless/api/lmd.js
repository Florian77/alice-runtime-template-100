const R = require("ramda");
const alice = require('alice-runtime');
const dc = require("node-dev-console");
const {resolve} = require('path');
const fs = require('fs');
// const yup = require('yup');

const {frontendApi} = require("alice-runtime");

dc.activate();


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

module.exports.fn = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    // dc.j(event, 'event');
    // dc.j(context, 'context');

    const apiKeyReceived = R.pathOr("", ["headers", "x-api-key"], event);
    // dc.t(apiKeyReceived, "apiKeyReceived");
    const apiKeyExpected = R.pathOr("", ["env", "ALICE_RUNTIME_APP_API_KEY"], process);
    // dc.t(apiKeyExpected, "apiKeyExpected);

    // for debug only:
    // console.log("apiKeyReceived: [%s]", apiKeyReceived);
    // console.log("apiKeyExpected: [%s]", apiKeyExpected);

    if (R.isEmpty(apiKeyReceived) || !R.equals(apiKeyExpected, apiKeyReceived)) {
        console.log("api key check failed");
        return makeResponse(403, {
            ok: false,
            ack: 'error',
            message: 'header:x-api-key check failed',
        });
    }

    try {
        // Connect to Database
        await alice.connect();

        const appBasePath = resolve(__dirname, "..", "..", "app");
        // dc.t(appBasePath, "appBasePath");

        const apiBasePath = resolve(__dirname, "..", "..", "api");
        // dc.t(apiBasePath, "apiBasePath");

        const {statusCode, body} = await frontendApi(alice, appBasePath, apiBasePath, event, {
            logApiCall: true
        });
        // dc.j(statusCode, "result statusCode");
        // dc.j(body, "result body");

        return makeResponse(statusCode, body);

    } catch (e) {
        console.error("API-ERROR:", e.message);
        return makeResponse(400, {ok: false, ack: "error", message: e.message});

    }


};

