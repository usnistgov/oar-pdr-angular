import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { UserMessageService } from 'oarlps';

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {

  constructor(private http: HttpClient,
    private msgsvc: UserMessageService,
    private toastrService: ToastrService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log("request", request);
    // wrap in delayed observable to simulate server api call
    return of(null).pipe(mergeMap(() => {
        // Wizard
        // if (request.url.indexOf('localhost:9091') > -1 && request.method === 'POST') {
        //     return of(new HttpResponse({ status: 200, body: wizardResponse }));
        // }

        // metrics
        // if (request.url.indexOf('usagemetrics/files') > -1 && request.method === 'GET') {
        //     return of(new HttpResponse({ status: 200, body: metricsRecordDetails }));
        // }

        // if (request.url.indexOf('isPartOf.@id=ark:/88434/mds9911') > -1 && request.method === 'GET') {
        //     // console.log("Getting forensics")
        //     return of(new HttpResponse({ status: 200, body: testdata }));
        // }

        // if (request.url.indexOf('usagemetrics/files') > -1 && request.method === 'GET') 
        // {
        //   console.log("Throw error...");
        //   throw new HttpErrorResponse(
        //     {
        //       error: 'internal error message goes here...',
        //       headers: request.headers,
        //       status: 500,
        //       statusText: 'internal error',
        //       url: request.url
        //     });
        // }

      // For e2e test
      // if (request.url.endsWith('/rmm/records/SAMPLE123456') && request.method === 'GET') {
      //   return of(new HttpResponse({ status: 200, body: sampleData }));
      // }

      // Generate bundle plan
    //   if (request.url.indexOf('_bundle_plan') > -1 && request.method === 'POST') 
    //   {
    //     console.log("Record saved...");
    //     return of(new HttpResponse({ status: 200, body: bundlePlanRes }));
    //   }

      // Generate bundle plan internal error
      // if (request.url.indexOf('_bundle_plan') > -1 && request.method === 'POST') 
      // {
      //   console.log("Throw error...");
      //   throw new HttpErrorResponse(
      //     {
      //       error: 'internal error message goes here...',
      //       headers: request.headers,
      //       status: 500,
      //       statusText: 'internal error',
      //       url: request.url
      //     });
      // }

    // Generate bundle download internal error
    //   if (request.url.indexOf('_bundle') > -1 && request.url.indexOf('_bundle_plan') <= 0 && request.method === 'POST') 
    //   {
    //     console.log("Throw error...");
    //     throw new HttpErrorResponse(
    //       {
    //         error: 'internal error message goes here...',
    //         headers: request.headers,
    //         status: 500,
    //         statusText: 'internal error',
    //         url: request.url
    //       });
    //   }

    // // authenticate
    if (request.url.indexOf('auth/_perm/') > -1 && request.method === 'GET') {
        this.toastrService.warning('You are using fake backend!', 'Warning!');
        this.msgsvc.error('You are using fake backend!');
        alert("You are using fake backend!");
        
        let body: any = {
            userId: 'xyz@nist.gov',
            token: 'fake-jwt-token'
        };
        console.log("logging in...")
        return of(new HttpResponse({ status: 200, body }));
    }

    if (request.url.indexOf('auth/_tokeninfo') > -1 && request.method === 'GET') {
        this.toastrService.warning('You are using fake backend!', 'Warning!');
        this.msgsvc.inform('You are using fake backend!');
        alert("You are using fake backend!");
        let body: any = {
            userDetails: {
                userId: 'xyz@nist.gov',
                userName: 'xyz',
                userLastName: 'anon',
                userEmail: "anon@email.com"
            },
            token: 'fake-jwt-token'
        };
        console.log("logging in......")
        return of(new HttpResponse({ status: 200, body }));
    }
      // return 401 not authorised if token is null or invalid
      // if (request.url.indexOf('auth/_perm/') > -1 && request.method === 'GET') {
      //     let body: ApiToken = {
      //         userId: '1234',
      //         token: 'fake-jwt-token'
      //     };
      //     console.log("logging in...")
      //     return Observable.throw(
      //         JSON.stringify({
      //             "status": 401,
      //             "Userid": "xyz@nist.gov",
      //             "message": "Unauthorizeduser: User token is empty or expired."
      //         })
      //     );
      // }

    //   if (request.url.endsWith('/auth/token') && request.method === 'GET') {
    //       let body: ApiToken = {
    //           userId: '1234',
    //           token: 'fake-jwt-token'
    //       };
    //       console.log("getting token...")
    //       // window.alert('Click ok to login');
    //       return of(new HttpResponse({ status: 200, body }));
    //   }

      // if (request.url.endsWith('/saml-sp/auth/token') && request.method === 'GET') {
      //   let body: ApiToken = {
      //     userId: '1234',
      //     token: 'fake-jwt-token'
      //   };
      //   // window.alert('Click ok to login');
      //   return of(new HttpResponse({ status: 200, body }));
      // }

      // if (request.url.indexOf('/customization/api/draft') > -1 && request.method === 'GET') {
      //     console.log("Interceptor returning sample record...");
      //     return of(new HttpResponse({ status: 200, body: sampleRecord }));
      // }

      // if (request.url.indexOf('/customization/api/draft') > -1 && request.method === 'PATCH') {
      //     console.log("Record updated...");
      //     return of(new HttpResponse({ status: 200, body: undefined }));
      //     // return Observable.throw('Username or password is incorrect');
      // }

      // if (request.url.indexOf('/customization/api/draft') > -1 && request.method === 'DELETE') {
      //     console.log("Record deleted...");
      //     return of(new HttpResponse({ status: 200, body: undefined }));
      // }

      // if (request.url.indexOf('/customization/api/savedrec') > -1 && request.method === 'PUT') {
      //     console.log("Record saved...");
      //     return of(new HttpResponse({ status: 200, body: undefined }));
      // }

      // get bundle
      // if (request.url.endsWith('/od/ds/_bundle') && request.method === 'POST') {
      //     // return new Observable(observer => {
      //     //     observer.next(this.testDataService.getBundle('https://s3.amazonaws.com/nist-midas/1858/20170213_PowderPlate2_Pad.zip', params););
      //     //     observer.complete();
      //     //   });
      //     // return this.testDataService.getBundle('https://s3.amazonaws.com/nist-midas/1858/20170213_PowderPlate2_Pad.zip', bundlePlanRes);
      //     console.log("Handling /od/ds/_bundle:");

      //     const duplicate = request.clone({
      // method: 'get' 
      //     })
      //     return next.handle(request);
      // }

      // pass through any requests not handled above
      return next.handle(request);

  }))

      // call materialize and dematerialize to ensure delay even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648)
      .pipe(materialize())
      .pipe(delay(500))
  .pipe(dematerialize());
  }
}

export let fakeBackendProvider = {
  // use fake backend in place of Http service for backend-less development
  provide: HTTP_INTERCEPTORS,
  useClass: FakeBackendInterceptor,
  multi: true
};