const baseConfig = require('../../../jest.base.config2');
module.exports = {
    ...baseConfig,
    moduleNameMapper: {
        "^lodash-es$": "lodash"
    },
    globalSetup: 'jest-preset-angular/global-setup'
};