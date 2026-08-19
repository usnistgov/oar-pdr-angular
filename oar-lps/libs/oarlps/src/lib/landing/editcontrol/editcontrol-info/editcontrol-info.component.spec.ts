import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef } from '@angular/material/dialog';
import { GlobalService } from '../../../shared/globals/globals';
import { ChangeDetectorRef } from '@angular/core';

import { EditcontrolInfoComponent } from './editcontrol-info.component';

describe('EditcontrolInfoComponent', () => {
  let component: EditcontrolInfoComponent;
  let fixture: ComponentFixture<EditcontrolInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditcontrolInfoComponent, CommonModule, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => {} } },
        { provide: GlobalService, useValue: {
            watchColorPalette: (callback) => {
                // Call the callback with a mock color palette
                callback({
                    defaultVar: '#ffffff',
                    lighterVar: '#f0f0f0',
                    hoverVar: '#e0e0e0'
                });
            }
        }},
        { provide: ChangeDetectorRef, useValue: { detectChanges: () => {} } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditcontrolInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
