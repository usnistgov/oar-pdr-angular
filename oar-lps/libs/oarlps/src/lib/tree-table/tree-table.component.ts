import { Component, Input, Output, EventEmitter, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

/**
 * Internal tree node structure used for displaying tree data with UI state.
 */
interface InternalTreeNode<T> {
  data: T;
  children: InternalTreeNode<T>[];
  expanded: boolean;
  level: number;
  selected?: boolean;
}

/**
 * Column definition for the tree table.
 */
export interface TreeTableColumn {
  /** The field name in the data object to display */
  field: string;
  /** The header text to display */
  header: string;
}

@Component({
  selector: 'tree-table',
  standalone: true,
  imports: [CommonModule, MatCheckboxModule, MatIconModule],
  templateUrl: './tree-table.component.html',
  styleUrls: ['./tree-table.component.scss']
})
export class TreeTableComponent<T extends object> implements OnChanges {
  /** The root nodes of the tree to display */
  @Input() data: T[] = [];

  /** The name of the field that contains the child nodes (default: 'children') */
  @Input() childrenField: string = 'children';

  /** The columns to display in the table */
  @Input() columns: TreeTableColumn[] = [];

  /** Whether to show checkboxes for node selection */
  @Input() selectable: boolean = false;

  /** Emits an array of selected data objects when selection changes */
  @Output() selectionChange = new EventEmitter<T[]>();

  /** Internal tree structure with UI state */
  public internalRoots: InternalTreeNode<T>[] = [];

  /** Set of currently selected internal nodes (for efficient lookup) */
  private selectedNodes = new Set<InternalTreeNode<T>>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['childrenField']) {
      this.internalRoots = this.convertToInternalTree(this.data);
      // Reset selection when data changes
      this.selectedNodes.clear();
      this.updateSelectionChange();
    }
  }

  /**
   * Converts the raw data tree to internal tree nodes with UI state.
   */
  private convertToInternalTree(nodes: T[], level: number = 0): InternalTreeNode<T>[] {
    return nodes.map(node => {
      const children = node[this.childrenField as keyof T] as T[] | undefined;
      // Use node.data if it exists (for cases where input nodes wrap data in a 'data' field),
      // otherwise use node directly (for cases where input nodes are the data objects)
      const dataField = ('data' in node && node.data !== undefined) ? (node as any).data : node;
      const internalNode: InternalTreeNode<T> = {
        data: dataField,
        children: children ? this.convertToInternalTree(children, level + 1) : [],
        expanded: false, // Start collapsed
        level: level
      };
      return internalNode;
    });
  }

  /** Toggle the expanded state of a node */
  toggleExpand(node: InternalTreeNode<T>): void {
    node.expanded = !node.expanded;
    this.cdr.detectChanges();
  }

  /** Handle checkbox change for a node */
  onCheckboxChange(node: InternalTreeNode<T>, event: MatCheckboxChange): void {
    if (event.checked) {
      this.selectedNodes.add(node);
    } else {
      this.selectedNodes.delete(node);
    }
    this.updateSelectionChange();
  }

  /** Check if a node is selected */
  isNodeSelected(node: InternalTreeNode<T>): boolean {
    return this.selectedNodes.has(node);
  }

  /** Update the selection change output */
  private updateSelectionChange(): void {
    const selectedData: T[] = Array.from(this.selectedNodes).map(node => node.data);
    this.selectionChange.emit(selectedData);
  }

  /** Get the number of selected nodes (for testing) */
  getSelectedCount(): number {
    return this.selectedNodes.size;
  }

  /** Get the indicator icon for expand/collapse */
  getExpandIcon(node: InternalTreeNode<T>): string {
    return node.expanded ? 'expand_more' : 'chevron_right';
  }

  /** Get the value of a field for a node's data */
  getFieldValue(node: InternalTreeNode<T>, field: string): any {
    return node.data[field as keyof T];
  }
}