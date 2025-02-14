/*
 * This unit test suite tests the MIDASDAPService implementation against a real running MIDAS
 * web service (not a mock).  In particular, it must be run against a the stand-alone `midasserver`
 * from the oar-pdr-py repository (https://github.com/usnistgov/oar-pdr-py), running with the 
 * filesystem backend (i.e. not the MongoDB backend).  This suite is therefore configured to be 
 * skipped unless two environment variables are set:
 * 
 *   * OAR_MIDAS_URL -- the base URL for the running MIDAS server; typically, this would be 
 *                      "https://localhost:9091".
 *   * OAR_MIDAS_DIR -- the path to the root directory of the server's data directory.  This is 
 *                      necessary to allow the `afterEach` function to clean out the backends 
 *                      contents after each test.
 *
 * Because of the need to clean up after each test, this test suite should _not_ be run against a 
 * (production-like) MIDAS service running under oar-docker.  
 *
 * To run this test suite, 
 *   1. Checkout the oar-pdr-py repository and run the midasserver by typing 
 *      `scripts/midasserver -b -D --bg midasdata start`.  (The -b and -D options builds the necessary
 *      python code and docker containers before starting; once done, it does not have to be 
 *      repeated.)
 *   2. Set the environment variables; under the bash shell, type the following:
 *          export OAR_MIDAS_URL=https://localhost:9091/midas
 *          export OAR_MIDAS_DIR=$PWD/midasdata
 *   3. Switch to your oar-pdr-angular repo and type, `npm run test:oarlps midasdap.service.spec.ts`
 *   4. When finished, you can stop the midasserver from the oar-pdr-py repository by typing, 
 *      `scripts/midasserver midasdata stop`
 */
import { TestBed } from '@angular/core/testing';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import * as nerdm from './nerdm';
import * as dapsvc from './dap.service';
import { Observable } from 'rxjs';
import * as rxjs from 'rxjs';
import * as fs from 'fs';
import { IDNotFound, PartNotFound, BadInputError, OARError } from '../errors/error';

const describeif = (cond) => { return (cond) ? describe : describe.skip; };

