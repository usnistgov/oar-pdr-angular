import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { DataModel } from '../../models/data.model';
import { StepModel } from "../../models/step.model";
import { StepService } from '../../services/step.service';

@Component({
  selector: 'app-associated-papers',
  templateUrl: './associated-papers.component.html',
  styleUrls: ['./associated-papers.component.css', '../../stepwizard.component.scss']
})
export class AssociatedPapersComponent implements OnInit {
    parantFormGroup!: FormGroup;
    private _sbarvisible : boolean = true;

    @Input() dataModel!: DataModel;
    @Input() steps: StepModel[] =[];

    constructor(
        private rootFormGroup: FormGroupDirective, 
        private chref: ChangeDetectorRef,
        private stepService: StepService) { }

    ngOnInit(): void {
        this.parantFormGroup = this.rootFormGroup.control.controls['assocPapers'] as FormGroup;
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

    onSelectChange(evt: any) {
        this.dataModel.assocPageType = evt.target.value;

        if(this.dataModel.assocPageType != undefined){
            this.steps[4].isComplete = true;
        }else{
            this.dataModel.assocPageType = undefined;
            this.steps[4].isComplete = false;
        }

        this.steps[4].canGoNext = this.stepService.allDone();
    }
}
