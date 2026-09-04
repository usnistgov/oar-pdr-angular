import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    inject,
    Input,
    OnInit,
    Output,
    SimpleChanges,
} from "@angular/core";
import {
    TaxonomyListService,
    SearchfieldsListService,
} from "../../shared/index";
import {
    trigger,
    state,
    style,
    animate,
    transition,
} from "@angular/animations";
import {
    Collections,
    ColorScheme,
    GlobalService,
} from "../../shared/globals/globals";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatDialogModule } from "@angular/material/dialog";

@Component({
    selector: "app-taxonomy",
    templateUrl: "./taxonomy.component.html",
    styleUrls: ["./taxonomy.component.css"],
    providers: [TaxonomyListService, SearchfieldsListService],
    animations: [
        trigger("expand", [
            state("closed", style({ height: "0px" })),
            state("collapsed", style({ height: "183px" })),
            state("expanded", style({ height: "*" })),
            transition("expanded <=> collapsed", animate("625ms")),
            transition("expanded <=> closed", animate("625ms")),
            transition("closed <=> collapsed", animate("625ms")),
        ]),
        trigger("expandOptions", [
            state("collapsed", style({ height: "0px" })),
            state("expanded", style({ height: "*" })),
            transition("expanded <=> collapsed", animate("625ms")),
        ]),
        trigger("filterExpand", [
            state("collapsed", style({ width: "40px" })),
            state("expanded", style({ height: "*" })),
            transition("expanded <=> collapsed", animate("625ms")),
        ]),
    ],
})
export class TaxonomyComponent implements OnInit {
    collectionShowMoreLink: boolean = false;
    collectionSelectedThemesNode: any[] = [];
    allChecked: boolean = false;
    globalsvc = inject(GlobalService);

    researchTopicStyle: any;

    @Input() collectionThemesTree: any[] = [];
    @Input() colorScheme: any;
    @Input() collection: string = Collections.DEFAULT;
    @Input() isCollection: boolean = false;
    @Input() collectionNodeExpanded: boolean = false;
    @Input() clearAllCheckbox: boolean = false;
    @Output() filterString: EventEmitter<string> = new EventEmitter();

    constructor(private chref: ChangeDetectorRef) {}

    ngOnInit(): void {
        if (this.colorScheme)
            this.researchTopicStyle = {
                width: "100%",
                "padding-top": "0.2em",
                "padding-bottom": ".0em",
                "background-color": this.colorScheme.lighterVar,
                overflow: "hidden",
                "border-width": "0",
                "margin-left": "-10px",
            };
    }

