import * as nerdm from './nerdm';
import * as nerdsvc from './nerdm.service';
import * as errors from '../errors/error';
import { Observable } from 'rxjs';
import * as rxjs from 'rxjs';


describe('TransferResourceService', function() {

    let trx : nerdm.MetadataTransfer;
    let svc : nerdsvc.NERDmResourceService;
    let tdata : nerdm.NerdmRes = {
        "@id":  "ark:/88888/goober",
        ediid: "goober",
        title: "A Good Test"
    };
    let edata : nerdm.NerdmRes = {
        "@id":  "pdr:error",
        title: "Server collapse",
        "http:status": 500
    };

    beforeEach(() => {
        trx = new nerdm.MetadataTransfer();
        trx.set("goober", tdata);
        svc = new nerdsvc.TransferResourceService(trx);
    });

    it("getResource", function(done) {
        let t1 = svc.getResource("goober");
        t1.subscribe((data) => { expect(data).toEqual(tdata); },
                     (err)  => { fail(err); });

        let t2 = svc.getResource("gomer");
        t2.subscribe((data) => { fail("Failed to raise IDNotFound"); },
                     (err)  => { expect(err).toBeInstanceOf(errors.IDNotFound); });

        rxjs.merge(t1, t2).subscribe(
            null,
            (err) => {
                expect(err).toBeInstanceOf(errors.IDNotFound);
                done();
            },
            () => { done(); });
    });

    it("getResource: handle server error", function(done) {
        trx.set("gomer", edata);
        svc.getResource("gomer").subscribe(
            (data) => { fail("Failed to raise ServerError"); done(); },
            (err)  => {
                expect(err).toBeInstanceOf(errors.ServerError);
                expect(err.status).toEqual(500);
                done();
            },
            () => { done(); }
        );
    });

});

class FailingResourceService extends nerdsvc.NERDmResourceService {
    getResource(id : string) : Observable<nerdm.NerdmRes> {
        return rxjs.throwError(() => new Error("delegate service resorted to."));
    }
};

describe('CachingNERDmResourceService', function() {

    let trx : nerdm.MetadataTransfer;
    let svc : nerdsvc.NERDmResourceService;
    let tdata : nerdm.NerdmRes = {
        "@id":  "ark:/88888/goober",
        ediid: "goober",
        title: "A Good Test"
    };

    beforeEach(() => {
        trx = new nerdm.MetadataTransfer();
        trx.set("goober", tdata);
        svc = new nerdsvc.CachingNERDmResourceService(new FailingResourceService(), trx);
    });

    it('getResource() via cache', function(done) {
        let t1 = svc.getResource("goober");
        t1.subscribe((data) => { expect(data).toEqual(tdata); },
                     (err)  => { fail(err); },
                     ()     => { done(); });
    });

    it('getResource() via delegate', function(done) {
        debugger;
        let t1 = svc.getResource("gomer");
        t1.subscribe((data) => { fail("Failed to fail"); done(); },
                     (err)  => {
                         let ne = trx.get("gomer");
                         expect(ne["@id"]).toEqual("pdr:error");
                         expect(ne["title"]).toEqual("delegate service resorted to.");
                         expect(ne["http:status"]).toEqual(0);
                         expect(err).toBeInstanceOf(Error)
                         done();
                     },
                     () => { done(); });
    });

    it('_makeErrorRec', function() {
        let errnm = (svc as nerdsvc.CachingNERDmResourceService)._makeErrorRec(405, "Upstream error");
        expect(errnm['@id']).toEqual("pdr:error");
        expect(errnm['title']).toEqual("Upstream error");
        expect(errnm['http:status']).toEqual(405);
    });
});

describe('TransmittingResourceService', function() {
    // Note: this does not demonstrate caching to the MetadatService

    let trx : nerdm.MetadataTransfer;
    let svc : nerdsvc.NERDmResourceService;
    let tdata : nerdm.NerdmRes = {
        "@id":  "ark:/88888/goober",
        ediid: "goober",
        title: "A Good Test"
    };

    beforeEach(() => {
        trx = new nerdm.MetadataTransfer();
    });

    it('getResource() via cache', function(done) {
        trx.set("goober", tdata);
        svc = new nerdsvc.TransmittingResourceService(new FailingResourceService(), trx);

        let t1 = svc.getResource("goober");
        t1.subscribe((data) => { expect(data).toEqual(tdata); },
                     (err)  => { fail(err); },
                     ()     => { done(); });
    });

    it('getResource() via delegate', function(done) {
        trx.set("goober", tdata);
        svc = new nerdsvc.TransmittingResourceService(new FailingResourceService(), trx);

        let t1 = svc.getResource("gomer");
        t1.subscribe((data) => { fail("Failed to fail"); done(); },
                     (err)  => { expect(err).toBeInstanceOf(Error); done(); },
                     ()     => { done(); });
    });

    it('getResource() caching to MetadataTransfer', function(done) {
        let cache : nerdm.MetadataTransfer = new nerdm.MetadataTransfer();
        cache.set("goober", tdata);
        svc = new nerdsvc.TransmittingResourceService(
                  new nerdsvc.CachingNERDmResourceService(
                      new FailingResourceService(), cache), trx);
        expect(trx.labels().length).toBe(0);

        svc.getResource("goober").subscribe(
            (data) => {
                // successfully pulled data from underlying service
                expect(data).toEqual(tdata);

                // data was cached to the MetadataTransfer object so that it can be
                // serialized to the output HTML page. 
                expect(trx.labels().length).toBe(1);
                expect(trx.get("goober")).toBe(tdata);
            },
            (err) => {  fail(err);  },
            () => {  done();  }
        );
    });
});
