import { Injector, ErrorHandler } from "@angular/core";
import { GlobalService } from "../shared/globals/globals";
import { AppErrorHandler } from "./error";
import { Router } from "@angular/router";
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

/*
 * Note this test suite provides low coverage of the handler as it does not provide 
 * routing infrastructure.
 */

describe('AppErrorHandler', function() {
    let injector : Injector = Injector.create([]);
    let globalService: {
        setMessage1: jest.Mock;
        syserror: jest.Mock;
    };
    let platid : Object = "browser";

    // beforeEach(waitForAsync(() => {
    //     TestBed.configureTestingModule({
    //         providers: [
    //             { provide: GlobalService, useValue: document }]
    //     });
    // }));
        
    beforeEach(() => {
        injector = Injector.create({ providers: [] });

        globalService = {
            setMessage1: jest.fn(),
            syserror: jest.fn(),
        };

        injector = Injector.create({
            providers: [
                {
                    provide: Router,
                    useValue: {},
                },
            ],
        });        
    });

    // it('handleError()', function() {
    //     let hdlr : ErrorHandler = new AppErrorHandler(platid, null, injector);
    //     expect(function() {hdlr.handleError(new Error("Test error"));}).not.toThrow();
    // });

    it("handleError()", () => {
        const hdlr: ErrorHandler = new AppErrorHandler(
            platid,
            globalService as unknown as GlobalService,
            injector,
        );

        expect(() => {
            hdlr.handleError(new Error("Test error"));
        }).not.toThrow();

        expect(globalService.setMessage1).toHaveBeenCalledWith({
            text: "Error: Test error",
        });

        expect(globalService.syserror).toHaveBeenCalledWith("Test error");
    });    
});
