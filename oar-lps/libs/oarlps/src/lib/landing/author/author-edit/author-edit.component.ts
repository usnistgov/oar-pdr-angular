import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Author, Affiliation } from '../author';
import { AuthorService } from '../author.service';
import { Sections, SectionPrefs } from '../../../shared/globals/globals';
import { NIST } from '../../../shared/globals/globals';
import { SDSuggestion } from 'oarng';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { PeopleComponent } from '../../people/people.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'lib-author-edit',
  standalone: true,
        imports: [        
            CommonModule,
            FormsModule,
            PeopleComponent,
            ButtonModule,
            NgbModule
        ],
  templateUrl: './author-edit.component.html',
  styleUrls: ['../../landing.component.scss', './author-edit.component.css']
})
export class AuthorEditComponent implements OnInit {
    orcidValid: boolean = false;
    // the full record for the selected person
    selected: any = null;
    // the organizations that the selected person is a member of
    selectedOrgs: any[]|null = null;
    affiliationList: any[];
    unitList: any[];
    //For people lookup - filter out from suggestions
    currentAuthors: SDSuggestion[];
    showDeptMsg: boolean = false;

    @Input() author: Author;
    @Input() authors: Author[];
    @Input() backgroundColor: string = 'var(--editable)';
    @Input() editMode: string = "edit";
    @Input() fieldName: string = SectionPrefs.getFieldName(Sections.AUTHORS);
    @Input() forceReset: boolean = false;
    @Output() dataChanged: EventEmitter<any> = new EventEmitter();
    
    constructor(
        private chref: ChangeDetectorRef,
        private authorService: AuthorService)
         { }

    ngOnInit(): void {
        if(!this.author) {
            this.author = new Author("", "", "", "", [this.authorService.getBlankAffiliation("")]);
        }

        if(!this.orcid_validation(this.author.orcid))
        {
            this.orcidValid = false;
        }else{
            this.orcidValid = true;
        }
    }

    get isAuthor() {
        return this.fieldName == SectionPrefs.getFieldName(Sections.AUTHORS);
    }

    /**
     * Update current author list
     */
    currentAuthorsInit() {
        this.currentAuthors = [];

        if(this.authors) {
            for(let author of this.authors) {
                this.currentAuthors.push(new SDSuggestion(0, author.fn, null))
            }
        }
    }

    /*
    *   Update full name when given name changed
    */
    onGivenNameChange(givenName: string) {
        this.author.givenName = givenName;
        this.author.dataChanged = true;
        if (!this.author.fnLocked) {
            this.author.fn = this.author.givenName + " " + (this.author.middleName == undefined ? "" : this.author.middleName + " ") + (this.author.familyName == undefined ? "" : this.author.familyName);
        }

        this.dataChanged.emit({"author": JSON.parse(JSON.stringify(this.author)), "dataChanged": true});
    }   

    /*
    *   Update full name when middle name changed
    */
    onMiddleNameChange(author: any, middleName: string) {
        this.author.middleName = middleName;
        author.dataChanged = true;
        if (!author.fnLocked) {
            this.author.fn = this.author.givenName + " " + (this.author.middleName == undefined ? "" : this.author.middleName + " ") + (this.author.familyName == undefined ? "" : this.author.familyName);
        }

        this.dataChanged.emit({"author": JSON.parse(JSON.stringify(this.author)), "dataChanged": true});
    }

    /*
    *   Update full name when middle name changed
    */
    onFamilyNameChange(author: any, familyName: string) {
        this.author.familyName = familyName;
        author.dataChanged = true;
        if (!author.fnLocked) {
            this.author.fn = this.author.givenName + " " + (this.author.middleName == undefined ? "" : this.author.middleName + " ") + (this.author.familyName == undefined ? "" : this.author.familyName);
        }

        this.dataChanged.emit({"author": JSON.parse(JSON.stringify(this.author)), "dataChanged": true});
    }

    /*
    *   Lock full name when full name changed
    */
    onFullNameChange(author: any, familyName: string) {
        author.dataChanged = true;
        if (!author.fnLocked) {
            author.fnLocked = true;
        }

        this.dataChanged.emit({"author": JSON.parse(JSON.stringify(this.author)), "dataChanged": true});
    }

    /**
     * ORCID validation for UI
     * @param author - author object
     */
    validateOrcid(author)
    {
        author.dataChanged = true;
        this.dataChanged.next({"author": JSON.parse(JSON.stringify(this.author)), "dataChanged": true});

        if(!this.orcid_validation(author.orcid))
        {
            this.orcidValid = false;
        }else{
            this.orcidValid = true;
        }
    }  
    
