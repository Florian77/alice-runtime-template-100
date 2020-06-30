const dc = require("node-dev-console");
const alice = require("alice-runtime");
const {utility: u} = require("alice-runtime");
const aliceTestEnv = require("alice-runtime/test-environment");
const R = require('ramda');
const XLSX = require('xlsx');
dc.activate();

// const options = require('command-line-args')([{name: 'stage', alias: 's', type: String}]);
// const stage = R.propOr("local", "stage", options);
// console.log("[STAGE=%s]", stage);

alice.loadRuntimeConfig(__dirname, "local");
// alice.loadRuntimeConfig(__dirname, "prod");


(async () => {
    await alice.connect(); // Connect to Database

    await aliceTestEnv.clearDatabase({createIndexAfterClear: true});

    const wb = XLSX.readFile("./file/Alice_Inventory_12-04-2020.xlsx");
    // const wb = XLSX.readFile("./file/TEST_Alice_Inventory_12-04-2020.xlsx");

    // dc.j(wb.SheetNames, "SheetNames");

    const ws = wb.Sheets[wb.SheetNames[0]];
    const result = XLSX.utils.sheet_to_json(ws);
    // dc.j(result);

    const useItemFilterFunction = false,
        itemFilterFunction = () => false;

    const useFilterFunction = (useItemFilterFunction === true && isFunction(itemFilterFunction));
    for (let item of result) {
        // dc.j(item, "item");
        // dc.l("itemFilterFunction(item)=%s", itemFilterFunction(item));
        if (
            useFilterFunction === false
            || itemFilterFunction(item)
        ) {
            if(R.prop("JTLSKU", item) === R.prop("Artikelnummer", item)) {
                // dc.j(item);

                const result = await alice.emitCommand({
                    context: "PIM",
                    aggregate: "inventory",
                    command: "updateOnChange",
                    invokeIdPrefix: `sku=${R.prop("JTLSKU", item)}&u=`,
                    priority: 100,
                    payload: {
                        ...item
                    }
                });
                // dc.l("emitCommand().result", dc.stringify(result));

            }

        }
    }

    await alice.disconnect();

})();

function isFunction(functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}