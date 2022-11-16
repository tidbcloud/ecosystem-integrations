const {
  config: authentication,
  befores = [],
  afters = [],
} = require('./authentication');

const createRow = require("./creates/row");

const projectResource = require("./resources/project");

const clusterResource = require("./resources/cluster");

const databaseResource = require("./resources/database");

const tableResource = require("./resources/table");

const getRow = require("./triggers/row");

const columnResource = require("./resources/column");

const findRow = require("./searches/row");

const findRowQuery = require("./searches/row_query");

const getRowQuery = require("./triggers/row_query");

const createRowUpdate = require("./creates/row_update");

module.exports = {
  // This is just shorthand to reference the installed dependencies you have.
  // Zapier will need to know these before we can upload.
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  authentication,

  beforeRequest: [...befores],

  afterResponse: [...afters],

  // If you want your trigger to show up, you better include it here!
  triggers: {
    [getRow.key]: getRow,
    [getRowQuery.key]: getRowQuery
  },

  // If you want your searches to show up, you better include it here!
  searches: {
    [findRow.key]: findRow,
    [findRowQuery.key]: findRowQuery
  },

  // If you want your creates to show up, you better include it here!
  creates: {
    [createRow.key]: createRow,
    [createRowUpdate.key]: createRowUpdate
  },

  resources: {
    [projectResource.key]: projectResource,
    [clusterResource.key]: clusterResource,
    [databaseResource.key]: databaseResource,
    [tableResource.key]: tableResource,
    [columnResource.key]: columnResource
  },
};
