import * as nerdm from './nerdm';
import * as dapsvc from './dap.service';
import { Observable } from 'rxjs';
import * as rxjs from 'rxjs';
import { IDNotFound, BadInputError } from '../errors/error';

describe('LocalDAPService', function() {

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



});

