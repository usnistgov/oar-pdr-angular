/**
 * a data structure describing a file in the cart.  A CartEntryData object, in effect, is a NerdmComp 
 * that *must* have the filePath property and is expected to have some additional 
 * data cart-specific properties.  
 */
export class RecordLevelMetrics {
    DataSetMetricsCount : number;
    PageSize : number;
    DataSetMetrics: DataSetMetrics[] = []; 

    constructor(
        dataSetMetricsCount : number = null,
        pageSize : number = null
        ) {
            this.DataSetMetricsCount = dataSetMetricsCount;
            this.PageSize = pageSize;
            this.DataSetMetrics[0] = new DataSetMetrics();
    }


}

export class DataSetMetrics {
    ediid : string;
    first_time_logged : string;
    last_time_logged : string;
    total_size_download : number;
    success_get : number;
    number_users : number;
    record_download: number;


    constructor(        
        ediid : string = null,
        first_time_logged : string = null,
        last_time_logged : string = null,
        total_size_download : number = null,
        success_get : number = null,
        number_users : number = null,
        record_download : number = null) {
            this.ediid = ediid;
            this.first_time_logged = first_time_logged;
            this.last_time_logged = last_time_logged;
            this.total_size_download = total_size_download;
            this.success_get = success_get;
            this.number_users = number_users;   
            this.record_download = record_download;         
    }
}