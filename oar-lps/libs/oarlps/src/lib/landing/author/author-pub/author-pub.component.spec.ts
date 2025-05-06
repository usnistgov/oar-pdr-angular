import { ComponentFixture, TestBed } from '@angular/core/testing';
import { testdata } from '../../../../environments/environment';
import { AuthorPubComponent } from './author-pub.component';

describe('AuthorPubComponent', () => {
    let component: AuthorPubComponent;
    let fixture: ComponentFixture<AuthorPubComponent>;
    let rec = testdata['test2'];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
        imports: [AuthorPubComponent]
        })
        .compileComponents();

        fixture = TestBed.createComponent(AuthorPubComponent);
        component = fixture.componentInstance;
        component.record = rec;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