    ngAfterViewInit(): void {
        //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        //Add 'implements AfterViewInit' to the class.
        this.uncheckAll();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.clearAllCheckbox) {
            this.uncheckAll();
        }
    }

    get isAllChecked() {
        // If no leaf nodes, nothing to check
        const leafCount = this.getLeafNodeCount(this.collectionThemesTree);
        if (leafCount === 0) return false;

        // All leaf nodes should be selected
        return this.collectionSelectedThemesNode.length === leafCount;
    }

    get isIndeterminate(): boolean {
        const leafCount = this.getLeafNodeCount(this.collectionThemesTree);
        if (leafCount === 0) return false;
        const selectedCount = this.collectionSelectedThemesNode.length;
        return selectedCount > 0 && selectedCount < leafCount;
    }

    private getLeafNodeCount(nodes: any[]): number {
        let count = 0;

        const visit = (node: any) => {
            // If children is a non-empty array, recurse to count leaves in subtree
            // Otherwise, this node is a leaf (no children or invalid children)
            if (Array.isArray(node.children) && node.children.length > 0) {
                for (const child of node.children) {
                    visit(child);
                }
            } else {
                count++;
            }
        };

        // We only care about the first tree in the collection (as used in the template)
        if (nodes && nodes.length > 0) {
            visit(nodes[0]);
        }

        return count;
    }

    updateCheckbox(checked: boolean) {
        if (checked) {
            this.checkAll();
        } else {
            this.uncheckAll();
        }
    }

    checkAll() {
        this.collectionSelectedThemesNode = [];
        if (this.collectionThemesTree && this.collectionThemesTree.length > 0) {
            this.preselectLeafNodes(this.collectionThemesTree[0].children);
        }

        this.filterResults();
    }

    uncheckAll() {
        this.collectionSelectedThemesNode = [];
        this.filterResults();
    }

    private preselectLeafNodes(nodes: any[]): void {
        for (let node of nodes) {
            // Leaf node: children is not a non-empty array
            if (!Array.isArray(node.children) || node.children.length === 0) {
                // Leaf node
                this.collectionSelectedThemesNode.push(node);
            } else {
                // Parent node: recurse to find leaves
                // Children is a non-empty array
                this.preselectLeafNodes(node.children);
            }
        }

        this.chref.detectChanges();
    }

    /**
     * Form the filter string and refresh the result page
     */
    filterResults() {
        this.allChecked = this.isAllChecked;
        let lFilterString: string = "";
        // let themeType = '';

        // Collection Research topics

        if (this.collectionSelectedThemesNode.length > 0) {
            for (let theme of this.collectionSelectedThemesNode) {
                // Safely check if theme is a leaf node with valid data array
                if (
                    theme &&
                    Array.isArray(theme.children) &&
                    theme.children.length === 0 &&
                    theme.data &&
                    Array.isArray(theme.data)
                ) {
                    for (let i = 0; i < theme.data.length; i++) {
                        if (this.isCollection) {
                            // themeType += theme.data[i] + ',';
                            lFilterString +=
                                this.collection +
                                "----" +
                                this.globalsvc.escapeReservedChars(
                                    theme.data[i],
                                ) +
                                ",";
                        } else {
                            lFilterString +=
                                this.globalsvc.escapeReservedChars(
                                    theme.data[i].replace(/\s/g, ""),
                                ) + ",";
                        }
                    }
                }
            }
        }

        lFilterString = this.removeEndingComma(lFilterString);
        if (!lFilterString) lFilterString = "";
        else {
            if (this.isCollection) {
                lFilterString = "topic.tag=" + lFilterString;
            } else {
                lFilterString = this.collection + "=" + lFilterString;
            }
        }

        this.filterString.emit(lFilterString);

        this.chref.detectChanges();
    }

    /**
     * Remove the ending comma of the given string
     * @param inputrString
     */
    removeEndingComma(inputrString: string): string {
        if (!inputrString) return "";

        if (inputrString[inputrString.length - 1] == ",")
            return inputrString.substr(0, inputrString.length - 1);
        else return inputrString;
    }

    expandIcon() {
        if (!this.collectionNodeExpanded) {
            return "chevron_right";
        } else {
            return "keyboard_arrow_down";
        }
    }

    /**
     * Return tooltip text for given filter tree node.
     * @param filternode tree node of a filter
     * @returns tooltip text
     */
    filterTooltip(filternode: any) {
        if (filternode && filternode.label)
            return filternode.label.split("-")[0] + "-" + filternode.count;
        else return "";
    }

    /**
     * Only expand the filter window if user close the first level
     * @param level node level
     */
    onNodeExpand(event) {
        if (event.node.level == 1) this.collectionNodeExpanded = true;

        this.chref.detectChanges();
    }

    /**
     * Only collapse the filter window if user close the first level
     * @param level node level
     */
    onNodeCollapse(event) {
        if (event.node.level == 1) this.collectionNodeExpanded = false;

        this.chref.detectChanges();
    }

    // New methods for Material tree checkbox handling
    isNodeSelected(node: any): boolean {
        // For leaf nodes, check if directly selected
        if (!Array.isArray(node.children) || node.children.length === 0) {
            return this.collectionSelectedThemesNode.includes(node);
        }
        // For parent nodes, check if all descendants are selected
        return this.isNodeSelectedRecursive(node);
    }

    private isNodeSelectedRecursive(node: any): boolean {
        // Leaf node: children is not a non-empty array
        if (!Array.isArray(node.children) || node.children.length === 0) {
            return this.collectionSelectedThemesNode.includes(node);
        }

        // A parent is selected only if all descendants are selected
        // Children is a non-empty array, so recurse
        return node.children.every((child) =>
            this.isNodeSelectedRecursive(child),
        );
    }

    getNodeIndeterminate(node: any): boolean {
        if (!node.children?.length) {
            return false;
        }

        let hasChecked = false;
        let hasUnchecked = false;

        for (const child of node.children) {
            if (this.isNodeSelected(child)) {
                hasChecked = true;
            } else if (this.getNodeIndeterminate(child)) {
                // An indeterminate child counts as both checked and unchecked.
                hasChecked = true;
                hasUnchecked = true;
            } else {
                hasUnchecked = true;
            }
        }

        return hasChecked && hasUnchecked;
    }

    private setNodeSelection(node: any, checked: boolean): void {
        // Only update leaf nodes in the selection array
        // Leaf node: children is not a non-empty array
        if (!Array.isArray(node.children) || node.children.length === 0) {
            // Leaf node
            const index = this.collectionSelectedThemesNode.indexOf(node);
            if (checked && index === -1) {
                this.collectionSelectedThemesNode.push(node);
            } else if (!checked && index > -1) {
                this.collectionSelectedThemesNode.splice(index, 1);
            }
        } else {
            // Parent node: recursively set selection for all children
            // Children is a non-empty array, so recurse
            for (const child of node.children) {
                this.setNodeSelection(child, checked);
            }
        }
    }

    onCheckboxChange(checked: boolean, node: any): void {
        this.setNodeSelection(node, checked);
        this.filterResults();
    }
}
