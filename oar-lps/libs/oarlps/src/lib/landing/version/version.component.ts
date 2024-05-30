import { Component, OnChanges, Input, ViewChild, ElementRef } from '@angular/core';

import { AppConfig } from '../../config/config';
import { NerdmRes } from '../../nerdm/nerdm';
import { LandingConstants } from '../constants';
import { EditStatusService } from '../editcontrol/editstatus.service';
import { LandingpageService, HelpTopic } from '../landingpage.service';
import { MetadataUpdateService } from '../editcontrol/metadataupdate.service';
import { Themes, ThemesPrefs, AppSettings, SectionMode, SectionHelp, MODE, SectionPrefs, Sections, SubmitResponse } from '../../shared/globals/globals';
import { NotificationService } from '../../shared/notification-service/notification.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

interface reference {
    refType?: string,
    "@id"?: string,
    label?: string,
    location?: string
}

/**
 * a component that renders a resource's release version and date information.
 * 
 * This component includes the following features:
 *   * initially the component displays the current version, release date, and update 
 *     date (if present) in a single line
 *   * the version includes an "expand" widget that opens a listing of the version history
 *   * if the version being viewed is not the latest, a link appears to the latest
 */
@Component({
    selector: 'pdr-version',
    templateUrl: './version.component.html',
    styleUrls: [ '../landing.component.scss' ],
    animations: [
        trigger('editExpand', [
        state('collapsed', style({height: '0px', minHeight: '0'})),
        state('expanded', style({height: '*'})),
        transition('expanded <=> collapsed', animate('625ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ])
    ]
})
export class VersionComponent implements OnChanges {
    visibleHistory = false;
    newer : reference = null;
    lpssvc : string = null;
    public EDIT_MODES: any = LandingConstants.editModes;
    editMode: string;
    fieldName = SectionPrefs.getFieldName(Sections.VERSION);
    dataChanged: boolean = false;
    editBlockStatus: string = 'collapsed';
    overflowStyle: string = 'hidden';

    major: number = 1;  // Current value
    prevMajor: number = 1;  // Previous value. For undo purpose.
    originalMajor: number = 1; // Original value. For restore purpose.
    minor: number = 0;  // Current value
    prevMinor: number = 1;  // Previous value. For undo purpose.
    originalMinor: number = 0;  // Original value. For restore purpose.
    patch: number = 0;  // Current value
    prevPatch: number = 1;  // Previous value. For undo purpose.
    originalPatch: number = 0;  // Original value. For restore purpose.

    // @ViewChild('minor') minorElement: ElementRef;
    
    @Input() record: NerdmRes = null;

    /**
     * create the component
     * @param cfg   the app configuration data
     */
    constructor(private cfg : AppConfig,
        public mdupdsvc: MetadataUpdateService,
        public editstatsvc: EditStatusService,
        private notificationService: NotificationService,
        public lpService: LandingpageService) {

        this.lpssvc = this.cfg.get('locations.landingPageService',
                                   'https://data.nist.gov/od/id/');

        this.lpService.watchEditing((sectionMode: SectionMode) => {
        if( sectionMode ) {
            if(sectionMode.sender != SectionPrefs.getFieldName(Sections.SIDEBAR)) {
                if( sectionMode.section != this.fieldName && sectionMode.mode != MODE.NORNAL) {
                    if(this.isEditing && this.dataChanged){
                        this.onSave(false); // Do not refresh help text 
                    }
                    this.setMode(MODE.NORNAL,false);
                }
            }else { // Request from side bar, if not edit mode, start editing
                if( !this.isEditing && sectionMode.section == this.fieldName && this.mdupdsvc.isEditMode) {
                    this.startEditing();
                }
            }
        }
    })    

    }

    ngOnInit(): void {
        // Watch current edit mode set by edit controls
        this.editstatsvc.watchEditMode((editMode) => {
            this.editMode = editMode;
        });

        // let editmode = this.mdupdsvc.isEditMode;
    }

    ngOnChanges() {
        if (this.record)
            this.assessNewer(); 
    }

    /**
     * toggle the visibility of the version history
     */
    expandHistory() {
        this.visibleHistory = !this.visibleHistory;
        return this.visibleHistory;
    }

    /**
     * create an HTML rendering of a version string for a NERDm VersionRelease.  
     * If there is information available for linking to version's home page, a 
     * link is returned.  Otherwise, just the version is returned (prepended 
     * with a "v").
     */
    renderRelVer(relinfo, thisversion) {
        if (thisversion == relinfo.version)
            return "v" + relinfo.version;
        return this.renderRelAsLink(relinfo, "v" + relinfo.version);
    }

    renderRelAsLink(relinfo, linktext) {
        let out: string = linktext;
        if (relinfo.location)
            out = '<a href="' + relinfo.location + '">' + linktext + '</a>';
        else if (relinfo['@id']) {
            if (relinfo['@id'].startsWith("doi:"))
                out = '<a href="https://doi.org/' + relinfo['@id'].substring(4) + '">' + linktext + '</a>';
            else if (relinfo['@id'].startsWith("ark:/88434/"))
                out = '<a href="'+ this.lpssvc + relinfo['@id'].substring("ark:/88434/".length) +
                      '">' + linktext + '</a>';
            else if (relinfo['@id'].match(/^https?:\/\//))
                out = '<a href="'+ relinfo['@id'] + '">' + linktext + '</a>';
        }
        return out;
    }

    /**
     * return a rendering of a release's ID.  If possible, the ID will be 
     * rendered as a link.  If there is no ID, a link with the text "View..." 
     * is returned. 
     */
    renderRelId(relinfo, thisversion) {
        if (thisversion == relinfo.version)
            return "this version";
        let id: string = "View...";
        if (relinfo['@id']) id = relinfo['@id'];
        if (this.editMode != this.EDIT_MODES.VIEWONLY_MODE)
            return id;
        else
            return this.renderRelAsLink(relinfo, id);
    }

    get updated() { return this.mdupdsvc.fieldUpdated(this.fieldName); }
    get isEditing() { return this.editMode==MODE.EDIT }
    get isNormal() { return this.editMode==MODE.NORNAL }

    onMajorChanged(event) {
        this.minor = 0;
        this.patch = 0;
    }

    onMinorChanged(event) {
        this.patch = 0;
    }

    startEditing(refreshHelp: boolean = true) {
        // Save currect version numbers for undo purpose
        this.prevMajor = this.major;
        this.prevMinor = this.minor;
        this.prevPatch = this.patch;

        this.setMode(MODE.EDIT, refreshHelp, MODE.EDIT);
    }

    /**
     * Save topics.
     * @param refreshHelp Indicates if help content needs be refreshed.
     */
    onSave(refreshHelp: boolean = true) {
        var postMessage: any = {};
        postMessage[this.fieldName] = this.record[this.fieldName];
        
        this.mdupdsvc.update(this.fieldName, postMessage).then((updateSuccess) => {
            // console.log("###DBG  update sent; success: "+updateSuccess.toString());
            if (updateSuccess) {
                this.notificationService.showSuccessWithTimeout("Version updated.", "", 3000);
            } else{
                let msg = "acknowledge version update failure";
                console.error(msg);
            }
        });

        this.setMode();
        this.dataChanged = false;
    }

    /**
     * Cancel current editing. Set this section to normal mode. Restore topics from previously saved ones.
     */    
    cancelEditing() {
        this.major = this.prevMajor;
        this.minor = this.prevMinor;
        this.patch = this.prevPatch;

        this.setMode(MODE.NORNAL);
        this.dataChanged = false;
    }

    /*
     *  Restore original value. If no more field was edited, delete the record in staging area.
     */
    restoreOriginal() {
        this.mdupdsvc.undo(this.fieldName).then((success) => {
            if (success){
                this.dataChanged = false;
                this.notificationService.showSuccessWithTimeout("Reverted changes to landingpage.", "", 3000);
                this.setMode();
            }else
                console.error("Failed to undo landingpage metadata")
        });
    }

    /**
     * Set the GI to different mode
     * @param editmode edit mode to be set
     */
    setMode(editmode: string = MODE.NORNAL, refreshHelp: boolean = true, help_topic: string = MODE.EDIT) {
        let sectionMode: SectionMode = {} as SectionMode;
        this.editMode = editmode;
        sectionMode.sender = this.fieldName;
        sectionMode.section = this.fieldName;
        sectionMode.mode = this.editMode;

        if(refreshHelp){
            if(editmode == MODE.NORNAL) help_topic = MODE.NORNAL;

            this.refreshHelpText(help_topic);
        }

        switch ( this.editMode ) {
            case MODE.EDIT:
                this.editBlockStatus = 'expanded';
                this.overflowStyle = 'hidden';
                setTimeout(() => {
                    this.overflowStyle = 'visible';
                }, 1000);
                break;
 
            default: // normal
                // Collapse the edit block
                this.editBlockStatus = 'collapsed'
                this.overflowStyle = 'hidden';
                break;
        }

        //Broadcast the current section and mode
        if(editmode != MODE.NORNAL)
            this.lpService.setEditing(sectionMode);
    }

    /**
     * If version info exists, get major, minor and patch. 
     * Otherwise set version to default value 1.0.0.
     */
    getVersionDetails() {
        if(this.record["version"]) {
            this.major = this.record["version"].split(".")[0];
            this.prevMajor = this.major;
            this.originalMajor = this.major;
            this.minor = this.record["version"].split(".")[1];
            this.prevMinor = this.minor;
            this.originalMajor = this.minor;
            this.patch = this.record["version"].split(".")[2];
            this.prevPatch = this.patch;
            this.originalMajor = this.patch;
        }else{
            this.major = 1;
            this.prevMajor = this.major;
            this.originalMajor = this.major;
            this.minor = 0;
            this.prevMinor = this.minor;
            this.originalMinor = this.minor;
            this.patch = 0;
            this.prevPatch = this.patch;
            this.originalPatch = this.patch;
        }
    }

    /**
     * analyze the resource metadata to determine if a newer version is 
     * available.  Currently, this looks in three places (in order) within the 
     * NERDm record:
     * <ol>
     *   <li> the 'isReplacedBy' property </li>
     *   <li> as a 'isPreviousVersionOf' reference in the references list.
     *   <li> in the 'versionHistory' property </li>
     * </ol>
     * The checks for last two places may be removed in a future release. 
     */
    assessNewer() {
        if (!this.record) return;

        // look for the 'isReplacedBy'; this is expected to be inserted into the
        // record on the fly by the server based on the values of 'replaces' in
        // all other resources.
        if (this.record['isReplacedBy']) {
            this.newer = this.record['isReplacedBy'];
            // if (!this.newer['refid']) this.newer['refid'] = this.newer['@id'];
            return;
        }

        // look for a reference with refType="isPreviousVersionOf"; the
        // referenced resource is a newer version. 
        if (this.record['references']) {
            for (let ref of this.record['references']) {
                if (ref.refType == "IsPreviousVersionOf" && (ref.label || ref['@id'])) {
                    this.newer = ref;
                    // if (!this.newer['refid']) this.newer['refid'] = this.newer['@id'];
                    if (!this.newer.label) this.newer.label = ref.newer['@id'];
                    return;
                }
            }
        }

        // look at the version history to see if there is a newer version listed
        if (this.record['version'] && this.record['versionHistory']) {
            let history = this.record['versionHistory'];
            history.sort(compare_histories);

            var thisversion = this.record['version'];
            var p = thisversion.indexOf('+');    // presence indicates this is an update
            if (p >= 0) thisversion = thisversion.substring(0, p)   // strip off +...

            if (history[history.length - 1]['version'] != thisversion &&
                compare_histories(history[history.length - 1],
                                  {
                                      version: thisversion,
                                      issued: this.record['modified']
                                  }) > 0)
            {
                // this version is older than the latest one in the history
                this.newer = JSON.parse(JSON.stringify(history[history.length - 1]));
                // if (!this.newer['refid']) this.newer['refid'] = this.newer['@id'];
                this.newer['label'] = this.newer['version'];
                if (!this.newer['location'] && this.newer['@id']) {
                    if (this.newer['@id'].startsWith("doi:"))
                        this.newer.location = 'https://doi.org/' + this.newer['@id'].substring(4);
                    else if (this.newer['refid'].startsWith("ark:/88434/"))
                        this.newer.location = this.lpssvc + this.newer['@id'].substring("ark:/88434/".length);
                }
            }
        }
    }

    /**
     * Refresh the help text
     */
    refreshHelpText(help_topic: string = MODE.EDIT){
        let sectionHelp: SectionHelp = {} as SectionHelp;
        sectionHelp.section = this.fieldName;
        sectionHelp.topic = HelpTopic[help_topic];

        this.lpService.setSectionHelp(sectionHelp);
    }
}

/**
 * compare two version strings to determine a sorting order.
 * 
 * A version string is interpreted as a sequence of period-delimited fields.  Normally, the fields are 
 * integers (e.g. "1.0.12"); however a field may contain non-integers in them (e.g. "3.11.5rc2").  In the 
 * latter case, non-integers are split into their interger and string components (e.g. "5rc2" => [5,'rc',2].  
 * Each field in the first version is compared to corresponding field in the second version to determine if 
 * the first's field is less than, the same, or greater then than the second's.  If the the fields are not the 
 * same, this function returns a negative or positive number (indicating less than or greater than, 
 * respectively); if they are the same, the next field in the sequence is compared, until the end is reached.
 * 
 * Fields are compared as follows:
 *   * two integers are compared for their integer value (thus, e.g., 4 < 11).
 *   * if one of the fields is not an integer, the string is judged greater than the integer (i.e. should 
 *     be ordered as later).
 *   * if both are strings, the strings are compared lexically.
 *   * if one version has fewer fields than the other but matches the start of the other, then the 
 *     the shorter one is considered less than the other (i.e. be ordered as earlier).  
 */
export function compare_versions(a: string, b: string): number {
    let aflds: any[] = a.split(".");
    let bflds: any[] = b.split(".");
    let parse = function (out, el) {
        let intre = /[-+]?(\d+|Infinity)/g;
        let match = null;
        let li = 0;
        while (match = intre.exec(el)) {
            if (match.index > li) 
                out.push(el.substring(li, match.index));
            out.push(parseInt(match[0]));
            li = intre.lastIndex;
        }
        if (li < el.length)
            out.push(el.substring(intre.lastIndex));
        return out
    }
    aflds = aflds.reduce(parse, []);
    bflds = bflds.reduce(parse, []);
    let i: number = 0;
    let out: number = 0;
    for (i = 0; i < aflds.length && i < bflds.length; i++) {
        if (typeof aflds[i] === "number") {
            if (typeof bflds[i] === "number") {
                out = <number>aflds[i] - <number>bflds[i];
                if (out != 0) return out;
            }
            else
                return +1;
        }
        else if (typeof bflds[i] === "number")
            return -1;
        else {
            out = aflds[i].localeCompare(bflds[i]);
            if (out != 0) return out;
        }
    }
    return aflds.length - bflds.length
}

/**
 * return a normalized date string for consistant parsing and comparison of the given date.  If the 
 * input date string includes a timezone designation, it is removed.  The date is expanded as needed 
 * to include a time to the second precision.  The input string must include at least a year.  If not 
 * more precisely indicated, dates default to midnight the first of the month/year.  Illegal date strings
 * are returned unaltered.
 */
export function normalize_date(datestr : string) {
    // ignore zone designations
    if (datestr.includes("Z"))
        datestr = datestr.substring(0, datestr.indexOf("Z"));
        
    // Safari requires a "T" between date and time
    datestr = datestr.replace(" ", "T");

    let m = datestr.match(/^\s*\d{4}(-\d\d(-\d\d([ T]\d\d:\d\d(:\d\d(\.\d+)?)?)?)?)?\s*$/);
    if (! m) return datestr;
    if (! m[1]) datestr += "-01";
    if (! m[2]) datestr += "-01";
    if (! m[3]) datestr += "T00:00";
    if (! m[4]) datestr += ":00";
    return datestr
}

/**
 * compare two date strings assumed to be in ISO Date format for sorting.  
 */
export function compare_dates(a: string, b: string): number {
    a = normalize_date(a);
    b = normalize_date(b);
    let asc = -1, bsc = -1;
    try {
        asc = Date.parse(a);
        bsc = Date.parse(b);
    } catch (e) { return -1; }
    return asc - bsc;
}

/**
 * compare two version history nodes for sorting in sequence/time order.  First the issued 
 * dates are compared and then the version numbers.  
 */
export function compare_histories(a, b) {
    let out = 0;
    if (a.issued && b.issued)
        out = compare_dates(a.issued, b.issued);
    if (out == 0)
        out = compare_versions(a.version, b.version);
    return out;
}

