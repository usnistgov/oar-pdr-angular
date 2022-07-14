import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { DataModel } from '../../models/data.model';
import { StepModel } from "../../models/step.model";
import { StepService } from '../../services/step.service';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.css', '../../stepwizard.component.scss']
})
export class FilesComponent implements OnInit {
    parantFormGroup!: FormGroup;
    private _sbarvisible : boolean = true;

    @Input() dataModel!: DataModel;
    @Input() steps: StepModel[] =[];

    constructor(
        private rootFormGroup: FormGroupDirective, 
        private chref: ChangeDetectorRef,
        private stepService: StepService) { }

    ngOnInit(): void {
        this.parantFormGroup = this.rootFormGroup.control.controls['files'] as FormGroup;

        this.parantFormGroup.valueChanges.subscribe(selectedValue  => {
            this.dataModel.willUpload = selectedValue.willUpload;
            if(this.dataModel.willUpload != undefined){
                this.steps[2].canGoNext = true;
                this.steps[2].isComplete = true;
            }else{
                this.dataModel.willUpload = undefined;
                this.steps[2].isComplete = false;
            }
            this.steps[4].canGoNext = this.stepService.allDone();
        })
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
}
