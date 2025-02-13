import * as ngenv from "./environment";

describe("environments.environment", function() {

    it("config", function() {
        expect(ngenv.config.links.orgHome).toBeTruthy();
        expect(ngenv.config.mode).toBe("dev");
        expect(ngenv.config.production).toBeFalsy();
    });
});
