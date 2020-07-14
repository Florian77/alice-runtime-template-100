const context = "ENTITY_CONTEXT";
const aggregate = "entity-aggregate";

const entityId = {
    fieldList: [
        {
            code: "family"
        },
        {
            code: "name"
        }
    ],
};

const entityValue = {
    fieldList: [
        {
            code: "feed_product_type",
            type: "pim_catalog_text",
        },
        {
            code: "recommended_browse_nodes",
            type: "pim_catalog_text",
        },
    ]
};


module.exports = {
    context,
    aggregate,
    entityId,
    entityValue,
};
