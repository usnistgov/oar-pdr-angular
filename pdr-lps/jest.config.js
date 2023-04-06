const baseConfig = require('../jest.base.config3');
module.exports = {
    ...baseConfig,
    moduleNameMapper: {
        "^lodash-es$": "lodash"
    },
    globalSetup: 'jest-preset-angular/global-setup'
};