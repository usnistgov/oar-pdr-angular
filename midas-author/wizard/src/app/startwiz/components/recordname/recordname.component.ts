import { Component, Input, ChangeDetectorRef, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataModel } from '../../models/data.model';
import { StepModel } from "../../models/step.model";
import { StepService } from '../../services/step.service';
import { WizardService } from '../../services/wizard.service';

@Component({
  selector: 'app-recordname',
  templateUrl: './recordname.component.html',
  styleUrls: ['./recordname.component.css', '../../stepwizard.component.scss']
})
export class RecordNameComponent implements OnInit {
    lastStep: StepModel;
    thisStep: StepModel;
    existingRecordNames: string[] = []; // All lower case
    existingRecordNamesForDisplay: string[] = []; // Original case
    showNames: boolean = false;

    @Input() dataModel!: DataModel;
    @Input() steps: StepModel[] =[];
    @Input() helpText: any = {};
    @Input() marginLeft: number = 40;
    
    constructor(
        private cdr: ChangeDetectorRef,
        private wizardService: WizardService,
        private stepService: StepService) { }

    ngOnInit(): void {
        this.thisStep = this.stepService.getStep("Name");
        this.lastStep = this.stepService.getLastStep();

        this.getNames();
    }

    /**
     * Update the step status when record name changed.
     */
    onRecordNameChanged(event: any) {
        if (event.target.value && this.nameTaken(event.target.value) || !event.target.value) {
            this.thisStep.isComplete = false;
            this.lastStep.canGoNext = this.stepService.allDone();
        } else {
            this.thisStep.isComplete = (event.target.value.trim() != "");
            this.lastStep.canGoNext = this.stepService.allDone();
        }
    }

    inputStyle() {
        if (this.dataModel.recordname) {
            if (this.nameTaken(this.dataModel.recordname)) {
                return {
                    'color': 'red'
                };
            } else {
                return {
                    'color': 'green'
                };
            }
        } else {
            return {
                'color': 'black'
            };
        }
    }

    /**
     * Check if a record name is already taken by existing records of the user.
     * @param name The record name to be checked
     * @returns true if the input name was taken already.
     */
    nameTaken(name: string = "") {
        let inputName = name.trim().toLowerCase();
        if (!name || name.trim() == "") {
            inputName = this.dataModel.recordname ? this.dataModel.recordname.trim().toLowerCase() : "";
        }

        return this.existingRecordNames.includes(inputName);
    }

    /**
     * Get existing record names for the current user. 
     * The record names will be used to check if the input record name is unique.
     */
    getNames() {
        let userId = this.wizardService.getCred().userId;
        if(!userId) {
            console.error("User ID is not available in credentials.");
            return;
        }

        this.wizardService.getExistingRecords(this.wizardService.getCred().userId)
            .subscribe(
                resp => {
                    if (resp) {
                        console.log("Existing records:", resp);
                        resp.forEach((record) => {
                            if (record) {
                                this.existingRecordNames.push(record['name'].toLowerCase());
                                this.existingRecordNamesForDisplay.push(record['name'])
                            }
                        })
                    }
                },
                err => {
                    console.error("Record name check error:", err);
                }
            );
    }    

    toggleNames() {
        this.showNames = !this.showNames;
    }
}
