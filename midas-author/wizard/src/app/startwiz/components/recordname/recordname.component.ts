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

    setFocus(event) {
        console.log("On focus", event)
        setTimeout(()=>{ // this will make the execution after the above boolean has changed
            const nameInput = this.nameElement.nativeElement as HTMLTextAreaElement;
            nameInput.focus();
        },0);  
    }

    updateRecordName(evt:any) {
        this.dataModel.recordname = evt.target.value;
        this.steps[5].isComplete = (this.dataModel.recordname?.trim() != "");
        this.steps[5].canGoNext = this.stepService.allDone();
    }
}
