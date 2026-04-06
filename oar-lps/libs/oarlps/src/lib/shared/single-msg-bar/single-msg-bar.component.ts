import { Component, Input, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
    faCircleXmark
} from '@fortawesome/free-solid-svg-icons';
import { iconClass } from '../globals/globals';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'lib-single-msg-bar',
  standalone: true,
  imports: [CommonModule, TooltipModule, NgbModule, FontAwesomeModule],
  templateUrl: './single-msg-bar.component.html',
  styleUrls: ['./single-msg-bar.component.css']
})
export class SingleMsgBarComponent {
    //Icons
    closeIcon = iconClass.CIRCLE_XMARK;

    faCircleXmark = faCircleXmark;

    @Input() message: string = "";
    @Output() command_out: EventEmitter<any> = new EventEmitter();

    constructor(public iconLibrary: FaIconLibrary) {
        // this.iconLibrary.addIcons(faCircleXmark);
    }

    /**
     * Emit command to parent component
     * @param cmd command
     */
    commandOut(cmd: string) {
        this.command_out.emit({"command": cmd});
    }  
}
