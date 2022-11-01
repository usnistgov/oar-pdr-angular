import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { state, style, trigger, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  animations: [
    trigger("togglesbar", [
        state('sbvisible', style({
            position: 'absolute',
            right: '0%',
            top: "20%",
            bottom: "100%"
        })),
        state('sbhidden', style({
            position: 'absolute',
            right: '-140%',
            top: "20%",
            bottom: "100%"
        })),
        transition('sbvisible <=> sbhidden', [
            animate('.5s cubic-bezier(0.4, 0.0, 0.2, 1)')
        ])
    ])
]
})
export class SidebarComponent implements OnInit {
    sbarvisible : boolean = true;
    sidebarState: string = 'sbvisible';

    // helpContent: any = {
    //     "title": "<p>With this question, you are telling us the <i>type</i> of product you are publishing. Your publication may present multiple types of products--for example, data plus software to analyze it--but, it is helpful for us to know what you consider is the most important product. And don't worry: you can change this later. <p> <i>[Helpful examples, links to policy and guideance]</i>", "description": "Placeholder for description editing help."
    // }

    @Input() helpContent: any = {};
    @Output() sbarvisible_out = new EventEmitter<boolean>();

    constructor(private chref: ChangeDetectorRef) { }

    ngOnInit(): void {
    }


    /**
     * toggle whether the sidebar is visible.  When this is called, a change in 
     * in the visiblity of the sidebar will be animated (either opened or closed).
     */
    toggleSbarView() {
        this.sbarvisible = ! this.sbarvisible;

        this.sidebarState = this.sbarvisible? 'sbvisible' : 'sbhidden';
        this.sbarvisible_out.next(this.sbarvisible);
        this.chref.detectChanges();
        console.log("toggling view: " + this.sbarvisible);
    }
}
