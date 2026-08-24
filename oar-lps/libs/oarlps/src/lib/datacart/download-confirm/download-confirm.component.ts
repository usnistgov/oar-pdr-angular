import { Component, OnInit, Input, EventEmitter, Output, ElementRef, ViewChild, Inject, inject } from '@angular/core';
import { ZipData } from '../../shared/download-service/zipData';
import { formatBytes } from '../../utils';
import { AppConfig } from '../../config/config';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faDownload, faXmark } from '@fortawesome/free-solid-svg-icons';
import { iconClass } from '../../shared/globals/globals';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: "app-download-confirm",
  templateUrl: "./download-confirm.component.html",
  styleUrls: ["./download-confirm.component.css", "../datacart.component.css"],
})
export class DownloadConfirmComponent implements OnInit {
  //icon class names
  // downloadIcon = iconClass.DOWNLOAD;
  // closeIcon = iconClass.CLOSE;

  faDownload = faDownload;
  faXmark = faXmark;

  @Input() bundle_plan_size: number;
  @Input() zipData: ZipData[];
  @Input() totalFiles: number;
  @Output() returnValue: EventEmitter<boolean> = new EventEmitter();

  bundleSizeAlert: number;

    protected dialogData = inject(MAT_DIALOG_DATA);
    
  constructor(
    // public activeModal: NgbActiveModal,
    public iconLibrary: FaIconLibrary,
    private cfg: AppConfig,
    public dialogRef: MatDialogRef<DownloadConfirmComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      bundle_plan_size: number;
      zipData: ZipData[];
      totalFiles: number;
    },
  ) {
    // iconLibrary.addIcons(faDownload, faXmark);
  }

  ngOnInit() {
    this.bundleSizeAlert = +this.cfg.get("bundleSizeAlert", "1000000000");
      console.log("bundle_plan_size", this.dialogData.bundle_plan_size);
      this.bundle_plan_size = this.dialogData.bundle_plan_size;
      this.zipData = this.dialogData.zipData;
      this.totalFiles = this.dialogData.totalFiles;
  }

  /**
   * When user clicks on Continue Download, close the pop up dialog and continue downloading.
   */
  ContinueDownload() {
    this.returnValue.emit(true);
    // this.activeModal.close("Close click");
    this.dialogRef.close(true);
  }

  /**
   * When user click on Cancel, close the pop up dialog and do nothing.
   */
  CancelDownload() {
    this.returnValue.emit(false);
    //   this.activeModal.close("Close click");
    this.dialogRef.close(false);
  }

  /**
   * Return row background color
   * @param i - row number
   */
  getBackColor(i: number): string {
    if (i % 2 != 0) return "rgb(231, 231, 231)";
    else return "white";
  }

  getSizeForDisplay(size: number): string {
    return formatBytes(size);
  }
}
