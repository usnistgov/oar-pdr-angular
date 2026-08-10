import { ChangeDetectorRef, Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import {
    Themes,
    Collections,
    GlobalService,
    iconClass,
} from "../../../shared/globals/globals";
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from "@angular/common";

@Component({
    selector: "lib-editcontrol-info",
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: "./editcontrol-info.component.html",
    styleUrl: "./editcontrol-info.component.css",
})
export class EditcontrolInfoComponent {
    colorScheme: any;
    buttonHover: boolean = false;

    constructor(
        public dialogRef: MatDialogRef<EditcontrolInfoComponent>,
        public globalService: GlobalService,
        private chref: ChangeDetectorRef,
    ) {
        this.globalService.watchColorPalette((colorPalette) => {
            this.colorScheme = colorPalette;
        });
    }

    ngAfterViewInit() {
        this.chref.detectChanges();
    }

    /**
     * Return Close button style
     * @returns
     */
    btnStyle() {
        return {
            "--button-text-color": "white",
            "--button-color": this.colorScheme.defaultVar,
            "--hover-color": this.colorScheme.hoverVar,
            "--disable-color": "var(--disabled-grey)",
            "--disable-text-color": "var(--disabled-grey-text)",
        };
    }

    close() {
        this.dialogRef.close(true);
    }
}
