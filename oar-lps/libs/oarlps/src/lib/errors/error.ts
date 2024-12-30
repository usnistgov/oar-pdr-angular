/* 
 * Error infrastructure, including an ErrorHandler
 */
import { ErrorHandler, Injector, Injectable, Inject, PLATFORM_ID, Optional } from "@angular/core";
import { isPlatformServer } from '@angular/common';
import { Router }                             from "@angular/router";
import { RESPONSE } from '@nguniversal/express-engine/tokens';
import { Response } from 'express';

/**
 * an application-wide ErrorHandler.
 * 
 * The intent of this handler is to capture internal errors and reroute the response to 
 * the /int-error page.  
 */
@Injectable()
export class AppErrorHandler implements ErrorHandler {

    constructor(@Inject(PLATFORM_ID) private platid : object, private injector : Injector)
    { }

    public handleError(error : any) {
        console.error("LPS Application Error: "+error);
        if (isPlatformServer(this.platid) && error.stack)
            console.error(error.stack);
        let router : Router|null = null
        try {
            router = this.injector.get(Router) as Router;
        } catch (e) {
            console.log("No router available to reroute on error. ("+e.message+")");
        }

        if (isPlatformServer(this.platid)) {
            let respstat = 500;
            if (error instanceof IDNotFound)
                respstat = 404;
            else if (error instanceof NotAuthorizedError)
                respstat = 401;
            
            // this is needed if rerouting is not possible or status was already set (?)
            console.log("Setting response status to "+respstat);
            let resp : Response = this.injector.get(RESPONSE) as Response;
            resp.status(respstat);
        }

        if (router) {
            // rerouting may not work if we've already started to build the page.  

            if (error instanceof IDNotFound) {
                console.log("attempting reroute to /not-found");
                router.navigateByUrl("/not-found/"+error.id, { skipLocationChange: true });
            }
            else if (error instanceof NotAuthorizedError) {
                // in the future, we may want to route to an error page specific to this error
                console.log("attempting reroute to /not-found");
                router.navigateByUrl("/not-found/"+error.id, { skipLocationChange: true });
            }
            else {
                console.log("attempting reroute to /int-error");
                router.navigateByUrl("/int-error", { skipLocationChange: true });
            }
        }
    }
}

/**
 * a custom exception indicating a request for the landing page for a non-existent identifier
 */
export class IDNotFound extends Error {

    /**
     * create the error
     * @param id   the ID that was requested but does not exist
     */
    constructor(public id : string) {
        super("Resource identifier not found: "+id);
    }
}

/**
 * an error indicating that the client is not authorized to access a requested record
 */
export class NotAuthorizedError extends Error {

    public op: string = "access";

    /**
     * create the error
     * @param id      the ID of the record user is trying to access
     * @param opverb  a verb indicating what the user wants to do with the record.  Usually this is
     *                "read", "write", or "update".  This value will be used in the error message.
     *                The default value is "access".
     * @param message The message explaining the error; if not provided, a default is formed from 
     *                the other values.
     */
    constructor(public id: string, opverb: string = "access", message: string|null = null) {
        super((message) ? message : "User is not authorized to "+opverb+" record with ID="+id);
        this.op = opverb;
    }
}

/**
 * an error indicating that a request could not be fulfilled due to bad input
 */
export class BadInputError extends Error {

    /**
     * create the error
     */
    constructor(message: string) {
        super(message);
    }
}