describeif(process.env.OAR_MIDAS_URL && process.env.OAR_MIDAS_DIR)("MIDASDAPService", () => {

    let dapep = process.env.OAR_MIDAS_URL;
    if (dapep)
        dapep += ((process.env.OAR_MIDAS_URL.endsWith("/")) ? "" : "/") + "dap/mds3";
    const token = process.env.OAR_MIDAS_TOKEN;
    const datadir = process.env.OAR_MIDAS_DIR;
    let lastseq = 0;
    let svc : dapsvc.MIDASDAPService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ HttpClientModule ]
        });
        let webcli: HttpClient = TestBed.inject(HttpClient);
        svc = (new dapsvc.MIDASDAPService(webcli)).withEndpoint(dapep).withToken(token);
    });

    afterEach(async () => {
        expect(fs).toBeTruthy();
        expect(fs.promises).toBeTruthy()
        expect(fs.promises.mkdir).toBeTruthy()
        expect(fs.promises.rm).toBeTruthy()
        //let modkeys = "fs.promises:"
        //for (let key in fs)
        //    modkeys += " "+key;
        //expect(modkeys).toEqual("what?");
        //expect(fs.rmSync).toBeTruthy()
        await fs.promises.rm(datadir+"/nerdm", {recursive: true});
        await fs.promises.rm(datadir+"/dbfiles", {recursive: true});
        await fs.promises.mkdir(datadir+"/dbfiles");
    });

    function registerID(id) {
        let n = Number(id.replace(/^mds.*0+/, ""));
        if (n > lastseq)
            lastseq = n;
    }

    it("not exists", async () => {
        expect(await svc.exists("mds3:000X").toPromise()).toBe(false);
//        expect(await svc.canEdit("mds3:000Y").toPromise()).toBe(false);
    })

    it("create/exists", async () => {
        let dap = await svc.create("goober").toPromise();
        expect(dap).toBeTruthy();
        expect(dap.recid).toEqual("mds3:0001");
        let rec = dap.getRecord();
        expect(rec.id).toEqual(dap.recid);
        expect(rec.name).toEqual("goober");
        expect(rec.owner).toEqual("anonymous");

        expect(await svc.exists(dap.recid).toPromise()).toBe(true);
        // expect(await svc.canEdit(dap.recid).toPromise()).toBe(true);

        // expect(await svc.deleteRec(dap.recid).toPromise()).toBe(true);
    });

    it("create/exists", async () => {
        let dap = await svc.create("goober").toPromise();
        expect(dap).toBeTruthy();
        expect(dap.recid).toEqual("mds3:0001");
        dap = await svc.create("goober2").toPromise();
        expect(dap).toBeTruthy();
        expect(dap.recid).toEqual("mds3:0002");

        dap = await svc.edit("mds3:0001").toPromise();
        expect(dap.recid).toEqual("mds3:0001");
        let rec = dap.getRecord();
        expect(rec.id).toEqual(dap.recid);
        expect(rec.name).toEqual("goober");
        expect(rec.owner).toEqual("anonymous");

        expect(await svc.exists(dap.recid).toPromise()).toBe(true);
    });

    it("setName", async () => {
        let dap = await svc.create("goober", {}, {title: "Solo: a Star Wars Story",
                                                  disclaimer: "Contents may be hot" }).toPromise();
        expect(dap.recid).toEqual("mds3:0001");
        expect(dap.name).toEqual("goober");
        let nerdm = await svc.getResource("mds3:0001").toPromise();
        expect(nerdm['@id']).toEqual("ark:/88434/mds3-0001");
        expect(nerdm.title).toEqual("Solo: a Star Wars Story");
        expect(nerdm.disclaimer).toEqual("Contents may be hot");

        expect(await dap.setName("gomer").toPromise()).toEqual("gomer");
        expect(dap.name).toEqual("gomer");

        nerdm = await dap.getData().toPromise();
        expect(nerdm['@id']).toEqual("ark:/88434/mds3-0001");
    });

    it("getResource/getData", async () => {
        let dap = await svc.create("goober", {}, {title: "Solo: a Star Wars Story",
                                                  disclaimer: "Contents may be hot" }).toPromise();
        expect(dap.recid).toEqual("mds3:0001");
        let nerdm = await svc.getResource("mds3:0001").toPromise();
        expect(nerdm['@id']).toEqual("ark:/88434/mds3-0001");
        expect(nerdm.title).toEqual("Solo: a Star Wars Story");
        expect(nerdm.disclaimer).toEqual("Contents may be hot");

        nerdm = await dap.getData().toPromise();
        expect(nerdm['@id']).toEqual("ark:/88434/mds3-0001");
        expect(nerdm.title).toEqual("Solo: a Star Wars Story");
        expect(nerdm.disclaimer).toEqual("Contents may be hot");

        expect(await dap.getDataSubset("title").toPromise()).toEqual("Solo: a Star Wars Story");
        expect(await dap.getDataSubset("disclaimer").toPromise()).toEqual("Contents may be hot");
        await expect(dap.getDataSubset("contactPoint").toPromise()).rejects.toThrow(PartNotFound);

        expect(await dap.updateDataSubset("contactPoint", {fn: "John Q. Nist"}).toPromise())
            .toEqual({fn: "John Q. Nist", "@type": "vcard:Contact"});
        await expect(dap.getDataSubset("contactPoint/fn").toPromise()).rejects.toThrow(OARError);
        expect(await dap.getDataSubset("contactPoint").toPromise())
            .toEqual({fn: "John Q. Nist", "@type": "vcard:Contact"});

        expect(await dap.updateDataSubset("title", "Solo").toPromise()).toEqual("Solo");
        expect(await dap.getDataSubset("title").toPromise()).toEqual("Solo");
    });

    it("add author", async () => {
        let dap = await svc.create("goober", {}, {title: "Solo: a Star Wars Story",
                                                  disclaimer: "Contents may be hot" }).toPromise();
        expect(await dap.addDataItem("authors", {familyName: "Cranston"}).toPromise())
            .toEqual({familyName: "Cranston", "@id": "auth_0", "@type": "foaf:Person"});
        expect(await dap.addDataItem("authors", {familyName: "Astin", givenName: "Alan"}).toPromise())
            .toEqual({familyName: "Astin", givenName: "Alan", "@id": "auth_1", "@type": "foaf:Person"});
        expect(await dap.updateDataItem("authors", "auth_0", {givenName: "Gurn"}).toPromise())
            .toEqual({familyName: "Cranston", givenName: "Gurn", "@id": "auth_0", "@type": "foaf:Person"});
        expect(await dap.updateDataItem("authors", "[0]", {middleName: "J"}).toPromise())
            .toEqual({familyName: "Cranston", givenName: "Gurn", middleName: "J",
                      "@id": "auth_0", "@type": "foaf:Person"});
        expect(await dap.getDataSubset("authors").toPromise()).toEqual([
            {familyName: "Cranston", givenName: "Gurn", middleName: "J",
             "@id": "auth_0", "@type": "foaf:Person"},
            {familyName: "Astin", givenName: "Alan", "@id": "auth_1", "@type": "foaf:Person"}
        ]);
    });

});
