import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar.component';
import { SidebarService } from './sidebar.service';

@NgModule({
    declarations: [SidebarComponent],
    imports: [
        CommonModule
    ],
    exports: [
            SidebarComponent
    ],
    providers: [
        SidebarService
    ]
})
export class SidebarModule { }

export {
    SidebarComponent
};