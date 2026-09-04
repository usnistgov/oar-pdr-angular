import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { FontAwesomeTestingModule } from "@fortawesome/angular-fontawesome/testing";
import { FaTestingConfig } from "@fortawesome/angular-fontawesome/testing";

import { AuthorMidasComponent } from "./author-midas.component";
import { AuthorListComponent } from "../author-list/author-list.component";
import { AuthorPubComponent } from "../author-pub/author-pub.component";

import { MetadataUpdateService } from "../../editcontrol/metadataupdate.service";
import { EditStatusService } from "../../editcontrol/editstatus.service";
import { LandingpageService } from "../../landingpage.service";
import { NotificationService } from "../../../shared/notification-service/notification.service";
import { GlobalService } from "../../../shared/globals/globals";

/**
 * Stub AuthorListComponent.
 *
 * We don't want AuthorMidasComponent's unit test to initialize the
 * real AuthorListComponent and all of its dependencies.
 */
@Component({
    selector: "lib-author-list",
    standalone: true,
    template: "",
})
class MockAuthorListComponent {
    @Input() record: any;
    @Input() fieldName: string;
    @Input() startEditing = false;

    @Output() dataChanged = new EventEmitter<any>();
    @Output() editmodeOutput = new EventEmitter<any>();

    onSectionModeChanged = jest.fn();
    undoAllChanges = jest.fn();
}

/**
 * Stub AuthorPubComponent.
 */
@Component({
    selector: "author-pub",
    standalone: true,
    template: "",
})
class MockAuthorPubComponent {
    @Input() record: any;
    @Input() fieldName: string;
}

describe("AuthorMidasComponent", () => {
    let component: AuthorMidasComponent;
    let fixture: ComponentFixture<AuthorMidasComponent>;

    let metadataUpdateService: any;
    let editStatusService: any;
    let landingpageService: any;
    let notificationService: any;
    let globalService: any;

    beforeEach(async () => {
        metadataUpdateService = {
            anyFieldUpdated: jest.fn().mockReturnValue(false),
            undo: jest.fn().mockResolvedValue(true),
            getFieldStyle: jest.fn().mockReturnValue({}),
        };

        editStatusService = {};

        landingpageService = {
            watchEditing: jest.fn(),
            setEditing: jest.fn(),
            setSectionHelp: jest.fn(),
            setCurrentSection: jest.fn(),
        };

        notificationService = {
            showSuccessWithTimeout: jest.fn(),
        };

        globalService = {};

        await TestBed.configureTestingModule({
            imports: [
                AuthorMidasComponent,
                NoopAnimationsModule,
                FontAwesomeTestingModule,
            ],

            providers: [
                {
                    provide: MetadataUpdateService,
                    useValue: metadataUpdateService,
                },
                {
                    provide: EditStatusService,
                    useValue: editStatusService,
                },
                {
                    provide: LandingpageService,
                    useValue: landingpageService,
                },
                {
                    provide: NotificationService,
                    useValue: notificationService,
                },
                {
                    provide: GlobalService,
                    useValue: globalService,
                },
                {
                    provide: FaTestingConfig,
                    useValue: {
                        circleIcon: "undo",
                    },
                },
            ],
        })
            .overrideComponent(AuthorMidasComponent, {
                remove: {
                    imports: [AuthorListComponent, AuthorPubComponent],
                },
                add: {
                    imports: [MockAuthorListComponent, MockAuthorPubComponent],
                },
            })
            .compileComponents();

        fixture = TestBed.createComponent(AuthorMidasComponent);
        component = fixture.componentInstance;

        component.record = require("../../../../assets/sampleRecord.json");

        // Supply the other @Inputs expected by the component.
        component.fieldName = "authors";
        component.isEditMode = true;

        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
