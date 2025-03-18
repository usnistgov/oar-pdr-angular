import { Component, Input } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { SectionMode, SectionHelp, MODE, Sections, SectionPrefs } from '../../../shared/globals/globals';

@Component({
    selector: 'lib-facilitators-pub',
    standalone: true,
    imports: [],
    templateUrl: './facilitators-pub.component.html',
    styleUrls: ['./facilitators-pub.component.css', '../facilitators.component.css', '../../landing.component.scss'],
    animations: [
        trigger('detailExpand', [
        state('collapsed', style({height: '0px', minHeight: '0', display: 'none'})),
        state('expanded', style({height: '*'})),
        transition('expanded <=> collapsed', animate(625)),
        //   transition('expanded <=> collapsed', animate('625ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
        trigger('editExpand', [
            state('collapsed', style({height: '0px', minHeight: '0'})),
            state('expanded', style({height: '*'})),
            transition('expanded <=> collapsed', animate('625ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ])
    ]
})
export class FacilitatorsPubComponent {
    facilitators: any[] = [];
    clickFacilitators: boolean = false;
    isCollapsedContent: boolean = true;
    fieldName = SectionPrefs.getFieldName(Sections.FACILITATORS);
    editBlockStatus: string = 'collapsed';
    overflowStyle: string = 'hidden';

    @Input() record: any[];
    @Input() inBrowser: boolean;   // false if running server-side

    ngOnInit(): void {
        if(this.record["facilitators"]){
            this.facilitators = this.record["facilitators"];
        }
    }

    clicked = false;
    expandClick() {
        this.clicked = !this.clicked;
        return this.clicked;
    }

    /**
     * This function trys to resolve the following problem: If overflow style is hidden, the tooltip of the top row
     * will be cut off. But if overflow style is visible, the animation is not working.
     * This function set delay to 1 second when user expands the edit block. This will allow animation to finish. 
     * Then tooltip will not be cut off. 
     */
    setOverflowStyle() {
        if(this.editBlockStatus == 'collapsed') {
            this.overflowStyle = 'hidden';
        }else {
            this.overflowStyle = 'hidden';
            setTimeout(() => {
                this.overflowStyle = 'visible';
            }, 1000);
        } 
    }

    getSubunites(subunites) {
        if(subunites instanceof Array)
        {
            return subunites.join(', ');
        }else{
            return subunites;
        }
    }
}
