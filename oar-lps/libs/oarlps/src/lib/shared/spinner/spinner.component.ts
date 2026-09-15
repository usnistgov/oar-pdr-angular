import { Component, Input } from '@angular/core';
import { SpinnerService } from './spinner.service';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-spinner',
    templateUrl: './spinner.component.html',
    styleUrls: ['./spinner.component.scss'],
    standalone: true,
    imports: [ CommonModule, FontAwesomeModule ]
})
export class SpinnerComponent {
    loading: boolean = false;
    faSpinner = faSpinner;
    
    @Input() local: boolean = false;

    constructor(public spinner: SpinnerService) { }

    ngOnInit() {
        this.spinner.watchLoading((loading) => {
            this.loading = loading;
        });
    }
}