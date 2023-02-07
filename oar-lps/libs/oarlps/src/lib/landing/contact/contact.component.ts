import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ContactPopupComponent } from './contact-popup/contact-popup.component';
import { NotificationService } from '../../shared/notification-service/notification.service';
import { GoogleAnalyticsService } from '../../shared/ga-service/google-analytics.service';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { ContactService } from './contact.service';
import { LandingpageService, SectionMode, MODE } from '../landingpage.service';

@Component({
    selector: 'app-contact',
    templateUrl: './contact.component.html',
    styleUrls: ['../landing.component.scss']
})
export class ContactComponent implements OnInit {
    @Input() record: any[];
    @Input() inBrowser: boolean;   // false if running server-side
    fieldName = 'contactPoint';
    editMode: string = MODE.NORNAL; 

    tempInput: any = {};
    isEmail = false;
    enableEdit = true; // Temprorarily disable edit mode for now. Can set it true to enable in the furure.

    constructor(public mdupdsvc : MetadataUpdateService,        
                private ngbModal: NgbModal,
                private gaService: GoogleAnalyticsService,
                public lpService: LandingpageService, 
                private notificationService: NotificationService,
                private contactService : ContactService)
    { }

    /**
     * a field indicating if this data has beed edited
     */
    get updated() { return this.mdupdsvc.fieldUpdated(this.fieldName); }

    email(hasEmail)
    {
        if(hasEmail == null || hasEmail == undefined)
            return "";

        let email = hasEmail.split(":");
        if(email && email.length <= 1)
            return email[0];
        else
            return email[1];
    }

    ngOnInit() {
        // if(this.record && !this.record["keyword"]) this.record["keyword"] = [];

        if (this.record['contactPoint'] && "hasEmail" in this.record['contactPoint'])
            this.isEmail = true;
    }

    getFieldStyle() {
        if (this.enableEdit) {
            return this.mdupdsvc.getFieldStyle(this.fieldName);
        }
    }
    
    openModal() {
        if (! this.mdupdsvc.isEditMode) return;

        // Broadcast the status change
        let sectionMode: SectionMode = {} as SectionMode;
        this.editMode = MODE.EDIT;
        sectionMode.section = this.fieldName;
        sectionMode.mode = this.editMode;
        this.lpService.setEditing(sectionMode);

        let ngbModalOptions: NgbModalOptions = {
            backdrop: 'static',
            keyboard: false,
            windowClass: "myCustomModalClass"
        };

        if (this.record[this.fieldName] != undefined && this.record[this.fieldName] != "") {
            this.tempInput[this.fieldName] = JSON.parse(JSON.stringify(this.record[this.fieldName]));
        } else {
            this.tempInput[this.fieldName] = [];
            this.tempInput[this.fieldName].push(this.contactService.getBlankContact());
        }

        const modalRef = this.ngbModal.open(ContactPopupComponent, ngbModalOptions);

        modalRef.componentInstance.inputValue = this.tempInput;
        modalRef.componentInstance['field'] = this.fieldName;
        modalRef.componentInstance['title'] = this.fieldName.toUpperCase();
        modalRef.componentInstance.inBrowser = this.inBrowser;

        modalRef.componentInstance.returnValue.subscribe((returnValue) => {
            if (returnValue) {
                var postMessage: any = {};
                postMessage[this.fieldName] = returnValue[this.fieldName];
                // console.log("postMessage", JSON.stringify(postMessage));
                this.record[this.fieldName] = returnValue[this.fieldName];
                
                this.mdupdsvc.update(this.fieldName, postMessage).then((updateSuccess) => {
                    // console.log("###DBG  update sent; success: "+updateSuccess.toString());
                    if (updateSuccess)
                        this.notificationService.showSuccessWithTimeout("Contact updated.", "", 3000);
                    else
                        console.error("acknowledge contact update failure");
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
                this.notificationService.showSuccessWithTimeout("Reverted changes to keywords.", "", 3000);
            else
                console.error("Failed to undo keywords metadata")
        });
    }

    clickContact = false;
    expandContact() {
        this.clickContact = !this.clickContact;
        return this.clickContact;
    }
}
