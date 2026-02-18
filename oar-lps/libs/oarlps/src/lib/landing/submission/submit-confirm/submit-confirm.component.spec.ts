import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SubmitConfirmComponent } from './submit-confirm.component';
import { MetadataUpdateService } from '../metadataupdate.service';
import { UserMessageService } from '../../../frame/usermessage.service';
import { DAPService, createDAPService, LocalDAPService } from '../../../nerdm/dap.service';
import { EditStatusService } from '../../editcontrol/editstatus.service';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';

describe('SubmitConfirmComponent', () => {
    let component: SubmitConfirmComponent;
    let fixture: ComponentFixture<SubmitConfirmComponent>;
    let dapsvc : DAPService = new LocalDAPService();
    let edstatsvc = new EditStatusService();
        
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ SubmitConfirmComponent, BrowserAnimationsModule ],
            providers: [ 
                UserMessageService, 
                NgbActiveModal, 
                { provide: MetadataUpdateService, useValue: new MetadataUpdateService(
                                        new UserMessageService(), edstatsvc, dapsvc, null)
                                    }
            ]
        })
        .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SubmitConfirmComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
