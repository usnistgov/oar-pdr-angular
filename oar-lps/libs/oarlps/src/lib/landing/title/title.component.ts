import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DescriptionPopupComponent } from '../description/description-popup/description-popup.component';
import { NotificationService } from '../../shared/notification-service/notification.service';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { LandingpageService, SectionMode, MODE, SectionHelp, HelpTopic } from '../landingpage.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
    selector: 'app-title',
    templateUrl: './title.component.html',
    styleUrls: ['./title.component.css', '../landing.component.scss'],
    animations: [
        trigger('border', [
            state('hide', style({border: '1px solid rgb(127,127,127, 0)'})),
            state('show', style({border: '1px solid rgb(127,127,127, 1)'})),
            transition('hide <=> show', animate('625ms')),
        ])
    ]
})
export class TitleComponent implements OnInit {
    @Input() record: any[];
    @Input() inBrowser: boolean;   // false if running server-side
    fieldName: string = 'title';
    editMode: string = MODE.NORNAL; 
    isEditing: boolean = false;
    backColor: string = 'white';
    originalRecord: any[];
    borderStatus: string = "show";

    constructor(public mdupdsvc: MetadataUpdateService,
        private ngbModal: NgbModal,
        public lpService: LandingpageService, 
        private notificationService: NotificationService) {
            this.lpService.watchEditing((sectionMode: SectionMode) => {
                if( sectionMode && sectionMode.section != this.fieldName && sectionMode.mode != MODE.NORNAL) {
                    if(this.isEditing){
                        this.onSave(false); // Do not refresh help text 
                    }else{
                        this.setMode(MODE.NORNAL, false);
                    }
                }
            })
    }

    test() {
        // if(this.borderStatus == "show") this.borderStatus = "hide";
        // else this.borderStatus = "show";
        this.flashBorder(false);
        setTimeout(() => {
            this.flashBorder(true);
        }, 10000);
    }

    get updated() { return this.mdupdsvc.fieldUpdated(this.fieldName); }

    ngOnInit() {
        this.originalRecord = JSON.parse(JSON.stringify(this.record));
    }

    ngOnChanges(changes: SimpleChanges): void {
        //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
        //Add '${implements OnChanges}' to the class.
        if(changes.record){
            this.originalRecord = JSON.parse(JSON.stringify(this.record));
        }
    }

    startEditing() {
        this.setMode(MODE.EDIT);
        this.isEditing = true;
    }

    cancelEditing() {
        //Replace title with saved value
        this.mdupdsvc.loadSavedSubsetFromMemory(this.fieldName).subscribe(title => {
            console.log("Load from memory", title);
            this.record['title'] = title;
        })

        this.setMode(MODE.NORNAL);
        this.isEditing = false;
        this.setBackground(this.record['title']);
    }

    onSave(refreshHelp: boolean = true) {
        console.log("this.record['title']", this.record['title']);
        console.log("this.originalRecord['title']", this.originalRecord['title']);

        if(this.record['title'] != this.originalRecord['title']) {
            var postMessage: any = {};
                postMessage[this.fieldName] = JSON.parse(JSON.stringify(this.record['title']));

            console.log("postMessage", postMessage);
            
            this.mdupdsvc.update(this.fieldName, postMessage).then((updateSuccess) => {
                if (updateSuccess)
                    this.notificationService.showSuccessWithTimeout("Title updated.", "", 3000);
                else
                    console.error("acknowledge title update failure");
            });
        }

        this.setMode(MODE.NORNAL, refreshHelp);
        this.isEditing = false;
        this.setBackground(this.record['title']);
    }
    
    /*
     *  Undo editing. If no more field was edited, delete the record in staging area.
     */
    undoEditing() {
        this.setMode(MODE.NORNAL);
        this.mdupdsvc.undo(this.fieldName).then((success) => {
            if (success)
                this.notificationService.showSuccessWithTimeout("Reverted changes to keywords.", "", 3000);
            else
                console.error("Failed to undo keywords metadata")
        });
        this.setBackground(this.record['title']);
    }

