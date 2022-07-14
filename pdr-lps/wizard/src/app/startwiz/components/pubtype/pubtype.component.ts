import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { DataModel } from '../../models/data.model';
import { StepModel } from "../../models/step.model";
import { StepService } from '../../services/step.service';

@Component({
    selector: 'app-pubtype',
    templateUrl: './pubtype.component.html',
    styleUrls: ['./pubtype.component.css', '../../stepwizard.component.scss']
})
export class PubtypeComponent implements OnInit {
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
        this.parantFormGroup = this.rootFormGroup.control.controls['pubtype'] as FormGroup;
        // console.log('this.parantFormGroup', this.parantFormGroup.controls['pubtype'])
        this.parantFormGroup.valueChanges.subscribe(selectedValue  => {
            this.dataModel.resourceType = selectedValue.resourceType;
            if(this.dataModel.resourceType == undefined){
            //     this.steps[0].canGoNext = true;
            //     this.steps[0].isComplete = true;
            //     for(let i = 1; i < this.steps.length; i++){
            //         this.steps[i].canEnter = true;
            //     }
            // }else{
                for(let i = 1; i < this.steps.length; i++){
                    this.steps[i].canEnter = false;
                }
                this.dataModel.resourceType = undefined;
                this.steps[0].isComplete = false;
            }
                
            // Turn on optional step if resource type is software
            // this.steps[3].active = (this.dataModel.resourceType == "software");

            // this.steps[4].canGoNext = this.stepService.allDone();
        })
    }

    ngAfterContentInit() {
        this.chref.detectChanges();
    }

    toggleSbarView() {
        this._sbarvisible = ! this._sbarvisible;
        this.chref.detectChanges();
    }

    isSbarVisible() {
        return this._sbarvisible
    }

    onSelectChange(evt: any) {
        this.dataModel.resourceType = evt.target.value;

        this.steps[0].canGoNext = true;
        this.steps[0].isComplete = true;
        for(let i = 1; i < this.steps.length; i++){
            this.steps[i].canEnter = true;
        }

        // Turn on optional step if resource type is software
        this.steps[3].active = (this.dataModel.resourceType == "software");

        this.steps[4].canGoNext = this.stepService.allDone();
    }
}
