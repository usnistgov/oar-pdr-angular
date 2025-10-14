import { DatafilesPubComponent } from './datafiles-pub.component';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync  } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../datacart/cart.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastrModule } from 'ngx-toastr';
import { TreeTableModule } from 'primeng/treetable';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 
import { DataCart } from '../../../datacart/cart';
import { CartConstants } from '../../../datacart/cartconstants';
import { SimpleChange } from '@angular/core';
import { AppConfig } from '../../../config/config';
import { config, testdata } from '../../../../environments/environment';
import { GoogleAnalyticsService } from '../../../shared/ga-service/google-analytics.service';

describe('DatafilesPubComponent', () => {
    let component: DatafilesPubComponent;
    let fixture: ComponentFixture<DatafilesPubComponent>;
    let dc: DataCart;
    let cfg : AppConfig = new AppConfig(null);
    cfg.loadConfig(config);

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule,
                RouterTestingModule,
                HttpClientTestingModule,
                DatafilesPubComponent,
                TreeTableModule,
                BrowserAnimationsModule,
                ToastrModule.forRoot()
            ],
            providers: [
                CartService,
                GoogleAnalyticsService,
                { provide: AppConfig, useValue: cfg },
            ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        let record: any = require('../../../../assets/sampleRecord.json');
        fixture = TestBed.createComponent(DatafilesPubComponent);
        component = fixture.componentInstance;
        component.record = record;
        component.inBrowser = true;
        component.ngOnChanges({});
        dc = DataCart.openCart(CartConstants.cartConst.GLOBAL_CART_NAME);
        dc._forget();
        fixture.detectChanges();
    });

    afterEach(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.files.length > 0).toBeTruthy();
        expect(component.fileCount).toBe(2);
        expect(component.downloadStatus).not.toBe("downloaded");
        expect(component.allInCart).toBeFalsy();
    });

    it('Should have title Files', () => {
        component.editEnabled = true;
        fixture.detectChanges();
        fakeAsync(() => {
            expect(fixture.nativeElement.querySelectorAll('#filelist-heading').length).toEqual(1);
            expect(fixture.nativeElement.querySelector('#filelist-heading').innerText).toEqual('Files ');
        });
    });

    it('Should have file tree table', () => {
        component.editEnabled = false;
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelectorAll('th').length).toBeGreaterThan(0);
    });

    it('toggleAllFilesInGlobalCart() should be called', () => {
        component.editEnabled = false;
        fixture.detectChanges();
        let cmpel = fixture.nativeElement;
        let aels = cmpel.querySelectorAll(".icon-cart")[0];
        jest.spyOn(component, 'toggleAllFilesInGlobalCart');
        aels.click();
        expect(component.toggleAllFilesInGlobalCart).toHaveBeenCalled();
    });

    it('toggleAllFilesInGlobalCart()', fakeAsync(() => {
        dc = DataCart.openCart(CartConstants.cartConst.GLOBAL_CART_NAME);
        expect(dc.size()).toBe(0);
        component.toggleAllFilesInGlobalCart();
        tick(1);
        dc.restore();
        expect(dc.size()).toBe(2);
        component.toggleAllFilesInGlobalCart()
        tick(1);
        dc.restore();
        expect(dc.size()).toBe(0);
    }));

    it('Empty display when there are no files', () => {
        let rec: any = JSON.parse(JSON.stringify(require('../../../../assets/sampleRecord.json')));
        rec['components'] = []
        let thechange = new SimpleChange(component.record, rec, false);
        component.record = rec
        component.ngOnChanges({record: thechange});
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelectorAll('#filelist-heading').length).toEqual(1);
    });

    it('Show Loading message on server-side', () => {
        component.editEnabled = false;
        fixture.detectChanges();
        expect(component.inBrowser).toBeTruthy();
        let pel = fixture.nativeElement.querySelector('p');  // Should be null
        if (pel)
            expect(pel.textContent.includes("oading file list...")).toBeFalsy();

        component.inBrowser = false;
        fixture.detectChanges();
        debugger;
        
        pel = fixture.nativeElement.querySelector('p');
        expect(pel).toBeTruthy();
        expect(pel.textContent.includes("oading file list...")).toBeTruthy();
    });

    it('_updateNodesFromCart()', waitForAsync(() => {
        let dc: DataCart = DataCart.openCart("goob");
        dc.addFile(component.ediid, component.record.components[1]);
        dc.addFile(component.ediid, component.record.components[2]);
        let status = component._updateNodesFromCart(component.files, dc);
        expect(status[0]).toBeTruthy();
        expect(status[1]).toBeFalsy();
    }));
});
