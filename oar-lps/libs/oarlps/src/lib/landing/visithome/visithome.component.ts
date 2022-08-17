import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../shared/notification-service/notification.service';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { GoogleAnalyticsService } from '../../shared/ga-service/google-analytics.service';
import { VisithomePopupComponent } from './visithome-popup/visithome-popup.component';
import { Themes, ThemesPrefs, AppSettings } from '../../shared/globals/globals';

@Component({
    selector: 'app-visithome',
    templateUrl: './visithome.component.html',
    styleUrls: ['./visithome.component.css', '../landing.component.css']
})
export class VisithomeComponent implements OnInit {
    @Input() record: any[];
    @Input() inBrowser: boolean;   // false if running server-side
    @Input() inViewMode: boolean;
    @Input() theme: string;

    fieldName = 'landingPage';
    scienceTheme = Themes.SCIENCE_THEME;
    
    constructor(
        public mdupdsvc : MetadataUpdateService,        
        private ngbModal: NgbModal,
        private notificationService: NotificationService,
        private gaService: GoogleAnalyticsService) { 

        
    }

    ngOnInit(): void {
        console.log("this.record", this.record);
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

        modalRef.componentInstance.inputValue = { };
        modalRef.componentInstance.inputValue[this.fieldName] = this.record[this.fieldName];
        modalRef.componentInstance['field'] = this.fieldName;
        modalRef.componentInstance['title'] = 'Landingpage URL';
        modalRef.componentInstance['message'] = '';

        modalRef.componentInstance.returnValue.subscribe((returnValue) => {
            if (returnValue) {
                console.log("returnValue[this.fieldName]", returnValue[this.fieldName]);
                this.record[this.fieldName] = returnValue[this.fieldName];
                this.mdupdsvc.update(this.fieldName, returnValue[this.fieldName]).then((updateSuccess) => {
                    // console.log("###DBG  update sent; success: "+updateSuccess.toString());
                    if (updateSuccess)
                        this.notificationService.showSuccessWithTimeout(this.fieldName + " updated.", "", 3000);
                    else
                        console.error("Updating " + this.fieldName + " failed.");
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
                this.notificationService.showSuccessWithTimeout("Reverted changes to landingpage.", "", 3000);
            else
                console.error("Failed to undo landingpage metadata")
        });
    }

    /**
     * Return visit homepage button style
     * @returns 
     */
    visitHomePageBtnStyle() {
        if(this.theme == this.scienceTheme) {
            return "var(--science-theme-background-default)";
        }else{
            return "var(--nist-green-default)";
        }
    }

    /**
     * Google Analytics track event
     * @param url - URL that user visit
     * @param event - action event
     * @param title - action title
     */
    googleAnalytics(url: string, event, title) {
        this.gaService.gaTrackEvent('homepage', event, title, url);
    }
}
