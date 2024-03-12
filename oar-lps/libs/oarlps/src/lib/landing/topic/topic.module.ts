import { NgModule }     from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TreeTableModule } from 'primeng/treetable';
import { ToolbarModule } from 'primeng/toolbar';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ToastrModule } from 'ngx-toastr';

import { TopicComponent } from './topic.component';
import { SearchTopicsComponent } from './topic-popup/search-topics.component';
import { ButtonModule } from 'primeng/button';
import { TopicEditComponent } from './topic-edit/topic-edit.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

/**
 * module that provide support for rendering and managing a resource's list of 
 * applicable research topics
 */
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ToolbarModule,
        TreeTableModule,
        OverlayPanelModule,
        ButtonModule,
        NgbModule,
        ToastrModule.forRoot()
    ],
    declarations: [
        TopicComponent, SearchTopicsComponent, TopicEditComponent
    ],
    providers: [
    ],
    exports: [
        TopicComponent, SearchTopicsComponent
    ]
})
export class TopicModule { }

export {
    TopicComponent, SearchTopicsComponent
};

    
