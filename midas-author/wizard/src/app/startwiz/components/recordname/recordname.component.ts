import { Component, Input, ChangeDetectorRef, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataModel } from '../../models/data.model';
import { StepModel } from "../../models/step.model";
import { StepService } from '../../services/step.service';
import { FormGroup, FormGroupDirective } from '@angular/forms';

@Component({
  selector: 'app-recordname',
  templateUrl: './recordname.component.html',
  styleUrls: ['./recordname.component.css', '../../stepwizard.component.scss']
})
export class RecordNameComponent implements OnInit {
    parantFormGroup!: FormGroup;
    private _sbarvisible : boolean = true;

    @Input() dataModel!: DataModel;
    @Input() steps: StepModel[] =[];

    @ViewChild('name') nameElement: ElementRef;
    
    constructor(private rootFormGroup: FormGroupDirective, 
        private cdr: ChangeDetectorRef,
        private stepService: StepService) { }

    ngOnInit(): void {
        this.parantFormGroup = this.rootFormGroup.control.controls['recordname'] as FormGroup;

        this.parantFormGroup.valueChanges.subscribe(selectedValue  => {
        })
    }

    updateRecordName(evt:any) {
        this.dataModel.recordname = evt.target.value;
        this.steps[5].isComplete = (this.dataModel.recordname?.trim() != "");
        this.steps[5].canGoNext = this.stepService.allDone();
    }
}
