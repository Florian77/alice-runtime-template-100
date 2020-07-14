const {entity} = require("alice-runtime");

module.exports = entity.createIfNotExists_Command(require("../../entity-config"));
