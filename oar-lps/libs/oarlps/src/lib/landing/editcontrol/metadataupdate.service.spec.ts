import { ComponentFixture, TestBed, waitForAsync  } from '@angular/core/testing';
import { CommonModule, DatePipe } from '@angular/common';
import { map, tap, of, throwError } from 'rxjs';

import { MetadataUpdateService } from './metadataupdate.service';
import { UserMessageService } from '../../frame/usermessage.service';
import { DAPService, LocalDAPService, MIDASDAPUpdateService } from '../../nerdm/dap.service';
import { NerdmRes } from '../../nerdm/nerdm';
import { EditStatusService } from './editstatus.service';
import { AppConfig } from '../../config/config'
import { config } from '../../../environments/environment'

import { testdata } from '../../../environments/environment';
import { UpdateDetails } from './interfaces';
import { fakeAsync, tick } from '@angular/core/testing';

describe('MetadataUpdateService', () => {

    let rec : NerdmRes = testdata['test1'];
    let resmd : NerdmRes = null;
    let svc : MetadataUpdateService = null;
    let edstatsvc : EditStatusService;
    let dapsvc : DAPService = new LocalDAPService();

    let subscriber = {
        next: (md) => {
            resmd = md;
        }
    };

    beforeEach(waitForAsync(() => {
        resmd = null;
        TestBed.configureTestingModule({
            imports: [ CommonModule ],
            providers: [ DatePipe ]
        });

        let dp : DatePipe = TestBed.inject(DatePipe);
        let cfgdata = JSON.parse(JSON.stringify(config));
        edstatsvc = new EditStatusService();

        svc = new MetadataUpdateService(new UserMessageService(), edstatsvc, dapsvc, dp);
        debugger;
        dapsvc.create("testrec", {}, rec).subscribe((x) => {
            debugger;
            svc.startEditing(x.recid).subscribe((y) => {

            }); 
        })

        // debugger;
        // dapsvc.create("testrec", {}, rec).pipe(
        //     map((updater) => { 
        //         debugger;
        //         return updater.recid; 
        //     }),
        //     tap((id) => { 
        //         debugger;
        //         svc.startEditing(id); 
        //     })
        // );
    }));

    afterEach(() => {
        localStorage.clear();
    });

    it('returns initial draft metadata', () => {
        var md = null;
        debugger;
        svc.subscribe({
            next: (res) => { debugger; md = res; },
            error: (err) => { throw err; }
        }); 
        svc.loadDraft().subscribe(
            (md) => {
                debugger;
                expect(md['title']).toContain("Multiple Encounter");
                expect(md['accessLevel']).toBe("public");
                expect(Object.keys(md)).not.toContain("goober");
        });
    });

    it('updates metadata', () => {
        let upd : UpdateDetails = null;
        resmd = testdata['test1'];
        expect(resmd['title']).toContain("Multiple Encounter");
        expect(resmd['accessLevel']).toBe("public");

        expect(svc.fieldUpdated('gurn')).toBeFalsy();
        svc.updated.subscribe((res) => { upd = res; });
        expect(upd).toBeNull();
        expect(svc.lastUpdate).toEqual({} as UpdateDetails);

        var md = null;
        svc.cacheMetadata(resmd);


        debugger
        svc.update('gurn', {'goober': "gurn", 'title': "Dr."});
        svc.subscribe({
            next: (res) => { 
                debugger; 
                md = res; 
                expect(md['title']).toBe("Dr.");
                expect(md['accessLevel']).toBe("public");
                expect(md['goober']).toBe("gurn");
        
                expect(svc.fieldUpdated('gurn')).toBeTruthy();
                expect(upd).toBeTruthy();
                expect(svc.lastUpdate).not.toBe({} as UpdateDetails);
            },
            error: (err) => { debugger; throw err; }
        }); 

    });

    it('undo()', () => {
        expect(svc.fieldUpdated('gurn')).toBeFalsy();

        var md = null;
        svc.cacheMetadata(rec);

        svc.update('gurn', {'goober': "gurn", 'title': "Dr."});
        svc.subscribe({
            next: (res) => { 
                md = res; 

                expect(svc.fieldUpdated('gurn')).toBeTruthy();
                expect(md['title']).toBe("Dr.");
                expect(md['goober']).toBe("gurn");
                expect(md['description'].length).toEqual(1);
                svc.update("description", { description: rec['description'].concat(['Hah!']) });
                expect(md['description'].length).toEqual(2);
                expect(md['description'][1]).toEqual("Hah!");
        
                svc.undo('gurn');
                expect(svc.fieldUpdated('gurn')).toBeFalsy();
                expect(md['goober']).toBe(null);
                expect(md['title']).toContain("Multiple Encounter");
                expect(md['description'].length).toEqual(2);
                expect(md['description'][1]).toEqual("Hah!");
            },
            error: (err) => { throw err; }
        }); 


        
    });

    it('final undo()', () => {
        expect(svc.fieldUpdated('gurn')).toBeFalsy();

        var md = null;
        svc.cacheMetadata(rec);
        svc.subscribe({
            next: (res) => { 
                md = res; 

                expect(svc.fieldUpdated('gurn')).toBeTruthy();
                expect(md['title']).toBe("Dr.");
        
                svc.undo('gurn');
                expect(svc.fieldUpdated('gurn')).toBeFalsy();
                expect(md['goober']).toBe(undefined);
                expect(md['title']).toContain("Multiple Encounter");
            },
            error: (err) => { throw err; }
        }); 
        svc.update('gurn', {'goober': "gurn", 'title': "Dr."});

        
    });

});
