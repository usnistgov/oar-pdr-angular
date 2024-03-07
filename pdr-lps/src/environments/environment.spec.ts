import * as ngenv from "./environment-impl";

describe("environments.environment", function() {

    it("config", function() {
        expect(ngenv.environment.config.locations.orgHome).toBeTruthy();
        expect(ngenv.environment.config.mode).toBe("dev");
        expect(ngenv.environment.config.production).toBeFalsy();
    });
});
