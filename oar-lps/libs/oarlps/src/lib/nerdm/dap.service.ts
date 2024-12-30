import { AppConfig } from '../config/config';
import { Observable } from 'rxjs';
import * as rxjs from 'rxjs';
import * as rxjsop from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { NERDmResourceService } from './nerdm.service';
import { IDNotFound, NotAuthorizedError, BadInputError } from '../errors/error';
import { AnyObj, Credentials } from 'oarng';
import { NerdmRes } from 'oarlps';

/**
 * An interface that defines the minimum data needed to create a new DAP record
 */
export interface DAPRecordRequest {

    /**
     * the mnemonic name for the record.  
     */
    name : string;

    /**
     * the meta information for controlling the creation and management of the 
     * record.
     */
    meta : AnyObj;

    /**
     * the proto-NERDm data to initialize
     */
    data : AnyObj;

    /**
     * other parameters are expected
     */
    [propName: string]: any;
}

/**
 * An interface that defines the minimum contents of an existing DAP record
 */
export interface DAPRecord extends DAPRecordRequest {

    /**
     * the proto-NERDm data to initialize
     */
    data : NerdmRes;
}

/**
 * an interface for editing a particular record
 */
export abstract class DAPUpdateService {

    protected _recid : string;
    protected _rec : DAPRecord|null;

    public constructor(recid: string, initrec: DAPRecord|null = null) {
        this._recid = recid;
        this._rec = initrec;
    }

    /**
     * the ID of the record that this instance can edit
     */
    get recid() : string { return this._recid; }

    /**
     * return the full DAP record that includes the DBIO envelope (containing record name, ACLs,
     * etc.)  The state of this record should correspond with the last successful interaction with 
     * the service.  Note that the data property will not contain the full NERDm metadata, but rather a 
     * digest; in particular, it will not include the full list of components. 
     */
    getRecord() : DAPRecord { return JSON.parse(JSON.stringify(this._rec)); }

    /** 
     * return the complete NERDm data 
     */
    abstract getData() : Observable<NerdmRes>;
}

/**
 * a MetadataService extension that provides access to a record editing interface
 */
export abstract class DAPService extends NERDmResourceService {

    /**
     * return true if a draft DAP exists with the given ID
     */
    abstract exists(id : string) : Observable<boolean>;

    /**
     * return true if the current user has write-access to a given DAP.  False is returned 
     * if permission does not allow write-access or if the given identifier does not exist.
     */
    abstract canEdit(id : string) : Observable<boolean>;

    /**
     * return an interface for editing a specific draft DAP.  This may raise an AuthorizationError
     * if the user does not have write permission, or a IDNotFound exception if it hasn't been created
     * yet.  
     */
    abstract edit(id : string) : Observable<DAPUpdateService>;

    /**
     * create a new draft DAP record.  This may raise an AuthorizationError.
     */
    abstract create(name: string, meta?: AnyObj, data?: AnyObj) : Observable<DAPUpdateService>;

    /**
     * attempt to delete a draft DAP with the given ID; this destroys all changes made to the 
     * record.  True is returned if the record is completely purged from the system; this 
     * occurs if the record was never published before.  False is returned if the record was 
     * simply returned to its last published state.  This may raise an AuthorizationError
     * if the user does not have delete permission.  
     */
    abstract deleteRec(id : string) : Observable<boolean>;
}

/**
 * An EditableMetadataService that interacts with the remote MIDAS DAP web service for retrieving
 * and updating metadata records.  
 */
//export class MIDASDAPMetadataService extends EditableMetadataService {

    /**
     * initialize the service with the DAP service endpoint

    constructor(private endpoint : string,
                private webclient : HttpClient,
                private creds : Credentials)
    { super(); }
     */


//}

/**
 * An EditableMetadataService that caches and edits its record using local browser storage.  This 
 * implementation is intended for development and testing purposes.  It requires no credentials and 
 * all permissions are implicitly granted.
 */
export class LocalDAPService extends DAPService {

    /**
     * initialize the service with an open storage space
     */
    constructor(public store: Storage = null) {
        super();
        if (! this.store && typeof localStorage !== undefined)
            this.store = localStorage;
    }

    /**
     * return true if the current user has write-access to a given DAP.  False is returned 
     * if permission does not allow write-access or if the given identifier does not exist.
     */
    canEdit(id : string) : Observable<boolean> {
        // if it exists, it's editable
        return this.exists(id);
    }

    _exists(id : string) : boolean {
        return (! (! this.store.getItem(id)));
    }

    /**
     * return true if a draft DAP exists with the given ID
     */
    exists(id : string) : Observable<boolean> {
        return rxjs.of(this._exists(id));
    }

