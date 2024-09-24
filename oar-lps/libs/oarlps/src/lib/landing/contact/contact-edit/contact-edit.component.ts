import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Contact } from '../contact';
import { SDSuggestion, SDSIndex, StaffDirectoryService } from 'oarng';
import { AutoCompleteCompleteEvent, AutoCompleteOnSelectEvent } from 'primeng/autocomplete';


@Component({
  selector: 'lib-contact-edit',
  templateUrl: './contact-edit.component.html',
  styleUrls: ['./contact-edit.component.css']
})
export class ContactEditComponent implements OnInit {
    minPromptLength = 2;

    // the index we will download after the first minPromptLength (2) characters are typed
    index: SDSIndex|null = null;

    // the current list of suggested completions matching what has been typed so far.
    suggestions: SDSuggestion[] = [];

    // the suggested completion that was picked; it contains a reference to the full record
    selectedSuggestion: SDSuggestion|null = null;

    // the full record for the selected person
    selected: any = null;

    // the organizations that the selected person is a member of
    selectedOrgs: any[]|null = null;

    json = JSON;
    email: string = "";

    @Input() contact: Contact = {} as Contact;
    @Input() backgroundColor: string = 'var(--editable)';
    @Input() editMode: string = "edit";
    @Input() forceReset: boolean = false;
    @Output() dataChanged: EventEmitter<any> = new EventEmitter();    
    
    constructor(private ps: StaffDirectoryService) { }

    ngOnInit(): void {
        this.convertEmail();
        this.selectedSuggestion = new SDSuggestion(0, this.contact.fn, null);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if(changes.contact) {
            this.convertEmail();
            this.selectedSuggestion = new SDSuggestion(0, this.contact.fn, null);
        }
    }

    convertEmail() {
        this.email = this.contact.hasEmail? this.contact.hasEmail.replace("mailto:", "").trim() : "";
    }

    onFullNameChange(value) {
        this.contact.dataChanged = true;
        this.dataChanged.next({"fn": JSON.parse(JSON.stringify(this.contact.fn)), action:"dataChanged"});
    }

    onEmailChange(value) {
        this.contact.hasEmail = "mailto:" + value;
        this.contact.dataChanged = true;
        this.dataChanged.next({"email": JSON.parse(JSON.stringify(this.contact.hasEmail)), action:"dataChanged"});
    }

    set_suggestions(ev: AutoCompleteCompleteEvent) {
        if (ev.query) {
            if (ev.query.length >= this.minPromptLength) {  // don't do anything unless we have 2 chars
                if (! this.index) {
                    // retrieve initial index
                    this.ps.getPeopleIndexFor(ev.query).subscribe(
                        pi => {
                            // save it to use with subsequent typing
                            this.index = pi;
                            if (this.index != null) {
                                // pull out the matching suggestions
                                this.suggestions = (this.index as SDSIndex).getSuggestions(ev.query);
                            }
                        },
                        e => {
                            console.error('Failed to pull people index for "'+ev.query+'": '+e)
                        }
                    );
                }
                else
                    // pull out the matching suggestions
                    this.suggestions = (this.index as SDSIndex).getSuggestions(ev.query);
            }
            else if (this.index) {
                this.index = null;
                this.suggestions = [];
            }
        }
    }    

    showFullRecord(ev: AutoCompleteOnSelectEvent) {
        let sugg = ev.value as SDSuggestion;
        
        sugg.getRecord().subscribe({
            next: (rec) => { 
                this.selected = rec;
                if(this.selected.lastName && this.selected.firstName){
                    this.contact.fn = this.selected.firstName + " " + this.selected.lastName;

                    this.contact.dataChanged = true;
                    this.dataChanged.next({"fn": JSON.parse(JSON.stringify(this.contact.fn)), action:"dataChanged"});
                }

                if(this.selected.lastName)
                    this.contact.familyName = this.selected.lastName;

                if(this.selected.firstName)
                    this.contact.givenName = this.selected.firstName;

                if(this.selected.emailAddress){
                    this.contact.hasEmail = "mailto:" + this.selected.emailAddress;
                    this.email = this.selected.emailAddress;

                    this.contact.dataChanged = true;
                    this.dataChanged.next({"email": JSON.parse(JSON.stringify(this.contact.hasEmail)), action:"dataChanged"});
                }

        
            },
            error: (err) => {
                console.error("Failed to resolve suggestion into person data");
            }
    });
    }

}
