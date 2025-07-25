import { Component, Input, Output, NgZone, OnInit, OnChanges, SimpleChanges, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { CartService } from '../../../datacart/cart.service';
import { NerdmRes, NerdmComp } from '../../../nerdm/nerdm';
import { DataCart, DataCartItem } from '../../../datacart/cart';
import { DownloadStatus } from '../../../datacart/cartconstants';
import { DataCartStatus } from '../../../datacart/cartstatus';
import { formatBytes } from '../../../utils';
import { EditStatusService } from '../../../landing/editcontrol/editstatus.service';
import { LandingConstants } from '../../../landing/constants';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { SectionPrefs, Sections } from '../../../shared/globals/globals';
import { LandingpageService } from '../../landingpage.service';
import { UserMessageService } from '../../../frame/usermessage.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TreeTableModule } from 'primeng/treetable';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DataFileItem } from '../data-files-to-be-deleted.component';
import { NgbModalOptions, NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BulkConfirmComponent } from '../bulk-confirm/bulk-confirm.component';
import { AppConfig } from '../../../config/config';

@Component({
    selector: 'lib-datafiles-pub',
    standalone: true,
    imports: [
        CommonModule, 
        RouterModule, 
        BadgeModule,
        TreeTableModule, 
        OverlayPanelModule, 
        ProgressSpinnerModule, 
        ButtonModule, 
        TooltipModule, 
        NgbModule
    ],
    templateUrl: './datafiles-pub.component.html',
    styleUrls: [
        '../../landing.component.scss', 
        '../data-files.component.css',
        './datafiles-pub.component.css'
    ],
    animations: [
        trigger('detailExpand', [
          state('collapsed', style({height: '0px', minHeight: '0'})),
          state('expanded', style({height: '*'})),
          transition('expanded <=> collapsed', animate('625ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
        trigger('detailExpand2', [
            state('collapsed', style({opacity: 0})),
            state('expanded', style({opacity: 1})),
            transition('expanded <=> collapsed', animate('625ms')),
        ]),
        trigger(
            'enterAnimation', [
                transition(':enter', [
                    style({height: '0px', opacity: 0}),
                    animate('700ms', style({height: '100%', opacity: 1}))
                ]),
                transition(':leave', [
                    style({height: '100%', opacity: 1}),
                    animate('700ms', style({height: 0, opacity: 0}))
                ])
            ]
        )
    ]
})
export class DatafilesPubComponent {

    @Input() record: NerdmRes;
    @Input() inBrowser: boolean;   // false if running server-side
    @Input() editEnabled: boolean = false;  // For edit mode display control
    @Input() editMode: string;  // For edit mode display control
    // Download status to trigger metrics refresh in parent component
    @Output() dlStatus: EventEmitter<string> = new EventEmitter();  

    ediid: string = '';
    files: TreeNode[] = [];           // the hierarchy of collections and files
    fileCount: number = 0;            // number of files being displayed
    downloadStatus: string = '';      // the download status for the dataset collection as a whole
    globalDataCart: DataCart = null;
    dataCartStatus: DataCartStatus;
    allInCart: boolean = false;
    isAddingToDownloadAllCart: boolean = false;
    isTogglingAllInGlobalCart: boolean = false;

    cols: any[];
    fileNode: any;               // the node whose description has been opened
    isExpanded: boolean = false;
    visible: boolean = true;
    cartLength: number;
    showZipFileNames: boolean = false;    // zip file display is currently disabled
    showDownloadProgress: boolean = false;
    appWidth: number = 800;   // default value used in server context
    appHeight: number = 900;  // default value used in server context
    fontSize: string = "16px";
    mobileMode: boolean = false;
    hashCopied: boolean = false;
    fileManagerUrl: string = 'https://nextcloud-dev.nist.gov';
    fileManagerBaseUrl: string = 'https://nextcloud-dev.nist.gov';
    fieldName: string = SectionPrefs.getFieldName(Sections.AUTHORS);
    overlaypanelOn: boolean = false;
    refreshFilesIcon: string = "faa faa-repeat fa-1x icon-white";
    EDIT_MODES: any;
    filesReady: boolean = false;
    skipReload: boolean = true;

    modalRef: any; // For bulk download confirm pop up
    bulkDownloadURL: string = "";
    downloadableFileLimit: number = 300; // Max number of files downloadable through lps 
    showBulkDesc: boolean = false;

    // The key of treenode whose details is currently displayed
    currentKey: string = '';
        
    constructor(private cartService: CartService,
                public breakpointObserver: BreakpointObserver,
                public lpService: LandingpageService, 
                private msgsvc: UserMessageService,
                private chref: ChangeDetectorRef,
                private modalService: NgbModal,
                public edstatsvc: EditStatusService,
                private cfg: AppConfig,
                private ngZone: NgZone)
    {
        this.cols = [
            { field: 'name', header: 'Name', width: '60%' },
            { field: 'mediaType', header: 'Media Type', width: 'auto' },
            { field: 'size', header: 'Size', width: 'auto' },
            { field: 'download', header: 'Status', width: 'auto' }];

        if (typeof (window) !== 'undefined') {
            window.onresize = (e) => {
                ngZone.run(() => {
                    this.appWidth = window.innerWidth;
                    this.appHeight = window.innerHeight;
                    this.setWidth(this.appWidth);
                });
            };
        }
    }

    ngOnInit() {
        this.downloadableFileLimit = +this.cfg.get("downloadableFileLimit", "300");

        this.EDIT_MODES = LandingConstants.editModes;

        // Bootstrap breakpoint observer (to switch between desktop/mobile mode)
        this.breakpointObserver
        .observe(['(min-width: 766px)'])
        .subscribe((state: BreakpointState) => {
            if (state.matches) {
                this.mobileMode = false;
            } else {
                this.mobileMode = true;
            }
        });

        if(this.inBrowser){
            this.appHeight = (window.innerHeight);
            this.appWidth = (window.innerWidth);
            this.setWidth(this.appWidth);
            
            this.globalDataCart = this.cartService.getGlobalCart();
            this.cartLength = this.globalDataCart.size();
            this.globalDataCart.watchForChanges((ev) => { this.cartChanged(); })

            this.dataCartStatus = DataCartStatus.openCartStatus();
        }

        if (this.record)
            this.useMetadata();
    }

    /**
     * Decide how we want to display the restrcied data:
     * Non-restrict or not publishing platform: normal display -- normal
     * Restrct but not preview mode: display special note and set background color to grey -- restrict
     * Restrict and preview mode: hide the whole block -- restrict_preview
     */
    get displayMode() {
        if(this.editEnabled){
            return "normal";
        }else if(!this.editEnabled || this.record['accessLevel'] === 'public') {
            return "normal";
        }else if(this.record['accessLevel'] === 'restricted public' && this.editMode != this.EDIT_MODES.PREVIEW_MODE) {
            return "restrict";
        }else {
            return "restrict_preview";
        }
    }

    get fileManagerTooltip(){
        if(this.fileManagerUrl) return this.fileManagerUrl;
        else return "File Manager URL is not available."
    }

    /**
     * Text color of file counts. Red for large dataset. Black for normal dataset.
     */
    get fileCountColor() {
        if(this.largeDataset)
            return "red";
        else    
            return "color:rgb(107, 107, 107)";
    }

    get downloadAllTooltip() {
        if(this.largeDataset)
            return "Bulk download from dedicated page";
        else 
            return "Download all from data cart";
    } 

    ngOnChanges(ch: SimpleChanges) {
        if (this.record && ch.record){
            if(!this.skipReload)
                this.useMetadata();
            else    
            this.skipReload = false;
        }

        this.chref.detectChanges();
    }

    useMetadata() {
        this.ediid = this.record['ediid'];

        if(this.ediid)
            this.bulkDownloadURL = '/bulkdownload/' + this.ediid.replace('ark:/88434/', '');

        this.buildTree(this.record['components']);
        this.edstatsvc.setShowLPContent(true);
    }

    /**
     * Handle datacart change event
     */
    cartChanged(){
        this.cartLength = this.globalDataCart.size();
        if (this.files && this.files.length > 0) {
            setTimeout(() => {
                this.updateStatusFromCart();
            }, 0);
        }
    }

    /**
     * Update treenode's downloadStatus and isInCart properties from a given datacart
     * @param nodes Treenodes to be updated
     * @param dc Datacart to update the treenodes
     * @returns if all treenodes are in the datacart
     */
    _updateNodesFromCart(nodes: TreeNode[], dc: DataCart): boolean[] {
        let allIn: boolean = true;   // whether all files are in the cart
        let allDld: boolean = true;  // whether all files have been downloaded
        let allstats: boolean[] = [];
        for (let child of nodes) {
            if (child.children && child.children.length > 0) {
                allstats = this._updateNodesFromCart(child.children, dc);
                child.data.isInCart = allstats[0];
                child.data.downloadStatus=(allstats[1]) ? DownloadStatus.DOWNLOADED : DownloadStatus.NO_STATUS;
                if (! child.data.isInCart) 
                    allIn = false;
                if (child.data.downloadStatus != DownloadStatus.DOWNLOADED)
                    allDld = false;
            }
            else if (child.data.comp && child.data.comp.downloadURL) {
                // a file node
                let dci: DataCartItem = dc.findFile(this.ediid, child.data.comp.filepath);
                if (dci) {
                    child.data.downloadStatus = dci.downloadStatus;
                    child.data.isInCart = true;
                }
                else 
                    child.data.isInCart = false;
                if (! child.data.isInCart)
                    allIn = false;
                if (child.data.downloadStatus != DownloadStatus.DOWNLOADED)
                    allDld = false;
            }
        }

        return [allIn, allDld];
    }

    /**
     * Build data file tree. Exclude .sha files.
     * Only count files with following condition:
     * 1. Has filepath attribute;
     * 2. "@type" does not have ":Hidden" and ":ChecksumFile"
     * 3. "@type" must end with "File".
     */
    buildTree(comps: NerdmComp[]) : void {
        if (! this.record['components']){
            this.filesReady = true;
            return;
        }

        let makeNodeData = (name: string, parentKey: string, comp: NerdmComp, isLeaf: boolean = false) => {
            let key = (parentKey) ? parentKey + '/' + name : name;
            let out = { name: name, key: key, comp: null, size: '', mediaType: '',
                        isInCart: false, downloadStatus: DownloadStatus.NO_STATUS, downloadProgress: 0   };
            if (comp) {
                out['comp'] = comp;
                out['mediaType'] = comp.mediaType || '';
                out['size'] = (comp.size === null || comp.size === undefined) ? ''
                                                                              : this.formatBytes(comp.size);
                out['DetailsDisplayed'] = false;
                out['DetailsDisplayed02'] = false;
            }
            return out;
        }
        let _insertComp = (levels: string[], comp: NerdmComp, tree: TreeNode) => {
            for (let child of tree.children) {
                if (child.data.name == levels[0]) {
                    if (levels && levels.length > 1) {
                        return _insertComp(levels.slice(1), comp, child);
                    } else  {
                        child.data = makeNodeData(levels[0], tree.data.key, comp, true);
                        return child;
                    }
                }
            }
            // anscestor node does not exist yet
            if (levels && levels.length > 1) {
                // haven't found leaf yet
                let child = { data: makeNodeData(levels[0], tree.data.key, null), children: [] };
                tree.children.push(child);
                return _insertComp(levels.slice(1), comp, child);
            }
            else {
                let child = { data: makeNodeData(levels[0], tree.data.key, comp), children: [] };
                tree.children.push(child);
                return child;
            }
        }

        let insertComp = (comp: NerdmComp, root: TreeNode) => {
            let levels = comp.filepath.split('/');
            return _insertComp(levels, comp, root);
        };

        let count = 0;
        let downloadedCount = 0;
        let root: TreeNode = { data: { name: '', key: '' }, children: [] };
        let node: TreeNode = null;

        // Filter out hidden, sha or files without "File" in "@type" field
        for (let comp of comps) {
            if (comp.filepath && comp['@type'].filter(tp => tp.includes(':Hidden')).length == 0 &&
                comp['@type'].filter(tp => tp.includes(':ChecksumFile')).length == 0)
            {  
                node = insertComp(comp, root);
                if (node.data.comp['@type'].filter(tp => tp.endsWith("File")).length > 0) {
                    count++;
                } 
            }
        }
        this.files = [...root.children];
        this.fileCount = count;
        this.updateStatusFromCart();
        this.filesReady = true;
    }

    /**
     * Function to expand tree display to certain level
     * @param dataFiles - file tree
     * @param expanded - expand flag 
     * @param targetLevel 
     */
    expandToLevel(dataFiles: any, expanded: boolean, targetLevel: any) {
        this.expandAll(dataFiles, expanded, 0, targetLevel)
    }

    /**
     * Function to expand tree display to certain level - used by expandToLevel()
     * @param dataFiles - file tree
     * @param expanded 
     * @param level 
     * @param targetLevel 
     */
    expandAll(dataFiles: any, expanded: boolean, level: any, targetLevel: any) {
        if(!dataFiles) return;

        let currentLevel = level + 1;
        for (let i = 0; i < dataFiles.length; i++) {
            dataFiles[i].expanded = expanded;
            if (targetLevel != null) {
                if (dataFiles[i].children.length > 0 && currentLevel < targetLevel) {
                    this.expandAll(dataFiles[i].children, expanded, currentLevel, targetLevel);
                }
            } else {
                if (dataFiles[i].children.length > 0) {
                    this.expandAll(dataFiles[i].children, expanded, currentLevel, targetLevel);
                }
            }
        }
        this.isExpanded = expanded;
        this.visible = false;
        setTimeout(() => {
            this.visible = true;
        }, 0);
    }

    /**
     * Function to reset the download status and incart status.
     * @param files - file tree 
     */
    resetStatus(files: any) {
        for (let comp of files) {
            comp.data['isInCart'] = false;
            comp.data['downloadStatus'] = DownloadStatus.NO_STATUS;
            if (comp.children && comp.children.length > 0) 
                this.resetStatus(comp.children);
        }
        this.allInCart = false;
        this.downloadStatus = DownloadStatus.NO_STATUS;
        return Promise.resolve(files);
    }

    /**
     * Function to sync the all download statuses from data cart.
     */
    updateStatusFromCart() {
        if (this.globalDataCart) {  // Note: not set on server-side
            let allstats: boolean[] = this._updateNodesFromCart(this.files, this.globalDataCart);
            this.allInCart = allstats[0]
            this.downloadStatus = (allstats[1]) ? DownloadStatus.DOWNLOADED : DownloadStatus.NO_STATUS;
        }
        return Promise.resolve(this.files);
    }

    /**
     * Function to display bytes in appropriate format.
     * @param bytes  an integer file size in bytes
     */
    formatBytes(bytes) {
        return formatBytes(bytes, null);
    }

    /**
     *  Expand the row to display file details. It's little tricky when hiding the details. 
     *  We have to delay the action to let the animation to finish. 
     * @param fileNode       the TreeNode for the file to provide details for
     */
    openDetails(fileNode: any) {
        //Close current details window if it's open
        if(fileNode.comp.DetailsDisplayed){
            fileNode.comp.DetailsDisplayed = false;
            setTimeout(() => {
                fileNode.comp.DetailsDisplayed02 = false;
            }, 600);

            this.currentKey = "";
        }else{
            this.cleanupDisplay();

            fileNode.comp.DetailsDisplayed = true;
            fileNode.comp.DetailsDisplayed02 = true;
    
            this.currentKey = fileNode.key;
        }
    }

    /**
     * Determine if the file details need be displayed
     * @param fileNode file node in the tree
     * @returns boolean
     *      true: display details
     *      false: hide details
     */
    showFileDetails(fileNode: any) {
        return this.isLeaf(fileNode) && fileNode.comp.DetailsDisplayed;
    }

    /**
     * Determine if the file details need be displayed. This function is specifically for collapsing the detail row.
     * @param fileNode file node in the tree
     * @returns boolean
     *      true: display details
     *      false: hide details
     */
    showFileDetails02(fileNode: any) {
        return this.isLeaf(fileNode) && fileNode.comp.DetailsDisplayed02;
    }

    /**
     * Collapse the current expanded row if any.
     * @returns 
     */
    cleanupDisplay(){
        if(this.currentKey != '') {
            let node : TreeNode = this.findNode(this.files, this.currentKey);
            if(node) {
                node.data.comp.DetailsDisplayed = false;
                setTimeout(() => {
                    node.data.comp.DetailsDisplayed02 = false;
                }, 600);
            }
        }
    }

    /**
     * Set the background color to light blue if the given row is expanded. 
     * @param fileNode file node in the tree
     */
    rowStyle(fileNode: any) {
        // if(fileNode.comp.DetailsDisplayed){
        //     return {'background-color': '#80bfff'};
        // }else{
        //     return {'background-color': 'white'};
        // }
    }

    /**
     * Return the class of the arrow next to the file name.
     * If the details is hidden, display the "right" arrow. Otherwise "down" arrow.
     * @returns 
     */
    fileDetailsDisplayClass(fileNode: any) {
        if(fileNode.comp.DetailsDisplayed){
            return 'faa faa-caret-down';
        }else{
            return 'faa faa-caret-right';
        }
    }

    /**
     * Determine if this node is a leaf
     * @param fileNode file node in the tree
     * @returns boolean
     */
    isLeaf(fileNode: any) {
        return (fileNode.comp['@type'].indexOf('nrdp:DataFile') > -1);
    }

    /**
     * return the TreeNode with the given key or null if not found
     */
    findNode(nodes: TreeNode[], key: string) : TreeNode {
        for (let node of nodes) {
            if (node.data.key == key)
                return node;
            else if (node.children && node.children.length > 0) {
                let out = this.findNode(node.children, key);
                if (out) return out;
            }
        }
        return null;
    }

    /**
     * Remove one node from cart and set flag
     * @param rowData - node in the file tree
     */
    removeFromGlobalCart(rowData: any) {
        if (!this.globalDataCart)
            // not inBrowser or otherwise ready
            return;

        setTimeout(() => {
            this.globalDataCart.removeMatchingFiles(this.ediid, rowData.comp.filepath, true);
            this.allInCart = false;
        }, 0);
    }

    /**
     * Add a node to the global data cart
     */
    addToGlobalCart(rowData: any) : void {
        if (! this.globalDataCart)
            // not inBrowser or otherwise ready
            return;
        
        setTimeout(() => {
            let node : TreeNode = this.findNode(this.files, rowData.key);
            if (node) {
                this._addAllWithinToCart(node, this.globalDataCart, false);
                this.globalDataCart.save();
                this.allInCart = this._areAllInCart(this.files);
            }
            else{
                let msg = "Unable to add row with key="+rowData.key+"; Failed to find node in tree";
                console.error(msg);
            }
        }, 0);
    }

    _addAllWithinToCart(node: TreeNode, cart: DataCart, selected: boolean = false) : void {
        if (node && node.children && node.children.length > 0) {
            for(let child of node.children) 
                this._addAllWithinToCart(child, cart, selected);
        }
        else 
            this.addFileToCart(node.data.comp, cart, selected, false);
    }

    /**
     * add a single file component to the global data cart
     */
    addFileToCart(file: NerdmComp, cart: DataCart,
                  selected: boolean =false, dosave: boolean =true) : DataCartItem
    {
        if (cart && file.filepath && file.downloadURL) {
            let added: DataCartItem = cart.addFile(this.ediid, file, selected, dosave, this.msgsvc);
            added['resTitle'] = this.record['title'];
            return added;
        }
    }

    /**
     * walk through the files tree to determine if all files from this dataset are currently in 
     * the global cart
     */
    _areAllInCart(nodes: TreeNode[]) : boolean {
        for (let node of nodes) {
            if (node.children && node.children.length > 0) {
                if (! this._areAllInCart(node.children))
                    return false;
            }
            else if (! node.data.isInCart)
                return false;
        }
        return true;
    }

    get largeDataset() {
        return this.fileCount > this.downloadableFileLimit;
    }

    /** 
     * If this is a large dataset (number of files exceeds the limit), do bulk download.
     * Otherwise, either add/remove all files to/from the global data cart.  This responds to the user clicking 
     * on the "add all to cart" icon.  If all files are already in the cart, all files will be removed;
     * otherwise, all not in the cart will be added.
     */
    toggleAllFilesInGlobalCart() : void {
        if(this.largeDataset) {
            this.bulkDownloadConfirm();
        }else{        
            if (! this.globalDataCart) return;
            this.isTogglingAllInGlobalCart = true;
            setTimeout(() => {
                if (this.allInCart) {
                    this.globalDataCart.removeMatchingFiles(this.ediid, '', false);
                    this.allInCart = false;
                }
                else {
                    for (let child of this.files) 
                        this._addAllWithinToCart(child, this.globalDataCart, false);
                    this.allInCart = true;
                }
                this.globalDataCart.save();
                this.isTogglingAllInGlobalCart = false;
            }, 0);
        }
    }

    /**
     * If this is a large dataset (number of files exceeds the limit), do bulk download.
     * Otherwise, open up an exclusive cart and start to download all files from this dataset.  This
     * responds to the user clicking on the download-all icon.  
     */
    downloadAllFiles() {
        if(this.largeDataset) {
            this.bulkDownloadConfirm();
        }else{
            let cartName : string = this.ediid;
            if (cartName.startsWith("ark:/"))
                cartName = cartName.replace(/^ark:\/\d+\//, '');
            let downloadAllCart = this.cartService.getCart(cartName);
            downloadAllCart.setDisplayName(this.record['title'], false);
            this.isAddingToDownloadAllCart = true;
            this.dlStatus.emit("downloading"); // for reseting metrics refresh flag
            
            setTimeout(() => {
                for (let child of this.files) 
                    this._addAllWithinToCart(child, downloadAllCart, true);

                downloadAllCart.save();
                this.isAddingToDownloadAllCart = false;
                window.open('/datacart/'+cartName+'?downloadSelected=true', cartName);
            }, 0);
        }
    }

    /**
     * mark a file as downloaded in the data cart.  This will happen if the user clicks on the 
     * individual file download icon.
     */
    setFileDownloaded(rowData: DataFileItem) : void {
        // Emit the download flag so parent component can refresh the metrics data after couple of minutes
        this.dlStatus.emit("downloading"); // for reseting metrics refresh flag
        this.dlStatus.emit("downloaded");  // trigger metrics refresh

        if (this.globalDataCart) {
            this.globalDataCart.restore();
            this.globalDataCart.setDownloadStatus(this.record.ediid, rowData.comp.filepath);
        }
    }

    /**
     * Return "download all" button color based on download status
     */
    getDownloadAllBtnColor() {
        if (this.downloadStatus == DownloadStatus.DOWNLOADED)
            return 'green';
        else
            return '#1E6BA1';
    }

    /**
     * Return "download" button color based on download status
     * @param rowData - tree node
     */
    getDownloadBtnColor(rowData: any) {
        if (rowData.downloadStatus == DownloadStatus.DOWNLOADED)
            return 'var(--nist-green-dark)';

        return 'var(--science-theme-background-dark)';
    }

    /**
     * Return "add all to datacart" button color based on select status
     */
    getAddAllToDataCartBtnColor() {
        if (this.allInCart)
            return 'var(--nist-green-dark)';
        else
            return 'var(--science-theme-background-dark)';
    }

    /**
     * Return tooltip text based on select status
     */
    get cartProcessTooltip() {
        if(this.largeDataset) {
            return "Bulk download from dedicated page";
        }else {
            if (this.allInCart)
                return 'Remove all from cart';
            else
                return 'Add all to cart';
        }
    }

    /**
     * Following functions set tree table style
     */
    titleStyleHeader() {
        return { 'background-color': 'var(--science-theme-background-dark)', 'width': this.cols[0].width, 'color': 'white', 'font-size': this.fontSize };
    }

    typeStyleHeader() {
        return { 'background-color': 'var(--science-theme-background-dark)', 'width': this.cols[1].width, 'color': 'white', 'font-size': this.fontSize };
    }

    sizeStyleHeader() {
        return { 'background-color': 'var(--science-theme-background-dark)', 'width': this.cols[2].width, 'color': 'white', 'font-size': this.fontSize };
    }

    statusStyleHeader() {
        return { 'background-color': 'var(--science-theme-background-dark)', 'width': this.cols[3].width, 'color': 'white', 'font-size': this.fontSize, 'white-space': 'nowrap' };
    }

    titleStyle(rowData: any) {
        let cursor = this.isLeaf(rowData)? 'pointer' : 'default';
        let color = this.isLeaf(rowData)? 'var(--science-theme-background-dark)' : 'black';
        return { 'width': this.cols[0].width,'height': '10px', 'margin-left': '10px', 'cursor': cursor, 'color': color, 'padding': 0, 'font-size': this.fontSize };
    }                        

    typeStyle() {
        return { 'width': this.cols[1].width,'height': '10px', 'font-size': this.fontSize, 'color': 'black', 'padding': 0 };
    }

    sizeStyle() {
        return { 'width': this.cols[2].width,'height': '10px', 'font-size': this.fontSize, 'color': 'black', 'padding': 0};
    }

    statusStyle() {
        return { 'width': this.cols[3].width,'height': '10px', 'font-size': this.fontSize, 'color': 'black', 'padding': 0 };
    }

    /**
     * Set column width based on screen width
     * @param appWidth - width of current window
     */
    setWidth(appWidth: number) {
        if (appWidth > 1340) {
            this.cols[0].width = '60%';
            this.cols[1].width = '20%';
            this.cols[2].width = '15%';
            this.cols[3].width = '100px';
            this.fontSize = '16px';
        } else if (appWidth > 780 && this.appWidth <= 1340) {
            this.cols[0].width = '60%';
            this.cols[1].width = '170px';
            this.cols[2].width = '100px';
            this.cols[3].width = '100px';
            this.fontSize = '14px';
        }
        else {
            this.cols[0].width = '50%';
            this.cols[1].width = '20%';
            this.cols[2].width = '20%';
            this.cols[3].width = '10%';
            this.fontSize = '12px';
        }

        this.chref.detectChanges();
    }

    /**
     * Make sure the width of popup dialog is less than 500px or 80% of the window width
     */
    getDialogWidth() {
        if(this.inBrowser){
            // var w = window.innerWidth > 500 ? 500 : window.innerWidth;
            return window.innerWidth + 'px';
        }else{
            return "500px";
        }
    }

    copyToClipboard(val: string){
        const selBox = document.createElement('textarea');
        selBox.style.position = 'fixed';
        selBox.style.left = '0';
        selBox.style.top = '0';
        selBox.style.opacity = '0';
        selBox.value = val;
        document.body.appendChild(selBox);
        selBox.focus();
        selBox.select();
        document.execCommand('copy');
        document.body.removeChild(selBox);

        this.hashCopied = true;
        setTimeout(() => {
            this.hashCopied = false;
        }, 2000);

    }

    /**
     * Popup dialog to confirm bulk download.
     */
    bulkDownloadConfirm() {
        if(this.bulkDownloadURL == "") {
            console.error("Bulk download URL is not available.");
            return;
        }

        let ngbModalOptions: NgbModalOptions = {
            backdrop: 'static',
            keyboard: false,
            windowClass: "modal-small",
            size: 'lg'
        };

        this.modalRef = this.modalService.open(BulkConfirmComponent, ngbModalOptions);
        this.modalRef.componentInstance.returnValue.subscribe(
            (submit) => {
                if ( submit ) {
                    console.log("Return value", submit);
                    window.open(this.bulkDownloadURL, "_blank");
                }else{
                    console.log("User canceled submit.");//Do nothing
                }
            }, 
            (reason) => {
                console.log("User canceled submit.");//Do nothing
            }
        );
    }    
}
