import * as nerdm from './nerdm';
import * as nerdsvc from './nerdm.service';
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
        t2.subscribe((data) => { expect(data).toBeUndefined(); },
                     (err)  => { fail(err);  });

        rxjs.merge(t1, t2).subscribe(null, null, () => { done(); });
    });

});

class FailingResourceService extends nerdsvc.NERDmResourceService {
    getResource(id : string) : Observable<nerdm.NerdmRes> {
        throw new Error("delegate service resorted to.");
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

    it('getResource() via delegate', function() {
        expect(() => { svc.getResource("gomer") }).toThrowError();
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

    it('getResource() via delegate', function() {
        trx.set("goober", tdata);
        svc = new nerdsvc.TransmittingResourceService(new FailingResourceService(), trx);

        expect(() => { svc.getResource("gomer") }).toThrowError();
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