    /**
     * Set background color based on the status of title
     * if it's the same as original value (nothing changed), set background color to white.
     * Otherwise set it to light yellow.
     * @param keywords 
     */
    setBackground(title: string) {
        if(title != this.originalRecord['title']){
            this.backColor = 'var(--data-changed)';
        }else{
            this.backColor = 'white';
        }
    }

    /**
     * Set the GI to different mode
     * @param editmode edit mode to be set
     */
    setMode(editmode: string = MODE.NORNAL, refreshHelp: boolean = true) {
        let sectionMode: SectionMode = {} as SectionMode;
        this.editMode = editmode;
        sectionMode.section = this.fieldName;
        sectionMode.mode = this.editMode;

        let sectionHelp: SectionHelp = {} as SectionHelp;
        sectionHelp.section = this.fieldName;
        sectionHelp.topic = HelpTopic[this.editMode];

        if(refreshHelp){
            this.lpService.setSectionHelp(sectionHelp);
        }

        //Broadcast the current section and mode
        if(editmode != MODE.NORNAL)
            this.lpService.setEditing(sectionMode);
    }

    flash: any;

    flashBorder(stopFlash)
    { 
        if(stopFlash)
        {
            clearInterval(this.flash);
        }
        else
        {
            var borderPattern = false;
            this.flash = setInterval(setBorder,2000);

            function setBorder()
            {
                if(borderPattern)
                {
                    this.borderStatus = "hide";
                    setTimeout(() => {
                        borderPattern = false;
                    }, 0);
                    
                }
                else
                {
                    this.borderStatus = "show";
                    setTimeout(() => {
                        borderPattern = true;
                    }, 0);
                }
                console.log('this.borderStatus', this.borderStatus)
            }
        }
    }


    // openModal() {
    //     if (!this.mdupdsvc.isEditMode) return;

    //     // Broadcast the status change
    //     let sectionMode: SectionMode = {} as SectionMode;
    //     this.editMode = MODE.EDIT;
    //     sectionMode.section = this.fieldName;
    //     sectionMode.mode = this.editMode;
    //     this.lpService.setEditing(sectionMode);

    //     let ngbModalOptions: NgbModalOptions = {
    //         backdrop: 'static',
    //         keyboard: false,
    //         windowClass: "modal-mid"
    //     };

    //     let val = "";
    //     if (this.record['title'])
    //         val = this.record['title'];

    //     const modalRef = this.ngbModal.open(DescriptionPopupComponent, ngbModalOptions);

    //     modalRef.componentInstance.inputValue = {}
    //     modalRef.componentInstance.inputValue[this.fieldName] = val;
    //     modalRef.componentInstance['field'] = 'title';
    //     modalRef.componentInstance['title'] = 'Title';

    //     modalRef.componentInstance.returnValue.subscribe((returnValue) => {
    //         if (returnValue) {
    //             var postMessage: any = {};
    //             postMessage[this.fieldName] = returnValue[this.fieldName];
    //             console.log("###DBG updating title: ", JSON.stringify(postMessage));
    //             this.record['title'] = returnValue[this.fieldName];
                
    //             this.mdupdsvc.update(this.fieldName, postMessage).then((updateSuccess) => {
    //                 if (updateSuccess)
    //                     this.notificationService.showSuccessWithTimeout("Title updated.", "", 3000);
    //                 else
    //                     console.error("acknowledge title update failure");
    //             });
    //         }
    //     });
    // }

    /*
     *  Undo editing. If no more field was edited, delete the record in staging area.
     */
    // undoEditing() {
    //     this.mdupdsvc.undo(this.fieldName).then((success) => {
    //         if (success)
    //             this.notificationService.showSuccessWithTimeout("Reverted changes to title.", "", 3000);
    //         else
    //             console.error("Failed to undo title metadata")
    //     });
    // }
}
