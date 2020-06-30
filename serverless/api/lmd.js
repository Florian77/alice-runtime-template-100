// require('../../test/app2-env');
const R = require("ramda");
const alice = require('alice-runtime');
const {utility: u} = require("alice-runtime");
const dc = require("node-dev-console");

dc.activate();


const makeResponse = (statusCode = 200, body = "No content") => ({
    statusCode,
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        "Content-Type": "text/html; charset=UTF-8",
    },
    body,
});

const getQueryStringParameter = (param, event) => R.pathOr(false, ['queryStringParameters', param], event);


module.exports.fn = async (event, context) => {
    // dc.j(event, 'event');
    // dc.j(context, 'context');

    let result = "NONE";
    try {
        // Connect to Database
        await alice.connect();

        const format = getQueryStringParameter("format", event);
        const sku = getQueryStringParameter("sku", event);
        dc.l("[sku=%s]", sku);
        if (!sku || R.isEmpty(sku)) {
            return makeResponse(400, "Error: sku missing");
        }



        // ---------------------------------------------------------------------------------
        // Load -> inventory-attribute  Aggregate
        /*const inventory_Aggregate = {
            context: "import",
            aggregate: "inventory",
            aggregateId: `sku=${sku}`,
        };
        // dc.l("inventory_Aggregate", dc.stringify(inventory_Aggregate));
        const inventory_DataEvent = await alice.getLastDataEvent(inventory_Aggregate);
        // dc.l("env.getLastDataEvent(%s).result", dc.stringify(inventory_Aggregate), dc.stringify(inventory_DataEvent));
        if (!inventory_DataEvent) { // Handle Aggregate not exists
            // return makeResponse(200, `Error: sku [${sku}] not found`);
        }
        const inventory_Data = R.propOr({}, "payload", inventory_DataEvent);
        // dc.l("inventory_Data", dc.stringify(inventory_Data));*/

        // ---------------------------------------------------------------------------------
        // Load -> inventory-attribute  Aggregate
        const inventoryAttribute_Aggregate = {
            context: "PIM",
            aggregate: "inventory",
            aggregateId: u.stringifyId("sku", sku), //`sku=${sku}`,
        };
        // dc.l("inventoryAttribute_Aggregate", dc.stringify(inventoryAttribute_Aggregate));
        const inventoryAttribute_DataEvent = await alice.getLastDataEvent(inventoryAttribute_Aggregate);
        // dc.l("env.getLastDataEvent(%s).result", dc.stringify(inventoryAttribute_Aggregate), dc.stringify(inventoryAttribute_DataEvent));
        if (!inventoryAttribute_DataEvent) { // Handle Aggregate not exists
            return makeResponse(404, `Error: sku [${sku}] not found`);
        }

        const inventoryAttribute_Data = R.propOr({}, "payload", inventoryAttribute_DataEvent);

        if(format === "json") {
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(inventoryAttribute_Data),
            };
        }


        // dc.l("inventoryAttribute_Data", dc.stringify(inventoryAttribute_Data));
        const imageList = R.propOr([], "imageList", inventoryAttribute_Data);
        const attributeList = R.propOr({}, "attributeList", inventoryAttribute_Data);
        const brand = R.propOr("", "brand", inventoryAttribute_Data);
        const rawData = R.propOr({}, "rawData", inventoryAttribute_Data);


        // ---------------------------------------------------------------------------------
        const PictureURLs = R.propOr("", "Picture URLs", rawData);
        // dc.j(PictureURLs, "PictureURLs");
        let imageList2 = R.split(",", PictureURLs);
        // dc.j(imageList2, "imageList2");
        imageList2 = R.map(
            R.pipe(
                R.split("="),
                // ftDev.ramdaLogJsonString("S1"),
                R.prop(1)
            ),
            imageList2
        );
        imageList2 = R.filter(R.complement(R.isNil), imageList2);
        // dc.j(imageList2, "imageList2");

        // zu erst -> Picture URLs:

        // sonst ->
        const imgHtml = R.map(
            img => (`<img src="${img}" style="max-width: 300px; float: left;"/>`)
            ,
            R.isEmpty(imageList2) ? imageList : imageList2
        );


        const attrHtml = R.pipe(
            R.map(
                ({name, value}) => (`<strong>${name}:</strong> ${value}`),
            ),
            R.join("<br/>")
        )(attributeList);

        const textHtml = `<h3>${sku} - ${brand}</h3><p>${rawData["Auction Title"]}</p><p>${attrHtml}</p>`;

        const filterRaus = [
            "Picture URLs",
            "search-terms1",
            "search-terms2",
            "search-terms3",
            "search-terms4",
            "search-terms5",
            "ShopifyProductID",
            "ShopifyProductURL",
        ];

        // rausfiltern alles was mit attribute anfängt
        const filteredRaw = R.pipe(
            R.toPairs,
            R.filter(
                ([key, value]) => {
                    if(R.startsWith("Attribute", key)) {
                        return false;
                    }
                    if(R.includes(key, filterRaus)) {
                        return false;
                    }
                    return true;
                }
            ),
            R.fromPairs,
        )(rawData);


        const inventoryHtml = R.pipe(
            R.toPairs,
            R.map(([key, value]) => (`<strong>${key}:</strong> ${value}`)),
            R.join("<br/>")
        )(filteredRaw);

        const style = "<style>body { font-family: Arial; line-height: 1.4; }</style>";

        let html = `<html><head><title>${sku}</title>${style}</head><bod>${textHtml}<hr/>${imgHtml}<div style="clear: both;"></div><hr/>${filteredRaw["Description"]}<hr/>${inventoryHtml}</bod></html>`;

        return makeResponse(200, html);


    } catch (e) {
        console.error(e);
    }
    if (process.env.IS_LOCAL) {
        dc.l("SERVERLESS: invoke local");
        await alice.disconnect();
    }

    return {result, event, context};
};
