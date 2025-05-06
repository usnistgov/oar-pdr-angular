import { NgModule }     from '@angular/core';
import { CommonModule } from '@angular/common';
import { NerdmModule } from '../../nerdm/nerdm.module';
import { DoneModule } from '../done/done.module';
import { ButtonModule } from 'primeng/button';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

/**
 * A module for components that lay out the content of a resource landing page into sections.
 * Each section is handled by a different component (<tt>resource*.component</tt>), and the 
 * <tt>LandingBody</tt> (<tt>../landingbody.component</tt>) brings the sections together into 
 * the body of the landing page.  
 * <p>
 * The section components are:
 * <dl>
 *   <dt> <tt>ResourceIdentityComponent</tt> </dt>
 *   <dd> "Front matter" that identifies the resource (by title and PID), its type, authors and 
 *        contact, and the primary literature article associated with the resource. </dd>
 * 
 *   <dt> <tt>ResourceDescriptionComponent</tt> </dt>
 *   <dd> Summarizing information about the resource, including the deescription/abstract, additional
 *        discussion, subject keywords and applicable research topics.  </dd>
 * 
 *   <dt> <tt>ResourceDataComponent</tt> </dt>
 *   <dd> Information and links for accessing the data associated with this resource.  </dd>
 * 
 *   <dt> <tt>ResourceRefsComponent</tt> </dt>
 *   <dd> The reference list  </dd>
 * 
 *   <dt> <tt>ResourceMetadataComponent</tt> </dt>
 *   <dd> Access and visualization of the resource metadata, including links for exporting the 
 *        metadata in various formats and schemas.</dd>
 * </dl>
 */
@NgModule({
    imports: [
        CommonModule,
        NerdmModule,
        DoneModule,
        ButtonModule,
        NgbModule,
    ],
    declarations: [

    ],
    providers: [

    ],
    exports: [

    ]
})
export class SectionsModule { }

export {

};
    
