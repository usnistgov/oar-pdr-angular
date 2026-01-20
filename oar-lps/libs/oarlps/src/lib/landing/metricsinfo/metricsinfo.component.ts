import { Component, OnInit, OnChanges, Input, Output, SimpleChanges, EventEmitter } from '@angular/core';
import { NerdmRes } from '../../nerdm/nerdm';
import { RecordLevelMetrics } from '../../metrics/metrics';
import { CommonFunctionService } from '../../shared/common-function/common-function.service';
import { MenuItem } from 'primeng/api';
import { MetricsService } from '../../shared/metrics-service/metrics.service';
import { Observable, of, Observer } from "rxjs";
import { AppConfig } from '../../config/config';
import { CartActions } from '../../datacart/cartconstants';
import { MetricsData } from "../metrics-data";
import * as _ from 'lodash-es';
import { formatBytes } from '../../utils';
import { CommonModule } from '@angular/common';
import { CollectionService } from '../../shared/collection-service/collection.service';
import { Collections, GlobalService } from '../../shared/globals/globals';

@Component({
    selector: 'app-metricsinfo',
    standalone: true,
    imports: [
        CommonModule
    ],
    templateUrl: './metricsinfo.component.html',
    styleUrls: ['./metricsinfo.component.css']
})
export class MetricsinfoComponent implements OnInit {
    allCollections: any = {};
    colorScheme: any;
    
    // the resource record metadata that the tool menu data is drawn from
    @Input() record : NerdmRes|null = null;

    @Input() inBrowser: boolean = false;

    // Record level metrics data
    @Input() metricsData : MetricsData;

    // flag if metrics is ready to display
    @Input() showMetrics : boolean = false;

    @Input() collection: string = Collections.DEFAULT;
    
    // flag if there is file level metrics data
    hasFileLevelMetrics: boolean = false;

    // Array to hold metrics info
    metricsInfo: string[] = [];
    metricsInfoOb: Observable<string[]>;

    fileLevelMetrics: any;
    recordLevelMetrics : RecordLevelMetrics;

    //Default: wait 5 minutes (300sec) after user download a file then refresh metrics data
    delayTimeForMetricsRefresh: number = 300; 
    time: any;

    constructor(public commonFunctionService: CommonFunctionService,
                public metricsService: MetricsService,
        public collectionService: CollectionService,
                public globalService: GlobalService,
                private cfg: AppConfig) 
    { 
        this.delayTimeForMetricsRefresh = +this.cfg.get("delayTimeForMetricsRefresh", "300");

        this.globalService.watchColorPalette((colorPalette) => {
            this.colorScheme = colorPalette;
        })         
    }

    ngOnInit(): void {
        this.allCollections = this.collectionService.loadAllCollections();

    }

    get totalUsers() {
        return this.metricsData.totalUsers > 1? this.metricsData.totalUsers.toString() + ' unique users': this.metricsData.totalUsers.toString() + ' unique user';
    }

    displayMetrics() {
        if(!this.metricsData.hasCurrentMetrics){
            this.metricsInfo = ['Metrics not available'];
        }

        this.showMetrics = true;
    }

    /**
     * Reture record level total download size
     */
    get totalDownloadSize() {
        if(this.metricsData != undefined)
            return formatBytes(this.metricsData.totalDownloadSize, 2);
        else
            return "";
    }

    get hasCurrentMetrics() {
        return this.metricsData.totalDatasetDownload > 0 || this.metricsData.totalUsers > 0 || this.metricsData.totalDownloadSize > 0;
    }

    metricsStyle(header: boolean) {
        let defaultColor = this.colorScheme.defaultVar;

        if (!header) {
            defaultColor = this.colorScheme.lighterVar;
        }

        return {
            '--background-default': defaultColor,
            '--background-lighter': this.colorScheme.lighterVar,
            '--background-hover': this.colorScheme.hoverVar
        };
    }    
}
