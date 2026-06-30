import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TreeTableComponent } from './tree-table.component';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

describe('TreeTableComponent', () => {
  let component: TreeTableComponent<any>;
  let fixture: ComponentFixture<TreeTableComponent<any>>;
  let debugElement: DebugElement;

  // Sample tree data for testing
  const sampleData = [
    {
      id: 1,
      name: 'Parent 1',
      size: '100 KB',
      children: [
        {
          id: 2,
          name: 'Child 1',
          size: '50 KB'
        },
        {
          id: 3,
          name: 'Child 2',
          size: '50 KB',
          children: [
            {
              id: 4,
              name: 'Grandchild 1',
              size: '25 KB'
            }
          ]
        }
      ]
    },
    {
      id: 5,
      name: 'Parent 2',
      size: '200 KB'
    }
  ];

  const columns = [
    { field: 'name', header: 'Name' },
    { field: 'size', header: 'Size' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TreeTableComponent,
        MatCheckboxModule,
        MatIconModule,
        CommonModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeTableComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty data', () => {
    expect(component.data).toEqual([]);
    expect(component.internalRoots.length).toBe(0);
  });

  it('should convert data to internal tree on data change', () => {
    component.data = sampleData;
    component.ngOnChanges({ data: { currentValue: sampleData, previousValue: [], firstChange: true, isFirstChange: () => true } });
    fixture.detectChanges();

    expect(component.internalRoots.length).toBe(2); // Two root nodes
    expect(component.internalRoots[0].data.name).toBe('Parent 1');
    expect(component.internalRoots[0].children.length).toBe(2); // Two children
    expect(component.internalRoots[0].children[0].data.name).toBe('Child 1');
    expect(component.internalRoots[0].children[1].data.name).toBe('Child 2');
    expect(component.internalRoots[0].children[1].children.length).toBe(1); // One grandchild
    expect(component.internalRoots[0].children[1].children[0].data.name).toBe('Grandchild 1');
  });

  it('should use custom childrenField', () => {
    // Data with custom children field
    const customData = [
      {
        id: 1,
        name: 'Parent 1',
        size: '100 KB',
        items: [ // Using 'items' instead of 'children'
          {
            id: 2,
            name: 'Child 1',
            size: '50 KB'
          }
        ]
      }
    ];

    component.data = customData;
    component.childrenField = 'items';
    component.ngOnChanges({
      data: { currentValue: customData, previousValue: [], firstChange: true, isFirstChange: () => true },
      childrenField: { currentValue: 'items', previousValue: 'children', firstChange: true, isFirstChange: () => true }
    });
    fixture.detectChanges();

    expect(component.internalRoots.length).toBe(1);
    expect(component.internalRoots[0].children.length).toBe(1);
    expect(component.internalRoots[0].children[0].data.name).toBe('Child 1');
  });

  it('should toggle expand/collapse state', () => {
    component.data = sampleData;
    component.ngOnChanges({ data: { currentValue: sampleData, previousValue: [], firstChange: true, isFirstChange: () => true } });
    fixture.detectChanges();

    const parentNode = component.internalRoots[0];
    expect(parentNode.expanded).toBeFalsy(); // Initially collapsed

    // Toggle expand
    component.toggleExpand(parentNode);
    fixture.detectChanges();
    expect(parentNode.expanded).toBeTruthy();

    // Toggle collapse
    component.toggleExpand(parentNode);
    fixture.detectChanges();
    expect(parentNode.expanded).toBeFalsy();
  });

  it('should handle checkbox selection', () => {
    component.data = sampleData;
    component.selectable = true;
    component.ngOnChanges({
      data: { currentValue: sampleData, previousValue: [], firstChange: true, isFirstChange: () => true },
      selectable: { currentValue: true, previousValue: false, firstChange: true, isFirstChange: () => true }
    });
    fixture.detectChanges();

    const parentNode = component.internalRoots[0];
    const childNode = component.internalRoots[0].children[0];

    // Initially no selections
    expect(component.isNodeSelected(parentNode)).toBeFalsy();
    expect(component.isNodeSelected(childNode)).toBeFalsy();
    expect(component.getSelectedCount()).toBe(0);

    // Select parent
    const parentEvent = { checked: true } as MatCheckboxChange;
    component.onCheckboxChange(parentNode, parentEvent);
    fixture.detectChanges();

    expect(component.isNodeSelected(parentNode)).toBeTruthy();
    expect(component.getSelectedCount()).toBe(1);

    // Select child
    const childEvent = { checked: true } as MatCheckboxChange;
    component.onCheckboxChange(childNode, childEvent);
    fixture.detectChanges();

    expect(component.isNodeSelected(childNode)).toBeTruthy();
    expect(component.getSelectedCount()).toBe(2);

    // Deselect parent
    const parentDeselectEvent = { checked: false } as MatCheckboxChange;
    component.onCheckboxChange(parentNode, parentDeselectEvent);
    fixture.detectChanges();

    expect(component.isNodeSelected(parentNode)).toBeFalsy();
    expect(component.getSelectedCount()).toBe(1);
    expect(component.isNodeSelected(childNode)).toBeTruthy(); // Child should still be selected
  });

  it('should emit selectionChange when selection changes', () => {
    component.data = sampleData;
    component.selectable = true;
    component.ngOnChanges({
      data: { currentValue: sampleData, previousValue: [], firstChange: true, isFirstChange: () => true },
      selectable: { currentValue: true, previousValue: false, firstChange: true, isFirstChange: () => true }
    });
    fixture.detectChanges();

    let emittedSelection: any[] | null = null;
    component.selectionChange.subscribe(selection => {
      emittedSelection = selection;
    });

    const parentNode = component.internalRoots[0];
    const selectEvent = { checked: true } as MatCheckboxChange;
    component.onCheckboxChange(parentNode, selectEvent);
    fixture.detectChanges();

    expect(emittedSelection).toEqual([parentNode.data]);
  });

  it('should get correct expand icon', () => {
    const collapsedNode = { expanded: false } as any;
    const expandedNode = { expanded: true } as any;

    expect(component.getExpandIcon(collapsedNode)).toBe('chevron_right');
    expect(component.getExpandIcon(expandedNode)).toBe('expand_more');
  });

  it('should get field value from node data', () => {
    component.data = sampleData;
    component.ngOnChanges({ data: { currentValue: sampleData, previousValue: [], firstChange: true, isFirstChange: () => true } });
    fixture.detectChanges();

    const node = component.internalRoots[0];
    expect(component.getFieldValue(node, 'name')).toBe('Parent 1');
    expect(component.getFieldValue(node, 'size')).toBe('100 KB');
    expect(component.getFieldValue(node, 'id')).toBe(1);
  });

  it('should reset selection when data changes', () => {
    component.data = sampleData;
    component.selectable = true;
    component.ngOnChanges({
      data: { currentValue: sampleData, previousValue: [], firstChange: true, isFirstChange: () => true },
      selectable: { currentValue: true, previousValue: false, firstChange: true, isFirstChange: () => true }
    });
    fixture.detectChanges();

    // Select a node
    const parentNode = component.internalRoots[0];
    const selectEvent = { checked: true } as MatCheckboxChange;
    component.onCheckboxChange(parentNode, selectEvent);
    fixture.detectChanges();

    expect(component.isNodeSelected(parentNode)).toBeTruthy();
    expect(component.getSelectedCount()).toBe(1);

    // Change data - should reset selection
    const newData = [{ id: 99, name: 'New Node' }];
    component.data = newData;
    component.ngOnChanges({
      data: { currentValue: newData, previousValue: sampleData, firstChange: false, isFirstChange: () => false }
    });
    fixture.detectChanges();

    expect(component.isNodeSelected(parentNode)).toBeFalsy(); // Old node should not be selected
    expect(component.getSelectedCount()).toBe(0); // Selection should be cleared
  });
});