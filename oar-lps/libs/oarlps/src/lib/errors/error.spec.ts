import { Injector, ErrorHandler } from "@angular/core";
import { GlobalService } from "../shared/globals/globals";
import { AppErrorHandler } from "./error";
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

/*
 * Note this test suite provides low coverage of the handler as it does not provide 
 * routing infrastructure.
 */

describe('AppErrorHandler', function() {
    let injector : Injector = Injector.create([]);
    let platid : Object = "browser";

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: GlobalService, useValue: document }]
        });
    }));
        
    it('handleError()', function() {
        let hdlr : ErrorHandler = new AppErrorHandler(platid, null, injector);
        expect(function() {hdlr.handleError(new Error("Test error"));}).not.toThrow();
    });
});
