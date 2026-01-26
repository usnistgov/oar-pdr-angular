import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { Reference } from '../reference';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { HttpClient } from "@angular/common/http";
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RefAuthorComponent } from '../ref-author/ref-author.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TextEditComponent } from '../../../text-edit/text-edit.component';
import { ButtonModule } from 'primeng/button';				
import { TooltipModule } from 'primeng/tooltip';
import { AppConfig } from '../../../config/config';
import { AuthenticationService } from 'oarng';
import { iconClass } from '../../../shared/globals/globals';
import { SingleMsgBarComponent } from '../../../shared/single-msg-bar/single-msg-bar.component';

@Component({
    selector: 'lib-ref-edit',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        TooltipModule,
        TextEditComponent,
        NgbModule,
        RefAuthorComponent,
        SingleMsgBarComponent
    ],
    templateUrl: './ref-edit.component.html',
    styleUrls: ['../../landing.component.scss', './ref-edit.component.css'],
    animations: [
        trigger('editExpand', [
        state('collapsed', style({height: '0px', minHeight: '0'})),
        state('expanded', style({height: '*'})),
        transition('expanded <=> collapsed', animate('625ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ])
    ]
})
export class RefEditComponent implements OnInit {
    originalRef: Reference = {} as Reference;
    defaultText: string = "Enter citation here";
    reftype: string = "1";
    fieldName: string = 'references';
    
    // Input method. 1 = DOI, 2=Ref data, 3=Citation text
    inputMethod: string = "2"; 

    // contentCollapsed: boolean = true;
    citationLocked: boolean = false;
    editBlockStatus: string = 'collapsed';

    showAllFields: boolean = false;
    ref: Reference = {} as Reference;

    //icon class names
    editIcon = iconClass.EDIT;
    closeIcon = iconClass.CLOSE;
    saveIcon = iconClass.SAVE;
    cancelIcon = iconClass.CANCEL;
    undoIcon = iconClass.UNDO;
    deleteIcon = iconClass.DELETE;
    doiEndpoint: string = "";
    doiLoaded: boolean = false;
    authToken: string = "";
    errMessage: string

    @Input() currentRef: Reference = {} as Reference;
    @Input() editMode: string = "edit";
    @Input() forceReset: boolean = false;
    @Output() dataChanged: EventEmitter<any> = new EventEmitter();
    @Output() cmdOutput: EventEmitter<any> = new EventEmitter();

    constructor(
        private httpClient: HttpClient, 
        private chref: ChangeDetectorRef,  
        private cfg: AppConfig,
        public authsvc: AuthenticationService,
        public mdupdsvc: MetadataUpdateService) { 
            this.doiEndpoint = cfg.get<string>("dapEditing.doiEndpoint", "/midas/doi/2nerdm/ref/");
        
            this.authsvc.getCredentials().subscribe(
                (creds) => {
                    this.authToken = creds.token;
                }
            )
        }

    ngOnInit(): void {
        if(this.isEditing) this.showAllFields = true;
        if(this.currentRef) {
            this.originalRef = JSON.parse(JSON.stringify(this.currentRef));
            this.ref = JSON.parse(JSON.stringify(this.currentRef));
            this.reftype = this.currentRef.refType == "IsSupplementTo" ? "1" : "2" ;
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
        //Add '${implements OnChanges}' to the class.
        if(changes.editMode && changes.editMode.currentValue == "normal") {
            this.reset();
        }

        if(changes.currentRef) {
            if(this.currentRef) {
                this.originalRef = JSON.parse(JSON.stringify(this.currentRef));
                this.ref = JSON.parse(JSON.stringify(this.currentRef));
                this.reftype = this.originalRef.refType == "IsSupplementTo" ? "1" : "2" ;
            }else{
                this.originalRef = undefined;
                this.ref = {} as Reference;
            }
        }

        this.chref.detectChanges();
    }

    get isEditing() { return this.editMode=="edit" };
    get isAdding() { return this.editMode=="add" };
    get useDOI() { return this.inputMethod == "1" };
    get useRefData() { return this.inputMethod == "2" };
    get useCitationData() { return this.inputMethod == "3" };

    /**
     * When edit block expanded, set overflow to visible so tooltip can be seen.
     * @returns 
     */
    getAuthorStyle() {
        if(this.editBlockStatus == 'collapsed')
            return {'overflow': 'hidden'};
        else{
            return {'overflow': 'visible'};
        }
    }

    reset() {
        this.inputMethod = "2"; 

        this.citationLocked = false;
        this.editBlockStatus = 'collapsed';
        this.doiLoaded = false;
    
        this.showAllFields = false; // Show all fields but doi
     
        this.chref.detectChanges();
    }

    onChange(updateCitation:boolean = false) {
        this.ref.dataChanged = true;

        if(updateCitation) this.updateCitation();

        this.dataChanged.emit({"ref": this.ref, "dataChanged": true});
    }

    onReftypeChanged(event) {
        this.ref.refType = event.target.value=="1" ? "IsSupplementTo" : "References";
        this.onChange(false);
    }

    /**
     * On DOI field changed, fetch ref data from backend then populate ref data.
     * Set this.refDataPopulated to true.
     */
    onDoiChange(event) {
        this.ref.doi = event.value;

        // Remove the beginning slash if any
        if (this.ref.doi.startsWith("/")) this.ref.doi = this.ref.doi.slice(1);

        const url = this.doiEndpoint + this.ref.doi;
        const hdrs = {"Accept":"application/json", "Authorization":"Bearer " + this.authToken};

        this.httpClient.get(url, {headers: hdrs}).subscribe(
            data => {
                if (data["pdr:comment"] && data["pdr:comment"] == "DOI does not exist yet") {
                    this.errMessage = "DOI not found: " + this.ref.doi;
                    
                    // Show "Reference data interface" 
                    this.citationLocked = false;
                    this.showAllFields = true;
                } else {
                    let doi = this.ref.doi;
                    this.ref = JSON.parse(JSON.stringify(data)) as Reference;
                    if (!this.ref.doi) this.ref.doi = doi;
                    
                    this.citationLocked = true;
                    this.onChange(true);
                    this.showAllFields = false;
                    this.doiLoaded = true;
                }
            },
            err => { 
                let msg = err.message || err.statusText;
                if (err.status) {
                    if (err.status == 404) 
                        this.errMessage = "DOI not found: " + this.ref.doi;
                    if (err.status == 401) 
                        this.errMessage = "Unauthorized access. Please login again.";
                    if (err.status > 500) 
                        this.errMessage = "Server error occurred when retrieving DOI data: " + this.ref.doi;
                    else 
                        this.errMessage = "Unexpected resolver response: " + err.message +" (" +
                                                  err.status + ")";
                }
                else if (err.status == 0) 
                    this.errMessage = "Unexpected communication error: " + err.message + ".";
                else
                    this.errMessage = "Unexected error during retrieval from URL (" + 
                        url + "): " + err.toString();
                
                console.warn(err.message + " DOI:" + this.ref.doi);
            }
        );
    }

    clearMessage() {
        this.errMessage = "";
    }

    /**
     * Reset citation value to original.
     */
    resetCitation() {
        this.ref.citation = this.originalRef.citation;
    }

    /**
     * 
     * @param index 
     */
    removeAuthor(index: number) {
        this.ref.authors.splice(index, 1);
        this.onChange(true);
    }

    setInputMethod(event) {
        var target = event.target;
        this.inputMethod = event.target.value;
        
        switch ( this.inputMethod ) {
            case "1": //useDOI
                // By default, citation is not linked to other fields. User can edit content.
                this.citationLocked = true; 
                this.showAllFields = false;
                break;
            case "2": //useRefData
                // By default, citation is linked to other fields. User can't edit content.
                this.citationLocked = false;
                this.showAllFields = true;
                break;
            default: //useCitationData
                // By default, citation is not linked to other fields. User can edit content.
                this.citationLocked = true;
                this.showAllFields = false;
                break;
        }
    }

    /**
     * 
     * @returns Citation lock icon class based on editing status
     */
    citationLockClass() {
        if(this.citationLocked) {
            return "faa faa-lock";
        }else{
            return "faa faa-unlock";
        }
    }

    /**
     * 
     * @returns tooltip of lock icon based on editing status
     */
    citationLockTooltip() {
        if(this.citationLocked) {
            return "Click to unlock citation";
        }else{
            return "Click to lock citation";
        }
    }

    /**
     * When reference data changed, set the flag so 
     */
    onDataChange(dataChanged: boolean) {
        this.onChange(true);
    }

    /**
     * Update citation text based on related fields.
     * If it's locked, citation text will be entered by user manually.
     */
    updateCitation() {
        if(this.citationLocked) return;


        this.ref.citation = "";
        // Add authors
        if(this.ref.authors && this.ref.authors.length > 0){
            for(let i = 0; i <= this.ref.authors.length-1; i++) {
                this.ref.citation += this.ref.authors[i];
                if(i < this.ref.authors.length-2) this.ref.citation += ", ";
                if(i == this.ref.authors.length-2) this.ref.citation += ", & ";
                if(i == this.ref.authors.length-1) this.ref.citation += " ";
            }
        }

        // Add publish year
        if(this.ref.publishYear)
            this.ref.citation += "(" + this.ref.publishYear + "). ";

        // Add title
        if(this.ref.title)
            this.ref.citation += this.ref.title + ". ";

        // Add Journal
        if(this.ref.label)
            this.ref.citation += this.ref.label + ". ";

        let addPeriod: boolean = false;
        // Add Vol
        if(this.ref.vol){
            this.ref.citation += this.ref.vol;  
            addPeriod = true;
        }
            
        // Add Vol number
        if(this.ref.volNumber){
            this.ref.citation += "(" + this.ref.volNumber + ")";  
            addPeriod = true;
        }

        // Add pages
        if(this.ref.pages){
            this.ref.citation += " " + this.ref.pages;  
            addPeriod = true;
        }

        if(addPeriod) this.ref.citation += ". "; 

        // Add URL
        if(this.ref.doi) {
            this.ref.citation += "doi: " + this.ref.doi;
        }else if(this.ref.location) {
            this.ref.citation += "doi: " + this.ref.location;
        }

        // In preparation
        if(this.ref.inPreparation == "yes") {
            this.ref.citation += ". In preparation."
        }
    }

    /**
     * Show/hide author edit block when user clicks on the icon. 
     */
    authorExpandClick() {
        this.editBlockStatus = this.editBlockStatus=="collapsed"? "expanded" : "collapsed";
        this.chref.detectChanges();
    }

    /**
     * Emit command to parent component
     * @param cmd command
     */
    commandOut(cmd: string) {
        this.cmdOutput.emit({"command": cmd});
    }  
}