    /**
     * attempt to delete a draft DAP with the given ID; this destroys all changes made to the 
     * record.  True is returned if the record is completely purged from the system; this 
     * occurs if the record was never published before.  False is returned if the record was 
     * simply returned to its last published state.  
     */
    deleteRec(id : string) : Observable<boolean> {
        if (! this._exists(id)) 
            return rxjs.throwError(() => { return new IDNotFound(id); });

        this.store.removeItem(id);
        return rxjs.of(true);
    }

    /**
     * create a new draft DAP record.  
     */
    create(name: string, meta: AnyObj = {}, data: AnyObj = {}) : Observable<DAPUpdateService> {
        let req: DAPRecordRequest = {
            id: this._newid(),
            name: name,
            meta: meta,
            data: data
        };
        try {
            req = this._initialize(req);
            this.store.setItem(req.id, JSON.stringify(req));
        }
        catch (e) {
            return rxjs.throwError(e)
        }
        return rxjs.of(new LocalStoreDAPUpdateService(req.id, this.store));
    }

    /**
     * fill out missing information to turn a record request into an initial record
     */
    _initialize(request : DAPRecordRequest) : DAPRecordRequest {
        if (! request.name)
            throw new BadInputError("Unable to create a DAP without a name")
        if (this._name_exists(request.name))
            throw new BadInputError("DAP name already exists for current user")
        let data = {
            "@id": "ark:/88434/" + request['id'].replace(':','-'),
            "@type": [ "nrd:Resource" ],
            "title": ""
        }
        let out = {
            name: request.name,
            id: request.id,
            data: data,
            meta: request.meta
        };
        for (const prop in request.data)
            data[prop] = request.data[prop];

        if (! data['contactPoint'])
            data['contactPoint'] = {};
        if (! data['contactPoint']['fn'])
            data['contactPoint']['fn'] = "John Q. Nist";
        if (! data['contactPoint']['hasEmail'])
            data['contactPoint']['hasEmail'] = "jqn@nist.gov";

        if (out['meta']['resourceType'] == "software")
            data['@type'].unshift("nrdw:SoftwarePublication");
        else if (out['meta']['resourceType'] == "srd")
            data['@type'].unshift("nrdp:SRD");

        return out;
    }

    _name_exists(name : string) {
        let rec: DAPRecord = null;
        for (let i=0; i < this.store.length; i++) {
            rec = JSON.parse(this.store.getItem(this.store.key(i)));
            if (rec.name == name)
                return true;
        }
        return false;
    }

    _newid() : string {
        if (! this.store.getItem("_seq")) this.store.setItem("_seq", JSON.stringify(1));
        let n : number = JSON.parse(this.store.getItem("_seq"));
        this.store.setItem("_seq", JSON.stringify(n+1));
        let out = "mds3:"
        if (n < 1000)
            out += "0"
        if (n < 100)
            out += "0"
        if (n < 10)
            out += "0"
        out = out + n
        return out;
    }

    /**
     * return an interface for editing a specific draft DAP.  This may raise an AuthorizationError
     * if the user does not have write permission, or a IDNotFound exception if it hasn't been created
     * yet.  
     */
    edit(id : string) : Observable<DAPUpdateService> {
        if (! this._exists(id))
            return rxjs.throwError(new IDNotFound(id));
        return rxjs.of(new LocalStoreDAPUpdateService(id, this.store));
    }

    /**
     * retrieve the metadata associated with the current identifier.
     * 
     * @param id        the NERDm record's identifier
     * @return Observable<NerdmRes>    an Observable that will resolve to a NERDm record
     */
    getResource(id : string) : Observable<NerdmRes> {
        let rec: DAPRecord = JSON.parse(this.store.getItem(id));
        if (! rec)
            return rxjs.throwError(new IDNotFound(id));
        return rxjs.of(rec.data);
    }
}

export class LocalStoreDAPUpdateService extends DAPUpdateService {

    public constructor(recid: string, public store: Storage) {
        super(recid, JSON.parse(store.getItem(recid)));
    }

    protected _refreshRec() {
        let rec = this.store.getItem(this.recid);
        if (! rec)
            throw new IDNotFound(this.recid);
        this._rec = JSON.parse(rec);
    }

    /**
     * return the full DAP record that includes the DBIO envelope (containing record name, ACLs,
     * etc.)  Note that the data property will not contain the full NERDm metadata, but rather a 
     * digest; in particular, it will not include the full list of components. 
     */
    getRecord() : DAPRecord {
        return this._rec;
    }

    /** 
     * return the complete NERDm data 
     */
    getData() : Observable<NerdmRes> { return rxjs.of(this._rec.data); }
}
