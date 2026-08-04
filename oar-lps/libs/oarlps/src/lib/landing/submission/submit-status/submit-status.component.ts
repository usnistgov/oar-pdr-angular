import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ButtonModule } from 'primeng/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SubmitStatusNpsComponent } from '../submit-status-nps/submit-status-nps.component';
import {
    faXmark, faUpRightAndDownLeftFromCenter
} from '@fortawesome/free-solid-svg-icons';
import { NgbModalOptions, NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'submit-status',
    standalone: true,
    imports: [ CommonModule, FontAwesomeModule, ButtonModule, SubmitStatusNpsComponent ],
    templateUrl: './submit-status.component.html',
    styleUrl: './submit-status.component.css'
})
export class SubmitStatusComponent {
    //Icons
    faXmark = faXmark;
    faUpRightAndDownLeftFromCenter = faUpRightAndDownLeftFromCenter;

    //Review systems
    activeSystem: string = 'nps';
    reviewSystems: string[] = [];

    modalRef: any; // For submit status pop up
    
    @Input() submitStatus: any = {};
    @Input() showFeedback: boolean = true;
    @Input() showHeaderFooter: boolean = false;
    @Input() activeTabIndex: number = 0;
    @Output() returnValue: EventEmitter<any> = new EventEmitter();

    @ViewChildren('tabs') tabs!: QueryList<ElementRef<HTMLButtonElement>>;

    constructor(
        private modalService: NgbModal,
        public activeModal: NgbActiveModal) {

    }

    ngOnInit() {
        this.reviewSystems = Object.keys(this.submitStatus);
        this.activeSystem = this.reviewSystems[this.activeTabIndex];  
    }

    ngAfterViewInit(): void {
        this.setActive(this.activeTabIndex);
    }

    setActive(index: number) {
        if (this.tabs) {
            const tabArray = this.tabs.toArray();
            tabArray[index]?.nativeElement.focus();
        }
    }

    close() {
        this.returnValue.emit(true);
        this.activeModal.close('Close click');
    }

    selectTab(index: number) {
        this.activeSystem = this.reviewSystems[index];
        this.activeTabIndex = index;
    }

    getLabel(type: string = 'comment') {
        let label: string;
        switch (type) {
            case 'req':
                label = "The following must be addressed:";
                break;
            
            case 'warn':
                label = "The following should be addressed:"
                break;
            
            default:
                label = "The following may be adressed:"
                break;
        }

        return label;
    }   

    /**
     * Open submit status dialog
     */
    openSubmitStatusDialog(submitStatus: any = this.submitStatus) {
        let ngbModalOptions: NgbModalOptions = {
            backdrop: 'static',
            keyboard: false,
            windowClass: "modal-small",
            size: 'lg'
        };

        this.modalRef = this.modalService.open(SubmitStatusComponent, ngbModalOptions);
        this.modalRef.componentInstance.submitStatus = submitStatus;
        this.modalRef.componentInstance.showHeaderFooter = true;
        this.modalRef.componentInstance.activeTabIndex = this.activeTabIndex;
        this.modalRef.componentInstance.returnValue.subscribe(
            (submit) => {
                    console.log("User closed submit status window.");//Do nothing
            }, 
            (reason) => {
                console.log("User canceled submit.");//Do nothing
            }
        );
    }    

    processCommand(event: any) {
        switch (event) {
            case 'openPopup':
                this.openSubmitStatusDialog();
                break;
        }
    }
}
