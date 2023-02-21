import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Author } from '../author';
import { AuthorService } from '../author.service';

@Component({
  selector: 'lib-author-edit',
  templateUrl: './author-edit.component.html',
  styleUrls: ['./author-edit.component.css']
})
export class AuthorEditComponent implements OnInit {
    @Input() author: Author = {} as Author;
    @Input() editMode: string = "edit";
    @Input() forceReset: boolean = false;
    @Output() dataChanged: EventEmitter<any> = new EventEmitter();
    
    constructor(private authorService: AuthorService) { }

    ngOnInit(): void {
    }

    /*
    *   Update full name when given name changed
    */
    onGivenNameChange(givenName: string) {
        this.author.dataChanged = true;
        if (!this.author.fnLocked) {
            this.author.fn = givenName + " " + (this.author.middleName == undefined ? " " : this.author.middleName + " ") + (this.author.familyName == undefined ? "" : this.author.familyName);
        }

        this.dataChanged.emit({"author": JSON.parse(JSON.stringify(this.author)), "dataChanged": true});
    }   

    /*
    *   Update full name when middle name changed
    */
    onMiddleNameChange(author: any, middleName: string) {
        author.dataChanged = true;
        if (!author.fnLocked) {
            author.fn = (author.givenName == undefined ? " " : author.givenName + " ") + middleName + " " + (author.familyName == undefined ? "" : author.familyName);
        }

        this.dataChanged.emit({"author": JSON.parse(JSON.stringify(this.author)), "dataChanged": true});
    }

    /*
    *   Update full name when middle name changed
    */
    onFamilyNameChange(author: any, familyName: string) {
        author.dataChanged = true;
        if (!author.fnLocked) {
            author.fn = (author.givenName == undefined ? " " : author.givenName + " ") + (author.middleName == undefined ? " " : author.middleName + " ") + familyName;
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
        this.dataChanged.emit({"author": JSON.parse(JSON.stringify(this.author)), "dataChanged": true});

        if(!this.orcid_validation(author.orcid))
        {
            author.orcidValid = false;
        }else{
            author.orcidValid = true;
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

        this.author.affiliation.push(this.authorService.getBlankAffiliation());
        this.author.dataChanged = true;
        this.dataChanged.emit({"author": JSON.parse(JSON.stringify(this.author)), "dataChanged": true});
    }    

    /*
    *   When affiliation department/division changed
    */
    onDeptChange(author: any) {
        author.dataChanged = true;
        this.dataChanged.emit({"author": JSON.parse(JSON.stringify(this.author)), "dataChanged": true});
    }

    /*
    *   Remove one affiliation from an author
    */
    deleteAffiliation(i: number, aff: any) {
        this.author.affiliation = this.author.affiliation.filter(obj => obj !== aff);
        this.author.dataChanged = true;

        this.dataChanged.emit({"author": JSON.parse(JSON.stringify(this.author)), "dataChanged": true});
    }

    /*
    *   When affiliation name changed
    */
    affiliationNameChanged(message: string, i: number) {
        this.author.dataChanged = true;
        this.dataChanged.emit({"author": JSON.parse(JSON.stringify(this.author)), "dataChanged": true});
    }   
    
    /*
    *   This function is used to track ngFor loop
    */
    trackByFn(index: any, author: any) {
        return index;
    }    
}
