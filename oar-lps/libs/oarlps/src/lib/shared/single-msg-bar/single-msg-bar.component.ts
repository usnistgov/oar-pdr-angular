import { Component, Input, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'lib-single-msg-bar',
  standalone: true,
  imports: [CommonModule, TooltipModule,],
  templateUrl: './single-msg-bar.component.html',
  styleUrls: ['./single-msg-bar.component.css']
})
export class SingleMsgBarComponent {
    @Input() message: string = "";
    @Output() command_out: EventEmitter<any> = new EventEmitter();

    /**
     * Emit command to parent component
     * @param cmd command
     */
    commandOut(cmd: string) {
        this.command_out.emit({"command": cmd});
    }  
}
