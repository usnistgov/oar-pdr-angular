import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { SDSuggestion, SDSIndex, StaffDirectoryService } from 'oarng';
import { AutoCompleteCompleteEvent, AutoCompleteSelectEvent } from 'primeng/autocomplete';


@Component({
  selector: 'lib-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.css']
})
export class PeopleComponent {
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

    placeHolderText: string;

    // @Input() existingPeople: SDSuggestion[] = [];
    @Output() dataChanged: EventEmitter<any> = new EventEmitter();    
    
    constructor(private ps: StaffDirectoryService) { }

    ngOnInit(): void {
        // this.selectedSuggestion = new SDSuggestion(0, this.originalValue, null);
        this.placeHolderText = "Enter at least " + this.minPromptLength + " chars to search...";
    }

    ngOnChanges(changes: SimpleChanges): void {
        // if(changes.originalValue) {
        //     this.selectedSuggestion = new SDSuggestion(0, this.originalValue, null);
        // }
    }

    set_suggestions(ev: AutoCompleteCompleteEvent) {
        if (ev.query) {
            this.dataChanged.next({"value": ev.query, action:"fieldChanged"});
 
            if (ev.query.length >= this.minPromptLength) {  // don't do anything unless we have 2 chars
                if (! this.index) {
                    // retrieve initial index
                    this.ps.getPeopleIndexFor(ev.query).subscribe({
                        next:(pi) => {
                            // save it to use with subsequent typing
                            this.index = pi;
                            if (this.index != null) {
                                // pull out the matching suggestions
                                this.suggestions = (this.index as SDSIndex).getSuggestions(ev.query);
                                this.index = null;
                            }
                        },
                        error:(e) => {
                            console.error('Failed to pull people index for "'+ev.query+'": '+e)
                        }
                    });
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

    getFullRecord(ev: AutoCompleteSelectEvent) {
        let sugg = ev.value as SDSuggestion;
        
        sugg.getRecord().subscribe({
            next: (rec) => { 
                this.selected = rec;
                if(this.selected.lastName && this.selected.firstName){
                    this.dataChanged.next({"selectedPeopleRecord": JSON.parse(JSON.stringify(this.selected)), action:"peopleChanged"});

                    this.getOrgs(this.selectedSuggestion);
                }
            },
            error: (err) => {
                console.error("Failed to resolve suggestion into person data");
            }
        });
    }    

    getOrgs(selected: SDSuggestion) {
        if (selected) {
            this.ps.getOrgsFor(selected.id).subscribe({
                next: (recs) => {
                    //Get first 3 units and then reverse the order
                    this.selectedOrgs = recs.slice(0, 3).reverse();
                    this.dataChanged.next({"selectedPeopleOrg": JSON.parse(JSON.stringify(this.selectedOrgs)), action:"orgChanged"});
                    this.selectedSuggestion = null;
                },
                error: (err) => {
                    console.error("Failed to resolve person id into org data");
                }
            });
        }
    }

}
