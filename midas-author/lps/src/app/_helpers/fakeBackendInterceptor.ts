// import { SidebarService } from './../../../../../oar-lps/libs/oarlps/src/lib/sidebar/sidebar.service';
// import { fakeBackendProvider } from './../../../../wizard/src/app/_helpers/fakeBackendInterceptor';
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';
import { userInfo } from 'os';
import { ToastrService } from 'ngx-toastr';
import { GlobalService, NerdmRes, SidebarService } from 'oarlps';

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
  md: NerdmRes = null;

  constructor(
    private http: HttpClient,
    private globalsvc: GlobalService,
    private sidebarSvc: SidebarService,
    private toastrService: ToastrService) {
      this.globalsvc.watchCurrentRec(
        (md) => {
            if (md && md != this.md) {
                this.md = md as NerdmRes;
            }
        }
    );
  }

    /**
     * Generate random string
     * @param length Length of the output string
     * @returns random string
     */
      readableRandomStringMaker(length: number) {
        for (var s=''; s.length < length; s += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(Math.random()*62|0));
        return s;
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // array in local storage for registered users

        // const sampleData: any = require('../../assets/science-theme/BiometricsScienceTheme.json');
        // const sampleRecord: any = require('../../assets/science-theme/DNAScienceTheme.json');

        // const biometricsData1: any  = require('../../assets/science-theme/SDB-300.json');
        // const biometricsData2: any  = require('../../assets/science-theme/SDB-301.json');
        const validateResponse: any  = require('../../assets/sample-data/validate_response.json');

        const sampleCollection2: any = require('../../assets/sample-data/collectionTestData.json');
        // const dna1: any  = require('../../assets/science-theme/dna1.json');
        // const dna2: any  = require('../../assets/science-theme/dna2.json');
        // const dna3: any  = require('../../assets/science-theme/dna3.json');
        // const dna4: any  = require('../../assets/science-theme/dna4.json');
        // const dna5: any  = require('../../assets/science-theme/dna5.json');

        // const sampleData: any = require('../../assets/sample1.json');
        const emptyNerdm: any = require('../../assets/sample-data/nerdm-empty.json');
        const nerdm: any = require('../../assets/sample-data/nerdm2.json');
        const taxonomy: any = require('../../assets/sample-data/taxonomy-list.json');
        const forensics: any = require('../../assets/sample-data/pdr0-0001.json');
        const chips: any = require('../../assets/sample-data/pdr0-0002-new.json');

        // const testdata: any = {
        //     PageSize: 1,
        //     ResultCount: 8,
        //     ResultData: [sampleData]
        // }

        const midasRes = {
            "id": "mds3:0001",
            "name": "firsttest",
            "acls": {
              "read": [
                "anonymous"
              ],
              "write": [
                "anonymous"
              ],
              "admin": [
                "anonymous"
              ],
              "delete": [
                "anonymous"
              ]
            },
            "owner": "anonymous",
            "deactivated": null,
            "status": {
              "created": 1678804311.8563082,
              "state": "edit",
              "action": "create",
              "since": 1678804311.8570614,
              "modified": 1678804311.9115264,
              "message": "",
              "createdDate": "2023-03-14T14:31:51",
              "modifiedDate": "2023-03-14T14:31:51",
              "sinceDate": "2023-03-14T14:31:51"
            },
            "data": {
              "@id": "ark:/88434/mds3-0001",
              "title": "",
              "_schema": "https://data.nist.gov/od/dm/nerdm-schema/v0.7#",
              "@type": [
                "nrdp:PublicDataResource",
                "dcat:Resource"
              ],
              "doi": "doi:10.18434/mds3-0001",
              "author_count": 0,
              "file_count": 0,
              "nonfile_count": 0,
              "reference_count": 0
            },
            "meta": {
              "resourceType": "software",
              "creatorisContact": true
            },
            "curators": [

            ],
            "type": "dap"
        }

        let validateRes = {};

        if(this.md) {
          validateRes = this.sidebarSvc.getSuggestions(this.md, "");
        }

        console.log("request", request);
        // wrap in delayed observable to simulate server api call
        return of(null).pipe(mergeMap(() => {
            // if (request.url.indexOf('meta') > -1 && request.method === 'GET') {
            //     // console.log("Getting forensics")
            //     return of(new HttpResponse({ status: 200, body: midasRes }));
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


        // Validate
        if (request.url.indexOf('status/todo1') > -1 && request.method === 'GET') {
          // alert('You are using fake backend!' + '/status');

          console.log("Getting validation...")
          return of(new HttpResponse({ status: 200, body: validateRes}));
        }

        //======
        // // authenticate
        if (request.url.indexOf('auth/_tokeninfo') > -1 && request.method === 'GET') {
          alert('You are using fake backend for authentication!');

            let body: any = {
                userDetails: {
                    userId: 'TestId',
                    userName: 'Test',
                    userLastName: 'User',
                    userEmail: "test.user@nist.gov"
                },
                token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyRW1haWwiOiJ0ZXN0LnVzZXJAbmlzdC5nb3YiLCJ1c2VyTmFtZSI6IlRlc3QiLCJ1c2VyTGFzdE5hbWUiOiJVc2VyIiwidXNlck9VIjoiTU1MIiwiZGlzcGxheU5hbWUiOiJUZXN0SWQiLCJyb2xlIjoibm90LXNldCIsIndpbklkIjoiVGVzdElkIiwic3ViIjoiVGVzdElkIiwiZXhwIjoxNzQ4OTc0MTM1fQ.Ylr5es81bc4tx1TSumitmqVOA-GKbg-LXhTYu-IEoVQ'
            };
            console.log("logging in from fake backend...", body);
            return of(new HttpResponse({ status: 200, body }));
        }

      //   if (request.url.indexOf('auth/_tokeninfo') > -1 && request.method === 'GET') {
      //     if(!this.globalsvc.fakeBackendAlerted()) {
      //         alert('You are using fake backend for authentication!');
      //         this.globalsvc.fakeBackendAlerted.set(true);
      //     }

      //     let body: any = {
      //         userDetails: {
      //             userId: 'lnc9',
      //             userName: 'Chuan',
      //             userLastName: 'Lin',
      //             userEmail: "chuan.lin@nist.gov"
      //         },
      //         token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyRW1haWwiOiJ0ZXN0LnVzZXJAbmlzdC5nb3YiLCJ1c2VyTmFtZSI6IlRlc3QiLCJ1c2VyTGFzdE5hbWUiOiJVc2VyIiwidXNlck9VIjoiTU1MIiwiZGlzcGxheU5hbWUiOiJUZXN0SWQiLCJyb2xlIjoibm90LXNldCIsIndpbklkIjoiVGVzdElkIiwic3ViIjoiVGVzdElkIiwiZXhwIjoxNzQ2MDI5OTc5fQ.RMnH0auyL-ssATrmm4W0eIyY7nTWQm8vWnWkVfzbDLY'
      //     };
      //     console.log("logging in from fake backend...", body);
      //     return of(new HttpResponse({ status: 200, body }));
      // }

        // return 401 not authorised if token is null or invalid
        // if (request.url.indexOf('auth/_tokeninfo') > -1 && request.method === 'GET') {
        //     console.log("Returning 401 ...")
        //     throw new HttpErrorResponse(
        //             {"status": 401}
        //     );
        // }

        // if (request.url.indexOf('https://localhost/midas/dap/mds3/mds3:0001/data/authors') > -1 && request.method === 'POST') {
        //   let body = {
        //     "familyName": "Doe",
        //     "fn": "Jon  Doe",
        //     "givenName": "John",
        //     "@type": "foaf:Person",
        //     "@id": "auth_9"
        //   };
        //   return of(new HttpResponse({ status: 200, body: body }));
        // }

        if (request.url.indexOf('od/id/test3') > -1 && request.method === 'GET') {
            console.log("Getting collectionTestData.....")
            return of(new HttpResponse({ status: 200, body: sampleCollection2 }));
        }

        // if (request.url.indexOf('oardev.nist.gov/od/id/pdr0-0002') > -1 && request.method === 'GET') {
        //     console.log("Getting CHIPS pdr0-0002.....")
        //     return of(new HttpResponse({ status: 200, body: pdr0_0002 }));
        // }
        // midas test data
        // if (request.url.indexOf('midas/dap/mdsx/test1') > -1 && request.method === 'GET') {
        //     return of(new HttpResponse({ status: 200, body: emptyNerdm }));
        // }

        // if (request.url.indexOf('midas/dap/mdsx/test1') > -1 && request.method === 'DELETE') {
        //     return of(new HttpResponse({ status: 200, body: emptyNerdm }));
        // }

        // if (request.url.indexOf('midas/dap/mdsx/test1') > -1 && request.method === 'PATCH') {
        //     return of(new HttpResponse({ status: 200, body: emptyNerdm }));
        // }

        if (request.url.indexOf('/rmm/taxonomy') > -1 && request.method === 'GET') {
          alert('You are using fake backend!' + '/rmm/taxonomy');
          this.toastrService.warning('You are using fake backend!', 'Warning!');

          return of(new HttpResponse({ status: 200, body: taxonomy }));
        }

        // if (request.url.indexOf('data/theme') > -1 && request.method === 'PUT') {
        //   alert('You are using fake backend!' + 'data/theme');
        //   this.toastrService.warning('You are using fake backend!', 'Warning!');
        //   return of(new HttpResponse({ status: 200, body: request.body }));
        // }

        if (request.url.indexOf('midas/dap/mds3/pdr0-0001') > -1 && request.method === 'GET') {
          alert('You are using fake backend!' + 'midas/dap/mds3/pdr0-0001');
          this.toastrService.warning('You are using fake backend!', 'Warning!');
            return of(new HttpResponse({ status: 200, body: forensics }));
        }

        if (request.url.indexOf('midas/dap/mds3/pdr0-0002') > -1 && request.method === 'GET') {
          alert('You are using fake backend!' + 'midas/dap/mds3/pdr0-0002');
          this.toastrService.warning('You are using fake backend!', 'Warning!');
          return of(new HttpResponse({ status: 200, body: chips }));
        }

        if (request.url.indexOf('midas/dap/mds3/test2') > -1 && request.method === 'GET') {
          alert('You are using fake backend!' + 'midas/dap/mds3/test2');
          this.toastrService.warning('You are using fake backend!', 'Warning!');
            return of(new HttpResponse({ status: 200, body: nerdm }));
        }

        if ((request.url.indexOf('midas/dap/mds3/test2') > -1 || request.url.indexOf('midas/dap/mds3/pdr0-0002') > -1 || request.url.indexOf('midas/dap/mds3/pdr0-0001') > -1) && request.method === 'PUT') {
          alert('You are using fake backend!' + 'midas/dap/mds3/test2, pdr0-0001, pdr0-0002, PUT');
          this.toastrService.warning('You are using fake backend!', 'Warning!');
            let requestBody = JSON.parse(request.body);
            if(Array.isArray(requestBody)) {
                requestBody.forEach(item => {
                    if(typeof item == 'object' && !item['@id']){
                        item['@id'] = this.readableRandomStringMaker(6);
                    }
                })
            }

            return of(new HttpResponse({ status: 200, body: requestBody }));

            // Simulate error response:
            // throw new HttpErrorResponse(
            //     {"status": 401}
            // );
        }

        if (request.url.indexOf('midas/dap/mds3/test2') > -1 && request.method === 'DELETE') {
          alert('You are using fake backend!' + 'midas/dap/mds3/test2, DELETE');
          if(!this.globalsvc.fakeBackendAlerted()) {
                alert('You are using fake backend for authentication!');
                this.globalsvc.fakeBackendAlerted.set(true);
            }
            return of(new HttpResponse({ status: 200, body: nerdm }));
        }

        if ((request.url.indexOf('midas/dap/mds3/test2') > -1  || request.url.indexOf('midas/dap/mds3/pdr0-0002') > -1  || request.url.indexOf('midas/dap/mds3/pdr0-0001') > -1) && request.method === 'PATCH') {
          alert('You are using fake backend!' + 'midas/dap/mds3/test2, pdr0-0001, pdr0-0002, PATCH');

          if(!this.globalsvc.fakeBackendAlerted()) {
                alert('You are using fake backend for authentication!');
                this.globalsvc.fakeBackendAlerted.set(true);
            }

            return of(new HttpResponse({ status: 200, body: request.body }));
        }

        if (request.url.indexOf('midas/dap/mds3/test2/data/references') > -1 && request.method === 'POST') {
          alert('You are using fake backend!' + 'midas/dap/mds3/test2/data/references, POST');
          if(!this.globalsvc.fakeBackendAlerted()) {
                alert('You are using fake backend for authentication!');
                this.globalsvc.fakeBackendAlerted.set(true);
            }

            let body: any = request.body as any;
            let obj = JSON.parse(body);
            obj["@id"] = this.readableRandomStringMaker(6);

            return of(new HttpResponse({ status: 200, body: JSON.stringify(obj) }));
        }

//      Empty record

        if (request.url.indexOf('midas/dap/mds3/test1') > -1 && request.method === 'GET') {
          alert('You are using fake backend!' + 'midas/dap/mds3/test1, GET');

          if(!this.globalsvc.fakeBackendAlerted()) {
                alert('You are using fake backend for authentication!');
                this.globalsvc.fakeBackendAlerted.set(true);
            }

            return of(new HttpResponse({ status: 200, body: emptyNerdm }));
        }

        if (request.url.indexOf('midas/dap/mds3/test1') > -1 && request.method === 'PUT') {
          alert('You are using fake backend!' + 'midas/dap/mds3/test1, PUT');
            if(!this.globalsvc.fakeBackendAlerted()) {
                alert('You are using fake backend for authentication!');
                this.globalsvc.fakeBackendAlerted.set(true);
            }

            let requestBody = JSON.parse(request.body)
            if(Array.isArray(requestBody)) {
                requestBody.forEach(item => {
                    if(typeof item === 'object'){
                        if(!item['@id']){
                            item['@id'] = this.readableRandomStringMaker(6);
                        }
                    }
                })
            }
            return of(new HttpResponse({ status: 200, body: requestBody }));
        }

        if (request.url.indexOf('midas/dap/mds3/test1') > -1 && request.method === 'DELETE') {
          alert('You are using fake backend!' + 'midas/dap/mds3/test1, DELETE');
            if(!this.globalsvc.fakeBackendAlerted()) {
                alert('You are using fake backend for authentication!');
                this.globalsvc.fakeBackendAlerted.set(true);
            }

            return of(new HttpResponse({ status: 200, body: emptyNerdm }));
        }

        if (request.url.indexOf('midas/dap/mds3/test1') > -1 && request.method === 'PATCH') {
          alert('You are using fake backend!' + 'midas/dap/mds3/test1, PATCH');
            if(!this.globalsvc.fakeBackendAlerted()) {
                alert('You are using fake backend for authentication!');
                this.globalsvc.fakeBackendAlerted.set(true);
            }

            return of(new HttpResponse({ status: 200, body: request.body }));
        }

        if (request.url.indexOf('midas/dap/mds3/test1/data/references') > -1 && request.method === 'POST') {
          alert('You are using fake backend!' + 'midas/dap/mds3/test1/data/references, POST');
            let body: any = request.body as any;
            let obj = JSON.parse(body);
            obj["@id"] = this.readableRandomStringMaker(6);
            console.log("request body", obj);

            return of(new HttpResponse({ status: 200, body: JSON.stringify(obj) }));
        }


        // if (request.url.indexOf('references/#ref:10.1016/') > -1 && request.method === 'GET') {
        //     return of(new HttpResponse({ status: 200, body: nerdm.references[0] }));
        // }

        // if (request.url.indexOf('midas/dap/mdsx/test2/data/nonfileComponents') > -1 && request.method === 'POST') {
        //     let body: any = request.body as any;
        //     let obj = JSON.parse(body);
        //     obj["@id"] = this.readableRandomStringMaker(6);
        //     console.log("request body", obj);

        //     return of(new HttpResponse({ status: 200, body: JSON.stringify(obj) }));
        // }

        // if (request.url.indexOf('midas/dap/mdsx/test2/data/references') > -1 && request.method === 'POST') {
        //     let body: any = request.body as any;
        //     let obj = JSON.parse(body);
        //     obj["@id"] = this.readableRandomStringMaker(6);
        //     console.log("request body", obj);

        //     return of(new HttpResponse({ status: 200, body: JSON.stringify(obj) }));
        // }

        //======
        // return 401 not authorised if token is null or invalid
        //   if (request.url.indexOf('auth/_perm/') > -1 && request.method === 'GET') {
        //       let body: ApiToken = {
        //           userId: '1234',
        //           token: 'fake-jwt-token'
        //       };
        //       console.log("logging in...")
        //       return Observable.throw(
        //           JSON.stringify({
        //               "status": 401,
        //               "Userid": "xyz@nist.gov",
        //               "message": "Unauthorizeduser: User token is empty or expired."
        //           })
        //       );
        //   }

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
