import { Component, Input, OnInit, EventEmitter, Output, ElementRef, ViewChild, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { NerdmRes, NERDResource } from '../../../nerdm/nerdm';
import { LandingpageService, HelpTopic } from '../../landingpage.service';
import { SectionMode, SectionHelp, MODE, Sections, SectionPrefs } from '../../../shared/globals/globals';
import { MetadataUpdateService } from '../../editcontrol/metadataupdate.service';
import { TreeNode } from 'primeng/api';
import { TaxonomyListService } from '../../../shared/taxonomy-list';
import { UserMessageService } from '../../../frame/usermessage.service';
import { OverlayPanel } from 'primeng/overlaypanel';
import { NotificationService } from '../../../shared/notification-service/notification.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TreeTableModule } from 'primeng/treetable';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { OverlayPanelModule } from 'primeng/overlaypanel';

export const ROW_COLOR = '#1E6BA1';

@Component({
    selector: 'lib-topic-edit',
    standalone: true,
    imports: [        
        CommonModule,
        FormsModule,
        ButtonModule,
        NgbModule,
        OverlayPanelModule,
        TreeTableModule],
    templateUrl: './topic-edit.component.html',
    styleUrls: ['../../landing.component.scss', './topic-edit.component.css']
})
export class TopicEditComponent implements OnInit {
    fieldName = 'theme';
    editMode: string = MODE.NORNAL; 
    dataChanged: boolean = false;

    isVisible: boolean = true;
    scrollTop: number = 0;
    searchText: string = "";
    highlight: string = "";
    taxonomyList: any[];
    taxonomyTree: TreeNode[] = [];
    toggle: Boolean = true;  
    originalSelectedTopicsTopics: any[] = [];
    // selectedTopics: any[] = [];

    @Input() record: NerdmRes = null;
    @Input() inBrowser: boolean;
    @Input() collection: string;
    @Input() selectedTopics: any[] = [];
    @Input() scheme: string = "";
    @Output() dataChangedOutput: EventEmitter<any> = new EventEmitter();
    @Output() cmdOutput: EventEmitter<any> = new EventEmitter();

    // @ViewChild('panel', { read: ElementRef }) public panel: ElementRef<any>;
    @ViewChild('panel0', { read: ElementRef, static: true }) public panel0: ElementRef<any>;


    constructor(
        public mdupdsvc: MetadataUpdateService,
        private taxonomyListService: TaxonomyListService,
        private chref: ChangeDetectorRef,
        private notificationService: NotificationService,
        private msgsvc: UserMessageService) { }

    ngOnInit(): void {
        //Clone this.nistTaxonomyTopics
        // this.cloneArray(this.selectedTopics, this.originalSelectedTopicsTopics);

        // for(let obj of this.selectedTopicObjs) {
        //     this.selectedTopics.push(obj.tag);
        // }

        this.taxonomyListService.get(0).subscribe((result) => {
            if (result != null && result != undefined)
                this.buildTaxonomyTree(result);
    
            this.taxonomyList = [];
            for (var i = 0; i < result.length; i++) {
                this.taxonomyList.push({ "taxonomy": result[i].label });
            }
    
            this.setTreeVisible(true);
    
        }, (err) => {
            console.error("Failed to load taxonomy terms from server: "+err.message);
            this.msgsvc.warn("Failed to load taxonomy terms; you may have problems editing the "+
                            "topics assigned to this record.");
        });
    }

    /**
     * Once input record changed, refresh the topic list 
     * @param changes 
     */
    ngOnChanges(changes: SimpleChanges): void {
        // this.cloneArray(this.selectedTopics, this.originalSelectedTopicsTopics);

        // for(let obj of this.selectedTopicObjs) {
        //     this.selectedTopics.push(obj.tag);
        // }        
    }

    /**
     * a field indicating if this data has beed edited
     */
    get updated() { return this.mdupdsvc.fieldUpdated(this.fieldName); }

    get isEditing() { return this.editMode==MODE.EDIT }

    get isNormal() { return this.editMode==MODE.NORNAL }

    reset() {
        this.dataChanged = false;
        this.editMode = MODE.NORNAL;
        this.isVisible = true;
    }

    // cloneArray(sourceArray: any[], targetArray: any[]) {
    //     if(!sourceArray) 
    //         targetArray = sourceArray;
    //     else{
    //         targetArray = [];
    //         sourceArray.forEach(val => targetArray.push(val));
    //     }
    // }

    /*
        *   build taxonomy tree
        */
    buildTaxonomyTree(result: any) {
        let allTaxonomy: any = result;
        var tempTaxonomyTree = {}
        if (result != null && result != undefined) {
            tempTaxonomyTree["data"] = this.arrangeIntoTaxonomyTree(result);
            this.taxonomyTree.push(tempTaxonomyTree);
        }

        this.taxonomyTree = <TreeNode[]>this.taxonomyTree[0].data;
    }

    private arrangeIntoTaxonomyTree(paths) {
        const tree = [];

        if(paths) {
            paths.forEach((path) => {
                var fullpath: string;
                if (path.parent != null && path.parent != undefined && path.parent != "")
                    fullpath = path.parent + ":" + path.label;
                else
                    fullpath = path.label;

                const pathParts = fullpath.split(':');
                let currentLevel = tree; // initialize currentLevel to root

                for (var j = 0; j < pathParts.length; j++) {
                    let tempId: string = '';
                    for (var k = 0; k < j + 1; k++) {
                        tempId = tempId + pathParts[k];
                        // tempId = tempId + pathParts[k].replace(/ /g, "");
                        if (k < j) {
                            tempId = tempId + ": ";
                        }
                    }

                    // check to see if the path already exists.
                    const existingPath = currentLevel.filter(level => level.data.treeId === tempId);
                    if (existingPath.length > 0) {
                        // The path to this item was already in the tree, so don't add it again.
                        // Set the current level to this path's children  
                        currentLevel = existingPath[0].children;
                    } else {
                        let newPart = null;
                        newPart = {
                            data: {
                                treeId: tempId,
                                name: pathParts[j],
                                researchTopic: tempId,
                                bkcolor: 'white'
                            }, children: [],
                            expanded: false
                        };
                        currentLevel.push(newPart);
                        currentLevel = newPart.children;
                    }
                };
            });
        }
        
        return tree;
    }

    undoCurrentChanges() {
        //Revert this.nistTaxonomyTopics
        // this.cloneArray(this.originalSelectedTopicsTopics ,this.selectedTopics);  
        this.cmdOutput.emit({"command": 'undoCurrentChanges'});
        this.reset();
    }



    /**
     * Save topics.
     * @param refreshHelp Indicates if help content needs be refreshed.
     */
    onSave(refreshHelp: boolean = true) {
        this.dataChanged = false;
        this.cmdOutput.emit({'command':'saveTopics','selectedTopics':this.selectedTopics});

        // let postMessage: any = {};

        // postMessage[this.fieldName] = this.selectedTopics;
        // this.record[this.fieldName] = this.selectedTopics;
        // console.log("postMessage", postMessage);
        // this.mdupdsvc.update(this.fieldName, postMessage).then((updateSuccess) => {
        //     // console.log("###DBG  update sent; success: "+updateSuccess.toString());
        //     if (updateSuccess) {
        //         this.dataChanged = false;
        //         this.commandOut('saveTopics');
        //         this.notificationService.showSuccessWithTimeout("Research topics updated.", "", 3000);
        //     } else
        //         console.error("acknowledge topic update failure");
        // });
    }

    /**
     * Delete a topic
     */
    deleteTopic(index: number) {
        if(!this.selectedTopics) return;

        this.setTreeVisible(true);
        this.searchAndExpandTaxonomyTree(this.selectedTopics[index], false);
        this.selectedTopics = this.selectedTopics.filter(topic => topic != this.selectedTopics[index]);
        this.refreshTopicTree();
        this.dataChanged = true;
    }
    
    /**
     * Update the topic list
     */
    updateTopics(rowNode: any) {
        if(!this.selectedTopics) this.selectedTopics = [];
        this.toggle = false;
        const existingTopic = this.selectedTopics.filter(topic => topic == rowNode.node.data.researchTopic);
        if (existingTopic == undefined || existingTopic == null || existingTopic.length == 0) {
            //Need to create a topic object before push
            // this.selectedTopics.push(
            //     { "@id": "", "@type": "", "tag": rowNode.node.data.researchTopic, "scheme": this.scheme} );

            this.selectedTopics.push(rowNode.node.data.researchTopic);
    
                this.dataChanged = true;
            // Reset search text box
            if (this.searchText != "") {
                this.searchText = "";
                this.onSearchTextChange();
            }
        }
    }

    /*
    *   Set text color if the given topic already exists
    */
    getTopicColor(rowNode: any) {
        // console.log("this.tempTopics", this.tempTopics);
        if(!this.selectedTopics) return ROW_COLOR;

        const existingTopic = this.selectedTopics.filter(topic => topic == rowNode.node.data.researchTopic);
        if (existingTopic == undefined || existingTopic == null || existingTopic.length <= 0) {
            return ROW_COLOR;
        } else {
            return 'lightgrey';
        }
    }

    /*
    *   Set cursor type
    */
    getTopicCursor(rowNode: any) {
        if(!this.selectedTopics) return 'default';

        const existingTopic = this.selectedTopics.filter(topic0 => topic0 == rowNode.node.data.researchTopic);
        if (existingTopic == undefined || existingTopic == null || existingTopic.length <= 0)
            return 'pointer';
        else
            return 'default';
    }

    searchAndExpandTaxonomyTree(topic: string, option: boolean) {
        var index: number;

        this.expandTree(this.taxonomyTree, false);
        this.setTreeVisible(true, 'white');
        // First hide all tree node
        // this.setTreeVisible(false);
        this.resetTreeBackColor(this.taxonomyTree);
        var treeNode: TreeNode = null;
        for (let i = 0; treeNode == null && i < this.taxonomyTree.length; i++) {
        treeNode = this.searchTreenode(this.taxonomyTree[i], topic);
        }
        if (treeNode != null) {
        if (treeNode.parent != null)
            this.setVisible(treeNode.parent.children, true);

        treeNode.data.visible = true;
        if (option)
            treeNode.data.bkcolor = 'lightyellow';
        else
            treeNode.data.bkcolor = 'white';
        }

        if (option) {
        var child = treeNode;
        while (treeNode != null) {
            if (treeNode.parent != null) {
            treeNode.parent.expanded = true;
            treeNode.parent.data.visible = true;
            }
            child = treeNode;
            treeNode = treeNode.parent;
        }

        index = this.taxonomyTree.findIndex(x => x === child);
        }

        this.isVisible = false;
        setTimeout(() => {
            this.isVisible = true;
        }, 0);

        setTimeout(() => {
        this.panel0.nativeElement.scrollTop = index * 30;
        }, 1);

    }

    rowVisibility(rowData: any) {
        if (rowData.visible)
        return "block";
        else
        return "none";
    }

    setTreeVisible(visible: boolean, backgroundColor?: string) {
        this.setVisible(this.taxonomyTree, visible, backgroundColor);
    }

    setVisible(tree: TreeNode[], option: boolean, backgroundColor?: string) {
        if (tree == undefined || tree == null) return;

        for (let i = 0; i < tree.length; i++) {
        if (tree[i].data != null && tree[i].data != undefined) {
            tree[i].data.visible = option;
            if (backgroundColor != null)
            tree[i].data.bkcolor = backgroundColor;
        }

        if (tree[i].children != null && tree[i].children != undefined && tree[i].children.length > 0) {
            this.setVisible(tree[i].children, option, backgroundColor);
        }
        }
    }

    /*
    *   Refresh the taxonomy tree 
    */
    refreshTopicTree() {
        this.isVisible = false;
        setTimeout(() => {
        this.isVisible = true;
        }, 0);
    }

    /*
    *   Expand/collapse treenodes
    */
    expandTree(tree: TreeNode[], option: boolean) {
        for (let i = 0; i < tree.length; i++) {
        tree[i].expanded = option;
        if (tree[i].children.length > 0) {
            this.expandTree(tree[i].children, option);
        }
        }
    }

    /*
    *   Expand/collapse treenodes
    */
    resetTreeBackColor(tree: TreeNode[]) {
        for (let i = 0; i < tree.length; i++) {
        tree[i].data.bkcolor = 'white';
        if (tree[i].children.length > 0) {
            this.resetTreeBackColor(tree[i].children);
        }
        }
    }

    /*
    *   search treeNode
    */
    searchTreenode(tree: TreeNode, topic: string) {
        if (tree.data.researchTopic == topic) {
        return tree;
        } else if (tree.children != null) {
        var i;
        var result = null;
        for (i = 0; result == null && i < tree.children.length; i++) {
            result = this.searchTreenode(tree.children[i], topic);
        }
        return result;
        }
        return null;
    }

    /*
    *   Return row background color
    */
    rowBackColor(rowData: any) {
        if (this.highlight == "") {
        if (rowData == null || rowData == undefined)
            return "white";
        else
            return rowData.bkcolor;
        } else {
        if (this.highlight == rowData.name) {
            return "#cccccc";
        }
        }
    }

    /*
    *   Return row background color
    */
    rowColor(rowNode: any) {
        if (this.highlight == "") {
            return this.getTopicColor(rowNode);
        } else {
            if (this.highlight == rowNode.node.data.name) {
                return "white";
        } else {
            return this.getTopicColor(rowNode);
        }
        }
    }

    /*
    *   Display all topics
    */
    showAllTopics() {
        this.searchText = "";
        this.setTreeVisible(true);
        this.expandTree(this.taxonomyTree, false);

        this.isVisible = false;
        setTimeout(() => {
        this.isVisible = true;
        }, 0);
    }

    /*
    *   When user changes the search text
    */
    onSearchTextChange() {
        var tree: any;
        this.setTreeVisible(false, 'white');
        this.expandTree(this.taxonomyTree, true);
        for (var i = 0; i < this.taxonomyTree.length; i++)
        this.setTreenodeVisible(this.taxonomyTree[i], this.searchText);

        this.refreshTopicTree();
    }

    /*
    *   search treeNode, if found set visible to true
    */
    setTreenodeVisible(tree: TreeNode, topic: string) {
        if (tree.data.researchTopic.toLowerCase().indexOf(topic.toLowerCase()) > -1) {
        if (tree != null) {
            tree.data.bkcolor = "#E7FFFE";
            if (tree.parent == null) {
            tree.data.visible = true;
            this.setVisible(tree.children, true);
            }
            else {
            tree.parent.data.visible = true;
            this.setVisible(tree.parent.children, true);
            }
        }
        return tree;
        } else if (tree.children != null) {
        var result = null;
        for (var i = 0; result == null && i < tree.children.length; i++) {
            this.setTreenodeVisible(tree.children[i], topic);
        }
        }
        return tree;
    }

    /*
    *   This function is used to track ngFor loop
    */
    trackByFn(index: any, author: any) {
        return index;
    }

    setHighlight(rowData: any) {
        if (rowData == "")
        this.highlight = "";
        else
        this.highlight = rowData.name;
    }

    openPopup($event, overlaypanel: OverlayPanel){
        this.toggle = true;
        setTimeout(()=>{
            if(this.toggle){
                overlaypanel.toggle($event)
            }
        },250)
    }

    /**
     * Retuen background color of the whole record (the container of all authors) 
     * based on the dataChanged flag of the record.
     * @returns the background color of the whole record
     */
    get backgroundColor() {
        let bkgroundColor = 'var(--editable)';

        if(this.dataChanged){
            bkgroundColor = 'var(--data-changed)';
        }else if(this.updated){
            bkgroundColor = 'var(--data-changed-saved)';
        }else if(this.isEditing){
            bkgroundColor = 'white';
        }

        return bkgroundColor;
    }   
    
    /**
     * Emit command to parent component
     * @param cmd command
     */
    commandOut(cmd: string) {
        this.cmdOutput.emit({"command": cmd});
    }    
}
