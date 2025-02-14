import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import * as nerdm from './nerdm';
import * as dapsvc from './dap.service';
import { Observable } from 'rxjs';
import * as rxjs from 'rxjs';
import { IDNotFound, BadInputError } from '../errors/error';

describe('LocalDAPService/LocalDAPUpdateService', function() {

    let svc : dapsvc.LocalDAPService;

    beforeEach(() => {
        svc = new dapsvc.LocalDAPService();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it("exists and deleteRec", async () => {
        expect(svc.store.getItem("goober")).toBeNull();
        expect(await svc.exists("goober").toPromise()).toBeFalsy();
        await expect(svc.deleteRec("goober").toPromise()).rejects.toThrow(IDNotFound);
        svc.store.setItem("goober", "a");
        expect(await svc.exists("goober").toPromise()).toBe(true);
        expect(await svc.deleteRec("goober").toPromise()).toBe(true);
        expect(svc.store.getItem("goober")).toBeNull();
        expect(await svc.exists("goober").toPromise()).toBeFalsy();
    });

    it("canEdit", async () => {
        expect(await svc.canEdit("goober").toPromise()).toBe(false);
        svc.store.setItem("goober", "a");
        expect(await svc.canEdit("goober").toPromise()).toBe(true);
    });

    it("_name_exists", () => {
        expect(svc._name_exists("goober")).toBeFalsy();
        svc.store.setItem("gurn", '{"id":"gurn","name":"goober"}');
        svc.store.setItem("gary", '{"id":"gary","name":"cooper"}');
        svc.store.setItem("super", '{"id":"super","name":"dooper"}');
        expect(svc._name_exists("goober")).toBe(true);
        expect(svc._name_exists("bluchar")).toBeFalsy();
    });

    it("_new_id", () => {
        expect(svc._newid()).toEqual("mds3:0001");
        expect(svc._newid()).toEqual("mds3:0002");
        expect(svc._newid()).toEqual("mds3:0003");
        expect(svc._newid()).toEqual("mds3:0004");
        expect(svc._newid()).toEqual("mds3:0005");
        expect(svc._newid()).toEqual("mds3:0006");
        expect(svc._newid()).toEqual("mds3:0007");
        expect(svc._newid()).toEqual("mds3:0008");
        expect(svc._newid()).toEqual("mds3:0009");
        expect(svc._newid()).toEqual("mds3:0010");
        expect(svc._newid()).toEqual("mds3:0011");
    });

    it("_initialize", () => {
        let req: dapsvc.DAPRecordRequest = svc._initialize({"name": "goober","meta":{},"data":{},"id":"a:b"})
        expect(req.name).toEqual("goober");
        expect(req.data.title).toEqual("");
        expect(req.id).toEqual("a:b");
        expect(req.data["@id"]).toEqual("ark:/88434/a-b");
        expect(req.data["contactPoint"]).toBeTruthy();
        expect(req.data["@type"][0]).toEqual("nrd:Resource");

        req = svc._initialize({"name": "goober","meta":{"resourceType":"software"},"data":{},"id":"a:b"})
        expect(req.name).toEqual("goober");
        expect(req.data.title).toEqual("");
        expect(req.id).toEqual("a:b");
        expect(req.data["@id"]).toEqual("ark:/88434/a-b");
        expect(req.data["contactPoint"]).toBeTruthy();
        expect(req.data["@type"][0]).toEqual("nrdw:SoftwarePublication");
    });
       
    it("create/edit", async () => {
        expect(await svc.exists("mds3:0001").toPromise()).toBeFalsy();

        let dap: dapsvc.DAPUpdateService = await svc.create("goober").toPromise();
        expect(dap).toBeTruthy();
        expect(dap.recid).toEqual("mds3:0001");
        let rec: dapsvc.DAPRecord = dap.getRecord();
        expect(rec.id).toEqual("mds3:0001");
        expect(rec.name).toEqual("goober");
        expect(rec.data['@id']).toEqual("ark:/88434/mds3-0001")
        expect(rec.data["contactPoint"]).toBeTruthy();
        expect(rec.data["@type"][0]).toEqual("nrd:Resource");

        expect(await svc.exists("mds3:0001").toPromise()).toBe(true);

        dap = await svc.create("gurn", {"resourceType":"software"}).toPromise();
        expect(dap).toBeTruthy();
        expect(dap.recid).toEqual("mds3:0002");
        rec = dap.getRecord();
        expect(rec.id).toEqual("mds3:0002");
        expect(rec.name).toEqual("gurn");
        expect(rec.data['@id']).toEqual("ark:/88434/mds3-0002")
        expect(rec.data["contactPoint"]).toBeTruthy();
        expect(rec.data["@type"][0]).toEqual("nrdw:SoftwarePublication");

        expect(await svc.exists("mds3:0001").toPromise()).toBe(true);
        expect(await svc.exists("mds3:0002").toPromise()).toBe(true);

        expect(await svc.deleteRec("mds3:0001").toPromise()).toBe(true);
        expect(await svc.exists("mds3:0001").toPromise()).toBeFalsy();
        expect(await svc.exists("mds3:0002").toPromise()).toBe(true);

        dap = await svc.edit("mds3:0002").toPromise();
        expect(dap).toBeTruthy();
        expect(dap.recid).toEqual("mds3:0002");
        rec = dap.getRecord();
        expect(rec.id).toEqual("mds3:0002");
        expect(rec.name).toEqual("gurn");

        await expect(svc.edit("mds3:0001").toPromise()).rejects.toThrow(IDNotFound);
        await expect(svc.create("gurn").toPromise()).rejects.toThrow(BadInputError);
    });

    it("getResource", async () => {
        await svc.create("goober",{},{title:"It's me!"}).toPromise();
        let data = await svc.getResource("mds3:0001").toPromise();
        expect(data["@id"]).toEqual("ark:/88434/mds3-0001");
        expect(data["title"]).toEqual("It's me!");
    });

    it("getData", async () => {
        let dap: dapsvc.DAPUpdateService = await svc.create("goober",{},{title:"It's me!"}).toPromise();
        let data = await dap.getData().toPromise();
        expect(data["@id"]).toEqual("ark:/88434/mds3-0001");
        expect(data["title"]).toEqual("It's me!");
    });

    it("getDataSubset", async () => {
        let dap: dapsvc.DAPUpdateService = await svc.create("goober",{},{title:"It's me!"}).toPromise();
        let data = await dap.getDataSubset("title").toPromise();
        expect(data).toEqual("It's me!");
        data = await dap.getDataSubset("contactPoint/fn").toPromise();
        expect(data).toEqual("John Q. Nist");
        data = await dap.getDataSubset("contactPoint").toPromise();
        expect(data).toEqual({hasEmail: "mailto:jqn@nist.gov", fn: "John Q. Nist"});
    });

    it("setDataSubset", async () => {
        let dap: dapsvc.DAPUpdateService = await svc.create("goober",{},{title:"It's me!"}).toPromise();
        let data = await dap.setDataSubset("title", "Hazah!").toPromise();
        expect(data).toEqual("Hazah!");
        data = await dap.setDataSubset("goober", "gurn").toPromise();
        expect(data).toEqual("gurn");
        data = await dap.getData().toPromise();
        expect(data["goober"]).toEqual("gurn");
        data = await dap.setDataSubset("contactPoint/fn", "Gurn Cranston").toPromise();
        expect(data).toEqual("Gurn Cranston");
        data = await dap.getDataSubset("contactPoint").toPromise();
        expect(data).toEqual({hasEmail: "mailto:jqn@nist.gov", fn: "Gurn Cranston"});
        let cp = {hasEmail: "mailto:ava1@nist.gov", fn: "Alan V. Astin"}
        data = await dap.setDataSubset("contactPoint", cp).toPromise();
        expect(data).toEqual(cp);
        data = await dap.getData().toPromise();
        expect(data["contactPoint"]).toEqual(cp);
    });

    it("updateDataSubset", async () => {
        let dap: dapsvc.DAPUpdateService = await svc.create("goober",{},{title:"It's me!"}).toPromise();
        let data = await dap.updateDataSubset("title", "Hazah!").toPromise();
        expect(data).toEqual("Hazah!");
        data = await dap.updateDataSubset("goober", "gurn").toPromise();
        expect(data).toEqual("gurn");
        data = await dap.getData().toPromise();
        expect(data["goober"]).toEqual("gurn");

        data = await dap.updateDataSubset("contactPoint", {"fn": "Gurn Cranston"}).toPromise();
        expect(data).toEqual({hasEmail: "mailto:jqn@nist.gov", fn: "Gurn Cranston"});

        let cp = {hasEmail: "mailto:ava1@nist.gov", fn: "Alan V. Astin"}
        data = await dap.updateDataSubset("contactPoint", cp).toPromise();
        expect(data).toEqual(cp);
        data = await dap.getData().toPromise();
        expect(data["contactPoint"]).toEqual(cp);
    });

    it("setName", async () => {
        let dap: dapsvc.DAPUpdateService = await svc.create("goober").toPromise();

        expect(dap.name).toEqual("goober");
        expect(dap.getRecord().name).toEqual("goober");
        expect(await dap.setName("gurn").toPromise()).toEqual("gurn");
        expect(dap.name).toEqual("gurn");
        expect(dap.getRecord().name).toEqual("gurn");
    });

});

describe("MIDASDAPService/MIDASDAPUpdateService", function() {

    let ep: string = "https://pdr.org/midas/dap"
    let svc : dapsvc.MIDASDAPService;
    let httpmock: HttpTestingController;

    let user = "ava1";
    let baserec : dapsvc.DAPRecord = {
        name: "",
        id: "mds3:0001",
        owner: user,
        acls: {
            read: [ user ], write: [ user ], "delete": [ user ], admin: [ user ]
        },
        data: {
            "@id": "ark:/88434/mds3-0001",
            doi: "doi:10.18434/mds3-0001",
            title: "",
            contactPoint: { fn: "Astin, Alan V", hasEmail: "mailto:alan.astin@nist.gov" }
        },
        meta: {
        }
    }

    function newrec(name, meta = {}, data = {}) {
        let out = JSON.parse(JSON.stringify(baserec));
        out.name = name;
        out.meta = meta;
        for (const prop in data)
            out.data[prop] = data[prop]
        if (out.data["title"] === undefined)
            out.data["title"] = "";
        return out;
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ HttpClientTestingModule ]
        });
        let webcli: HttpClient = TestBed.inject(HttpClient);
        httpmock = TestBed.inject(HttpTestingController);
        svc = new dapsvc.MIDASDAPService(ep, webcli, "XXX");
    });

    afterEach(() => {
        // After every test, assert that there are no more pending requests.
        // This throws an error if there are any requests that haven't been flushed yet.
        httpmock.verify();
    });

    it("exists", async () => {
        let p : Promise<boolean> = svc.exists("mds3:000X").toPromise();
        let req = httpmock.expectOne(ep+"/mds3:000X");

        expect(req.request.method).toBe('HEAD');
        req.flush("", { status: 404, statusText: "Not Found" });

        expect(await p).toBe(false);

        p = svc.exists("mds3:000Y").toPromise();
        req = httpmock.expectOne(ep+"/mds3:000Y");

        expect(req.request.method).toBe('HEAD');
        req.flush("", { status: 200, statusText: "OK" });

        expect(await p).toBe(true);
    });

    it("deleteRec", async () => {
        let p : Promise<boolean> = svc.deleteRec("mds3:000X").toPromise();
        let req = httpmock.expectOne(ep+"/mds3:000X");
        expect(req.request.method).toBe('DELETE');
        req.flush("", { status: 404, statusText: "Not Found" });

        await expect(p).rejects.toThrow(IDNotFound);

        p = svc.deleteRec("mds3:000Y").toPromise();
        req = httpmock.expectOne(ep+"/mds3:000Y");

        expect(req.request.method).toBe('DELETE');
        req.flush("", { status: 200, statusText: "OK" });

        expect(await p).toBe(true);
    });

    it("canEdit", async () => {
        let p : Promise<boolean> = svc.canEdit("mds3:000X").toPromise();
        let req = httpmock.expectOne(ep+"/mds3:000X/acls/:user");
        expect(req.request.method).toBe('GET');
        req.flush(true, { status: 404, statusText: "Not Found" });
        expect(await p).toBe(false);

        p = svc.canEdit("mds3:000Y").toPromise();
        req = httpmock.expectOne(ep+"/mds3:000Y/acls/:user");
        expect(req.request.method).toBe('GET');
        req.flush(true);
        expect(await p).toBe(true);
    });

    it("create", async () => {
        let pc = svc.create("goober").toPromise();
        let req = httpmock.expectOne(ep);
        expect(req.request.method).toBe('POST');
        expect(req.request.body["name"]).toEqual("goober");
        expect(req.request.body["data"]).toBeUndefined();
        expect(req.request.body["meta"]).toBeUndefined();
        req.flush(newrec("goober"));
        let dap: dapsvc.DAPUpdateService = await pc;

        expect(dap.getRecord().name).toEqual("goober");
        expect(dap.name).toEqual("goober");
        expect(dap.recid).toEqual("mds3:0001");
        expect(dap.getRecord().owner).toEqual("ava1");
        expect(dap.getRecord().data["title"]).toEqual("");

        let meta = {creatorIsContact: true};
        pc = svc.create("goober", meta).toPromise();
        req = httpmock.expectOne(ep);
        expect(req.request.method).toBe('POST');
        expect(req.request.body["name"]).toEqual("goober");
        expect(req.request.body["data"]).toBeUndefined();
        expect(req.request.body["meta"]).toEqual({creatorIsContact: true});
        req.flush(newrec("goober", meta));
        dap = await pc;

        expect(dap.getRecord().name).toEqual("goober");
        expect(dap.name).toEqual("goober");
        expect(dap.recid).toEqual("mds3:0001");
        expect(dap.getRecord().owner).toEqual("ava1");
        expect(dap.getRecord().data["title"]).toEqual("");

        let data = {title: "Hazah!"};
        pc = svc.create("goober", meta, data).toPromise();
        req = httpmock.expectOne(ep);
        expect(req.request.method).toBe('POST');
        expect(req.request.body["name"]).toEqual("goober");
        expect(req.request.body["data"]).toEqual({title: "Hazah!"});
        expect(req.request.body["meta"]).toEqual({creatorIsContact: true});
        req.flush(newrec("goober", meta, data));
        dap = await pc;

        expect(dap.getRecord().name).toEqual("goober");
        expect(dap.name).toEqual("goober");
        expect(dap.recid).toEqual("mds3:0001");
        expect(dap.getRecord().owner).toEqual("ava1");
        expect(dap.getRecord().data["title"]).toEqual("Hazah!");
    });

    it("edit", async () => {
        let pc = svc.edit("mds3:0001").toPromise();
        let req = httpmock.expectOne(ep+"/mds3:0001");
        expect(req.request.method).toBe('GET');
        req.flush(newrec("goober"));
        let dap: dapsvc.DAPUpdateService = await pc;

        expect(dap.getRecord().name).toEqual("goober");
        expect(dap.name).toEqual("goober");

        pc = svc.edit("mds3:0019").toPromise();
        req = httpmock.expectOne(ep+"/mds3:0019");
        expect(req.request.method).toBe('GET');
        req.flush({}, {status: 404, statusText: "ID Not Found"});
        
    });

    it("getResource", async () => {
        let p = svc.getResource("mds3:0001").toPromise();
        let req = httpmock.expectOne(ep+"/mds3:0001/data");
        expect(req.request.method).toBe('GET');
        req.flush({"@id": "ark:/88434/mds3-0001", title: "It's me!"});

        let data = await p;
        expect(data["@id"]).toEqual("ark:/88434/mds3-0001");
        expect(data["title"]).toEqual("It's me!");

        p = svc.getResource("mds3:0019").toPromise();
        req = httpmock.expectOne(ep+"/mds3:0019/data");
        expect(req.request.method).toBe('GET');
        req.flush({}, {status: 404, statusText: "ID Not Found"});
        
        await expect(p).rejects.toThrow(IDNotFound);
    });

    it("getData", async () => {
        let meta = {creatorIsContact: true};
        let data = {title: "Hazah!"};
        let pc = svc.create("goober", meta, data).toPromise();
        let req = httpmock.expectOne(ep);
        req.flush(newrec("goober", meta, data));
        let dap: dapsvc.DAPUpdateService = await pc;

        let p = dap.getData().toPromise();
        req = httpmock.expectOne(ep+"/mds3:0001/data");
        expect(req.request.method).toBe('GET');
        req.flush(dap.getRecord().data);
        data = await p;
        expect(data["@id"]).toEqual("ark:/88434/mds3-0001");
        expect(data["title"]).toEqual("Hazah!");
    });

    it("getDataSubset", async () => {
        let meta = {creatorIsContact: true};
        let data = {title: "Hazah!"};
        let pc = svc.create("goober", meta, data).toPromise();
        let req = httpmock.expectOne(ep);
        req.flush(newrec("goober", meta, data));
        let dap: dapsvc.DAPUpdateService = await pc;

        let p = dap.getDataSubset("title").toPromise();
        req = httpmock.expectOne(ep+"/mds3:0001/data/title");
        expect(req.request.method).toEqual("GET");
        req.flush(dap.getRecord().data["title"]);
        expect(await p).toEqual("Hazah!");

        p = dap.getDataSubset("contactPoint/fn").toPromise();
        req = httpmock.expectOne(ep+"/mds3:0001/data/contactPoint/fn");
        req.flush(dap.getRecord().data["contactPoint"]["fn"]);
        expect(await p).toEqual("Astin, Alan V");
    });

    it("setDataSubset", async () => {
        let pc = svc.create("goober").toPromise();
        let req = httpmock.expectOne(ep);
        req.flush(newrec("goober"));
        let dap: dapsvc.DAPUpdateService = await pc;

        let p = dap.setDataSubset("title", "Hazah!").toPromise();
        req = httpmock.expectOne(ep+"/mds3:0001/data/title");
        expect(req.request.method).toBe('PUT');
        req.flush("Hazah!");
        expect(await p).toEqual("Hazah!");

        let cp = {hasEmail: "mailto:goober@gurn.edu", fn: "Gurn Cranston"};
        p = dap.setDataSubset("contactPoint/fn", cp["hasEmail"]).toPromise();
        req = httpmock.expectOne(ep+"/mds3:0001/data/contactPoint/fn");
        req.flush(cp["hasEmail"])
        expect(await p).toEqual(cp["hasEmail"]);

        p = dap.setDataSubset("contactPoint", cp).toPromise();
        req = httpmock.expectOne(ep+"/mds3:0001/data/contactPoint");
        req.flush(cp)
        expect(await p).toEqual(cp);
    });

    it("updateDataSubset", async () => {
        let pc = svc.create("goober").toPromise();
        let req = httpmock.expectOne(ep);
        req.flush(newrec("goober"));
        let dap: dapsvc.DAPUpdateService = await pc;

        let p = dap.updateDataSubset("title", "Hazah!").toPromise();
        req = httpmock.expectOne(ep+"/mds3:0001/data/title");
        expect(req.request.method).toBe('PATCH');
        req.flush("Hazah!");
        expect(await p).toEqual("Hazah!");
    });

    it("setName", async () => {
        let pc = svc.create("goober").toPromise();
        let req = httpmock.expectOne(ep);
        expect(req.request.method).toBe('POST');
        req.flush(newrec("goober"));
        let dap: dapsvc.DAPUpdateService = await pc;

        expect(dap.getRecord().name).toEqual("goober");
        expect(dap.name).toEqual("goober");

        let p = dap.setName("gurn").toPromise();
        req = httpmock.expectOne(ep+"/mds3:0001/name");
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual('"gurn"');
        req.flush("gurn");
        expect(await p).toEqual("gurn");

        expect(dap.name).toEqual("gurn");
        expect(dap.getRecord().name).toEqual("gurn");
    });
    

});
