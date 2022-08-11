import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../shared/notification-service/notification.service';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { GoogleAnalyticsService } from '../../shared/ga-service/google-analytics.service';
import { VisithomePopupComponent } from './visithome-popup/visithome-popup.component';

@Component({
    selector: 'lib-visithome',
    templateUrl: './visithome.component.html',
    styleUrls: ['./visithome.component.css']
})
export class VisithomeComponent implements OnInit {
    @Input() record: any[];
    @Input() inBrowser: boolean;   // false if running server-side
    @Input() inViewMode: boolean;

    fieldName = 'landingPage';
    
    constructor(
        public mdupdsvc : MetadataUpdateService,        
        private ngbModal: NgbModal,
        private notificationService: NotificationService,
        private gaService: GoogleAnalyticsService) { 

        
    }

    ngOnInit(): void {
    }

    /**
     * a field indicating if this data has beed edited
     */
    get updated() { return this.mdupdsvc.fieldUpdated(this.fieldName); }

    openModal() {
        if (!this.mdupdsvc.isEditMode) return;

        let ngbModalOptions: NgbModalOptions = {
            backdrop: 'static',
            keyboard: false,
            windowClass: "myCustomModalClass"
        };

        const modalRef = this.ngbModal.open(VisithomePopupComponent, ngbModalOptions);

        let val = "";
        if (this.record[this.fieldName])
            val = this.record[this.fieldName].join('\n\n');

        modalRef.componentInstance.inputValue = { };
        modalRef.componentInstance.inputValue[this.fieldName] = val;
        modalRef.componentInstance['field'] = this.fieldName;
        modalRef.componentInstance['title'] = 'Description';
        modalRef.componentInstance['message'] = 'Separate paragraphs by 2 lines.';

        modalRef.componentInstance.returnValue.subscribe((returnValue) => {
            if (returnValue) {
                // console.log("###DBG  receiving editing output: " +
                //             returnValue[this.fieldName].substring(0,20) + "....");
                let updmd = {};
                updmd[this.fieldName] = returnValue[this.fieldName].split(/\n\s*\n/).filter(desc => desc != '');
                this.mdupdsvc.update(this.fieldName, updmd).then((updateSuccess) => {
                    // console.log("###DBG  update sent; success: "+updateSuccess.toString());
                    if (updateSuccess)
                        this.notificationService.showSuccessWithTimeout("Description updated.", "", 3000);
                    else
                        console.error("acknowledge description update failure");
                });
            }
        })
    }

    /*
     *  Undo editing. If no more field was edited, delete the record in staging area.
     */
    undoEditing() {
        this.mdupdsvc.undo(this.fieldName).then((success) => {
            if (success)
                this.notificationService.showSuccessWithTimeout("Reverted changes to description.", "", 3000);
            else
                console.error("Failed to undo description metadata")
        });
    }
}
