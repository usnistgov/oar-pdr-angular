import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { GoogleAnalyticsService } from '../../../shared/ga-service/google-analytics.service';
import { SubmissionStatus, SubmissionFeedback } from '../../../shared/globals/globals';
import { SubmitFeedbackComponent } from '../submit-feedback/submit-feedback.component';
import {
    faXmark, faArrowUpRightFromSquare, faComments 
} from '@fortawesome/free-solid-svg-icons';


@Component({
    selector: "submit-status-nps",
    standalone: true,
    imports: [
        CommonModule,
        FontAwesomeModule,
        SubmitFeedbackComponent,
    ],
    templateUrl: "./submit-status-nps.component.html",
    styleUrl: "./submit-status-nps.component.css",
})
export class SubmitStatusNpsComponent {
    //Icons
    faXmark = faXmark;
    faComments = faComments;
    faArrowUpRightFromSquare = faArrowUpRightFromSquare;

    //Feedback arrays
    req: any[] = [];
    warn: any[] = [];
    comment: any[] = [];
    noType: any[] = [];

    @Input() submitStatus: SubmissionStatus = {} as SubmissionStatus;
    @Input() showFeedback: boolean = true;
    @Output() returnValue: EventEmitter<any> = new EventEmitter();

    constructor(private gaService: GoogleAnalyticsService) {}

    ngOnInit() {
        this.reloadFeedback();
    }

    get hasSubmitStatusData() {
        let reviewSystems = Object.keys(this.submitStatus);
        return reviewSystems && reviewSystems.length > 0;
    }

    get hasFeedback() {
        return (
            this.hasSubmitStatusData &&
            this.submitStatus.feedback &&
            this.submitStatus.feedback.length > 0
        );
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.reloadFeedback();
    }

    /**
     * Load the feedback into different arraies for display.
     * Currently we have 4 feedback types:
     * req: this feedback must be addressed.
     * warn: addressing this feedback is highly recommanded.
     * comment: will be nice to address this feedback
     * noType: feedback that has not been categorized.
     */
    reloadFeedback() {
        this.req = [];
        this.warn = [];
        this.comment = [];
        this.noType = [];

        if (
            this.submitStatus &&
            this.submitStatus.feedback &&
            this.submitStatus.feedback.length > 0
        ) {
            this.submitStatus.feedback.forEach((feedback) => {
                switch (feedback.type) {
                    case "req":
                        this.req.push({
                            desc: feedback.description,
                            reviewer: feedback.reviewer,
                        });
                        break;
                    case "warn":
                        this.warn.push({
                            desc: feedback.description,
                            reviewer: feedback.reviewer,
                        });
                        break;
                    case "comment":
                        this.comment.push({
                            desc: feedback.description,
                            reviewer: feedback.reviewer,
                        });
                        break;
                    default:
                        this.noType.push({
                            desc: feedback.description,
                            reviewer: feedback.reviewer,
                        });
                        break;
                }
            });
        }
    }

    openSubmitStatusPopup() {
        this.returnValue.emit("openSubmitStatusPopup");
    }

    /**
     * Google Analytics track event
     * @param url - URL that user visit
     * @param event - action event
     * @param title - action title
     */
    googleAnalytics(url: string, event: any, title: string) {
        this.gaService.gaTrackEvent("accesspage", event, title, url);
    }
}