    /**
     *  ORCID validation
     */
    orcid_validation(orcid):boolean
    {
        //Allow blank
        if(orcid == '') return true;

        const URL_REGEXP = /^[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{3}[0-9X]$/;
        if (URL_REGEXP.test(orcid)) {
            return true;
        }

        return false;
    }  
    
    /*
    *   Add affiliation to an author
    */
    addAffiliation() {
        if (!this.author.affiliation)
            this.author.affiliation = [];

        let defaultName = "National Institute of Standards and Technology";
        if(this.author.affiliation.length > 0)
            defaultName = "";
        
        this.author.affiliation.push(this.authorService.getBlankAffiliation(defaultName));
        this.author.dataChanged = true;
        this.dataChanged.emit({"author": JSON.parse(JSON.stringify(this.author)), "dataChanged": true});
    }    

    /*
    *   When affiliation department/division changed
    */
    onDeptChange(event: any, j: number, i: number) {
        let subunit = event.target.value;
        this.author.affiliation[j].subunits[i] = event.target.value;
        this.dataChanged.emit({"author": JSON.parse(JSON.stringify(this.author)), "dataChanged": true});
    }

    /*
    *   Remove one affiliation from an author
    */
    deleteAffiliation(aff: any) {
        this.author.affiliation = this.author.affiliation.filter(obj => obj !== aff);
        this.author.dataChanged = true;

        this.dataChanged.emit({"author": JSON.parse(JSON.stringify(this.author)), "dataChanged": true});
    }

    /*
    *   Remove one affiliation from an author
    */
    deleteUnit(affIndex: number, unit: string) {
        this.author.affiliation[affIndex].subunits = this.author.affiliation[affIndex].subunits.filter(obj => obj !== unit);
        this.author.dataChanged = true;

        this.dataChanged.emit({"author": JSON.parse(JSON.stringify(this.author)), "dataChanged": true});
    }    

    /*
    *   When affiliation name changed
    */
    affiliationNameChanged(message: string) {
        this.author.dataChanged = true;
        this.dataChanged.emit({"author": JSON.parse(JSON.stringify(this.author)), "dataChanged": true});
    }   
    
    /*
    *   This function is used to track ngFor loop
    */
    trackByFn(index: any, author: any) {
        return index;
    }  
    
    /**
     * Handle requests from child component
     * @param dataChanged parameter passed from child component
     */
    onDataChanged(dataChanged: any) {
        switch(dataChanged.action) {
            case 'fieldChanged':
                // this.author.dataChanged = true;
                // this.author.fn = dataChanged.value;
                // this.dataChanged.emit({"author": JSON.parse(JSON.stringify(this.author)), "dataChanged": true});
    
                break;

            case 'peopleChanged':
                this.selected = dataChanged.selectedPeopleRecord;
                if(this.selected.lastName && this.selected.firstName){
                    this.author.fn = this.selected.lastName + ", " + this.selected.firstName;

                    this.author.dataChanged = true;
                }

                if(this.selected.lastName){
                    this.author.familyName = this.selected.lastName;
                    this.author.dataChanged = true;
                }

                if(this.selected.firstName){
                    this.author.givenName = this.selected.firstName;
                    this.author.dataChanged = true;
                }

                if(this.selected.midName){
                    this.author.middleName = this.selected.midName;
                    this.author.dataChanged = true;
                }

                if(this.selected.orcid){
                    this.author.orcid = this.selected.orcid;

                    if(!this.orcid_validation(this.author.orcid)){
                        this.orcidValid = false;
                    }else{
                        this.orcidValid = true;
                    }
                    this.author.dataChanged = true;
                }

                if(this.author.dataChanged) {
                    this.dataChanged.emit({"author": JSON.parse(JSON.stringify(this.author)), "dataChanged": true});
                }
    
                break;     
                
            case 'orgChanged':
                this.selectedOrgs = dataChanged.selectedPeopleOrg;

                if(this.selectedOrgs.length > 0 && this.author) {
                    if(!this.author.affiliation){
                        this.author.affiliation = [];
                    }

                    let org = this.author.affiliation.find((org) => org.title == NIST);
                    if(!org) {
                        this.author.affiliation.push({
                            '@id': "",
                            'title': NIST,
                            'subunits': []
                        } as Affiliation)
                    }

                    org = this.author.affiliation.find((org) => {
                        return org.title == NIST;
                    });

                    for(let subunit of this.selectedOrgs) {
                        if(!org.subunits.find((unit) => unit.toLowerCase() == subunit.orG_Name.toLowerCase()))
                            org.subunits.push(subunit.orG_Name)
                    }
                }
                break;     
            default:
                break;
        }
    }

    /**
     * Add a blank subunit to an affiliation
     * @param index index number of author's affiliation
     */
    addSubunit(index: number, subunit: any) {
        if(subunit.trim() == "") {
            this.showDeptMsg = true;
            setTimeout(() => {
                this.showDeptMsg = false;
            }, 5000);
        }
        if(!this.author.affiliation[index].subunits) {
            this.author.affiliation[index].subunits = [];
        }

        let length = this.author.affiliation[index].subunits.length;
        if(length == 0 || this.author.affiliation[index].subunits[length-1].trim() != "")
            this.author.affiliation[index].subunits.push("");
    }
}
