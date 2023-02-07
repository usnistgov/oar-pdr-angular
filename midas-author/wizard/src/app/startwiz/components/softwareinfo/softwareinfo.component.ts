import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { DataModel } from '../../models/data.model';
import { StepModel } from "../../models/step.model";
import { StepService } from '../../services/step.service';

@Component({
    selector: 'app-softwareinfo',
    templateUrl: './softwareinfo.component.html',
    styleUrls: ['./softwareinfo.component.css', '../../stepwizard.component.scss']
})
export class SoftwareinfoComponent implements OnInit {
    parantFormGroup!: FormGroup;
    private _sbarvisible : boolean = true;

    @Input() dataModel!: DataModel;
    @Input() steps: StepModel[] =[];

    constructor(
        private rootFormGroup: FormGroupDirective, 
        private chref: ChangeDetectorRef,
        private stepService: StepService) { 
        
    }

    ngOnInit(): void {
        this.parantFormGroup = this.rootFormGroup.control.controls['softwareInfo'] as FormGroup;
    }

    ngAfterContentInit() {
        this.chref.detectChanges();
    }

    /**
     * cancel this wizard
     */
    cancel() {
        console.log("Canceling wizard input");
    }
    
    /**
     * close out the collection of information and dispatch it as necessary
     */
    finish() {
        console.log("Done!");
    }

    toggleSbarView() {
        this._sbarvisible = ! this._sbarvisible;
        this.chref.detectChanges();
    }

    isSbarVisible() {
        return this._sbarvisible
    }

    toggleSoftwareLink(evt:any) {
        var target = evt.target;
        this.dataModel.provideLink = (target.value==='yes');

        if(!this.dataModel.provideLink) {
            this.dataModel.softwareLink = undefined;
            this.parantFormGroup.patchValue({
                softwareLink: ""
            })

            this.steps[3].isComplete = true;
        }else{
            this.steps[3].isComplete = false;
        }

        this.steps[4].canGoNext = this.stepService.allDone();
    }

    updateSoftwareLink(evt:any): void {
        this.dataModel.softwareLink = evt.target.value;
        this.steps[3].isComplete = (this.dataModel.softwareLink?.trim() != "");
        this.steps[4].canGoNext = this.stepService.allDone();
    }
}
