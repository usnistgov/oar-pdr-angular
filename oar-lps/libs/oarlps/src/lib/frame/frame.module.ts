import { ModuleWithProviders, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from '@angular/router';
import { HeadbarComponent } from "./headbar.component";
import { FootbarComponent } from "./footbar.component";
import { MessageBarComponent } from "./messagebar.component";
import { IEnvironment } from '../../environments/ienvironment';
import { environment } from '../../environments/environment-impl';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';

/**
 * A module that provides components that make up the "frame" of the landing 
 * page--namely, the header and the footer.
 */
@NgModule({
    declarations: [
        HeadbarComponent,
        FootbarComponent,
        MessageBarComponent
    ],
    providers: [

    ],
    imports: [
        CommonModule,       // provides template directives
        RouterModule,        // allow use of [routerLink]
        FontAwesomeModule
    ],
    exports: [ HeadbarComponent, FootbarComponent, MessageBarComponent ]
})
export class FrameModule {
    public static forRoot(): ModuleWithProviders<FrameModule> {
        return {
          ngModule: FrameModule,
          providers: [

          ]
        };
    }
}

export {
    HeadbarComponent, FootbarComponent, MessageBarComponent
}
