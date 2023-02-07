import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { DataModel } from '../../models/data.model';
import { StepModel } from "../../models/step.model";
import { StepService } from '../../services/step.service';

@Component({
    selector: 'app-contactinfo',
    templateUrl: './contactinfo.component.html',
    styleUrls: ['./contactinfo.component.css', '../../stepwizard.component.scss']
})
export class ContactinfoComponent implements OnInit {
    parantFormGroup!: FormGroup;
    private _sbarvisible : boolean = true;

    @Input() dataModel!: DataModel;
    @Input() steps: StepModel[] =[];

    constructor(
        private rootFormGroup: FormGroupDirective, 
        private cdr: ChangeDetectorRef,
        private stepService: StepService) { }

    ngOnInit(): void {
        this.parantFormGroup = this.rootFormGroup.control.controls['contactInfo'] as FormGroup;

        this.parantFormGroup.valueChanges.subscribe(selectedValue  => {
        })
    }

    /**
     * cancel this wizard
     */
    cancel() {
        console.log("Canceling wizard input");
    }
    
    ngAfterViewInit() {
        this.cdr.detectChanges();
    }

    ngAfterContentInit() {
        this.cdr.detectChanges();
    }

    /**
     * close out the collection of information and dispatch it as necessary
     */
    finish() {
        console.log("Done!");
    }

    toggleSbarView() {
        this._sbarvisible = ! this._sbarvisible;
        this.cdr.detectChanges();
    }

    isSbarVisible() {
        return this._sbarvisible
    }

    toggleContactName(evt:any) {
        var target = evt.target;
        this.dataModel.creatorIsContact = (target.value==='true');

        if(this.dataModel.creatorIsContact) {
            this.dataModel.contactName = undefined;
            this.parantFormGroup.patchValue({
                contactName: ""
            })

            this.steps[1].isComplete = true;
        }else{
            this.steps[1].isComplete = false;
        }

        this.steps[4].canGoNext = this.stepService.allDone();
    }

    updateContactName(evt:any) {
        this.dataModel.contactName = evt.target.value;
        this.steps[1].isComplete = (this.dataModel.contactName?.trim() != "");
        this.steps[4].canGoNext = this.stepService.allDone();
    }
}
