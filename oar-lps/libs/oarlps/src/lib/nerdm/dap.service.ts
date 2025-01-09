import { AppConfig } from '../config/config';
import { Observable, of, map, tap, catchError, throwError } from 'rxjs';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';

import { NERDmResourceService, SupportsAuthentication } from './nerdm.service';
import * as errors from '../errors/error';
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
     * the mnemonic name of the record
     */
    name : string;

    /**
     * the proto-NERDm data to initialize
     */
    data : NerdmRes;
}

/**
 * an interface for editing a particular DAP record
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
     * the mneomic name given to the record
     */
    get name() : string { return this._rec.name; }

    /**
     * return the full DAP record that includes the DBIO envelope (containing record name, ACLs,
     * etc.)  The state of this record should correspond with the last successful interaction with 
     * the service.  Note that the data property will not contain the full NERDm metadata, but rather a 
     * digest; in particular, it will not include the full list of components; getData() should be used
     * to get the full record.  
     * 
     * This default implementation returns a copy of the internally held record.
     */
    getRecord() : DAPRecord { return JSON.parse(JSON.stringify(this._rec)); }

    /**
     * return the DAP meta-information (the record's "meta" property).  
     * 
     * This default implementation returns a copy of the internally held record.
     */
    getMeta() : AnyObj { return this.getRecord().meta; }

    /** 
     * return the complete NERDm data 
     */
    abstract getData() : Observable<NerdmRes>;

    /**
     * return a particular property of the NERDm record data
     * @param propname   the name of the property to return
     */
    abstract getDataSubset(propname: string) : Observable<Object>;

    /**
     * replace some property of the NERDm record data with the given value
     */
    abstract setDataSubset(propname: string, val: Object) : Observable<Object>;

    /**
     * update some property of the NERDm record data.  When the property is an object with 
     * subproperties, the given object will be merged in with the existing object value, 
     * overriding the subproperties where their names overlap.
     */
    abstract updateDataSubset(propname: string, val: Object) : Observable<Object>;

    /**
     * add an item to the identified list of items (e.g. adding and author to the authors list).
     * It will be appended to the list.
     */
    abstract addDataItem(propname: string, item: Object) : Observable<Object>;

    /**
     * replace an item in the identified list of items (e.g. replacing author data within the authors list).
     */
    abstract setDataItem(propname: string, key: string|number, item: Object) : Observable<Object>;

    /**
     * update an item in the identified list of items (e.g. updating author data within the 
     * authors list).  The item is assumed to be an object with 
     * subproperties; the item data will be overlayed onto with the identified item, 
     * overriding the subproperties where their names overlap.
     */
    abstract updateDataItem(propname: string, key: string|number, item: Object) : Observable<Object>;

    /**
     * change the mnemonic name of this resource
     * @return string -- the name that was set
     */
    abstract setName(newname: string) : Observable<string>;
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
 * An DAPService that interacts with the remote MIDAS DAP web service for retrieving
 * and updating metadata records.  
 */
export class MIDASDAPService extends DAPService implements SupportsAuthentication  {

    authToken: string|null = null;

    /**
     * initialize the service with the DAP service endpoint
     */
    constructor(private endpoint : string,
                private webclient : HttpClient,
                authToken : string|null = null)
    {
        super();
        this.authToken = authToken;
        if (! this.endpoint.endsWith('/'))
            this.endpoint += '/';
    }

    /**
     * retrieve the NERDm Resource metadata associated with the current identifier.
     * 
     * @param id        the NERDm record's identifier
     * @return Observable<NerdmRes>    an Observable that will resolve to a NERDm record
     * @throws IDNotFound   if the ID is not recognized
     * @throws NotAuthorizedErrror   if the current user is not authorized to access the 
     *                      record with the specified ID
     * @throws ServerError  if there was some type of server-side error preventing ID 
     *                      resolution.  
     */
    getResource(id : string) : Observable<NerdmRes> {
        const url = this.endpoint + id + "/data";
        const hdrs = _headersFor(this, "get");

        return this.webclient.get(url, {headers: hdrs}).pipe(
            catchError(err => { return _handleWebError(err, id, url, "access", "/data"); })
        ) as Observable<NerdmRes>;
    }

    /**
     * return true if a draft DAP exists with the given ID
     */
    exists(id : string) : Observable<boolean> {
        const url = this.endpoint + id;
        const hdrs = _headersFor(this, "head");

        return this.webclient.head(url, {observe: "response"}).pipe(
            map<HttpResponse<any>, boolean>((resp: HttpResponse<any>) => {
                return true;
            }),
            catchError((err) => {
                let msg = err.message || err.statusText;
                if (err.status) {
                    if (err.status == 404)
                        return of(false);
                    if (err.status == 401)
                        return of(true);
                    if (err.status > 500)
                        throw new errors.ServerError(msg || "Unknown Server Error", err);
                    else 
                        throw new errors.OARError("Unexpected resolver response: " + msg +" (" +
                                                  err.status + ")", err);
                }
                else if (err.status == 0) 
                    throw new errors.CommError("Unexpected communication error: "+msg, url, err);
                else
                    throw new errors.OARError("Unexected error during retrieval from URL (" + 
                                              url + "): " + err.toString(), err);
            })
        ) as Observable<boolean>;
    }

    /**
     * return true if the current user has write-access to a given DAP.  False is returned 
     * if permission does not allow write-access or if the given identifier does not exist.
     */
    canEdit(id : string) : Observable<boolean> {
        const url = this.endpoint + id + "/acls/:user";
        const hdrs = _headersFor(this, "get");

        return this.webclient.get(url, {headers: hdrs}).pipe(
            catchError(err => {
                if (err.status && err.status == 404)
                    return of(false);
                return _handleWebError(err, id, url, "access", "/acls/:user");
            })
        ) as Observable<boolean>;
    }

    /**
     * attempt to delete a draft DAP with the given ID; this destroys all changes made to the 
     * record.  True is returned if the record is completely purged from the system; this 
     * occurs if the record was never published before.  False is returned if the record was 
     * simply returned to its last published state.  
     */
    deleteRec(id : string) : Observable<boolean> {
        const url = this.endpoint + id;
        const hdrs = _headersFor(this, "delete");

        return this.webclient.delete(url, { observe: "response", headers: hdrs }).pipe(
            map<any, boolean>((resp) => {
                return true;
            }),
            catchError(err => { return _handleWebError(err, id, url, "delete", "DAP record"); })
        ) as Observable<boolean>;
    }

    /**
     * create a new draft DAP record.  This may raise an AuthorizationError.
     */
    create(name: string, meta?: AnyObj, data?: AnyObj) : Observable<DAPUpdateService> {
        let input = {
            name: name,
            data: data,
            meta: meta
        }

        const url = this.endpoint.slice(0, -1);
        const hdrs = _headersFor(this, "post");

        return this.webclient.post(url, input, {headers: hdrs}).pipe(
            map<DAPRecord, DAPUpdateService>((data: DAPRecord) => {
                return new MIDASDAPUpdateService(data.id, data, this.endpoint,
                                                 this.webclient, this.authToken);
            }),
            catchError(err => { return _handleWebError(err, null, url, "create", "DAP record"); })
        ) as Observable<DAPUpdateService>;
    }

    /**
     * return an interface for editing a specific draft DAP.  This may raise an AuthorizationError
     * if the user does not have write permission, or a IDNotFound exception if it hasn't been created
     * yet.  
     */
    edit(id : string) : Observable<DAPUpdateService> {
        const url = this.endpoint + id;
        const hdrs = _headersFor(this, "get");

        return this.webclient.get(url, {headers: hdrs}).pipe(
            map<DAPRecord, DAPUpdateService>((data: DAPRecord) => {
                return new MIDASDAPUpdateService(id, data, this.endpoint, this.webclient, this.authToken);
            }),
            catchError(err => { return _handleWebError(err, id, url, "access", "DAP record"); })
        ) as Observable<DAPUpdateService>;
    }

}

function _headersFor(svc: SupportsAuthentication, meth: string) {
    let out = {};
    meth = meth.toLowerCase();
    if (meth != "head")
        out['Accept'] = "application/json";
    if (meth == "post" || meth == "put")
        out['Content-type'] = "application/json";
    if (svc.authToken)
        out['Authorization'] = "Bearer " + svc.authToken;
    return out;
}

function _handleWebError(error, id: string|null, url: string, opverb: string, ep: string) : any {
    if (error instanceof HttpErrorResponse) {
        let err = error as HttpErrorResponse;
        let msg = err.message || err.statusText;
        if (err.status) {
            if (error.error instanceof Object && error.error["midas:message"])
                msg = error.error["midas:message"];
            if (id && err.status == 404)
                throw new errors.IDNotFound(id, err);
            if (err.status == 401)
                throw new errors.NotAuthorizedError(id, opverb, err);
            if (err.status > 500)
                throw new errors.ServerError(msg || "Unknown DAP Server Error accessing "+ep, err);
            else 
                throw new errors.OARError("Unexpected DAP response accessing "+ep+": " + msg +" (" +
                                          err.status + ")", err);
        }
        else if (err.status == 0) 
            throw new errors.CommError("Unexpected DAP communication error: "+msg, url, err);
    }

    throw new errors.OARError("Unexected error during "+opverb+" from URL (" + 
                              url + "): " + error.toString(), error);
}

/**
 * an interface for editing a particular DAP record
 */
export class MIDASDAPUpdateService extends DAPUpdateService implements SupportsAuthentication {

    authToken: string|null = null;

    /**
     * initialize the service with the DAP service endpoint
     */
    constructor(recid: string,
                initrec: DAPRecord,
                private endpoint : string,
                private webclient : HttpClient,
                authToken : string|null = null)
    {
        super(recid, initrec);
        this.authToken = authToken;
        if (! this.endpoint.endsWith('/'))
            this.endpoint += '/';
    }

    /** 
     * return the complete NERDm data 
     */
    getData() : Observable<NerdmRes> {
        const url = this.endpoint + this.recid + "/data";
        const hdrs = _headersFor(this, "get");

        return this.webclient.get(url, {headers: hdrs}).pipe(
            catchError(err => { return this._handleWebError(err, url, "access", "/data"); })
        ) as Observable<NerdmRes>;
    }

    protected _handleWebError(error, url: string, opverb: string, ep: string) : any {
        return _handleWebError(error, this.recid, url, opverb, ep);
    }

    /**
     * return some property of the NERDm record data
     */
    getDataSubset(propname: string) : Observable<Object> {
        const ep = "/data/" + propname;
        const url = this.endpoint + this.recid + ep;
        const hdrs = _headersFor(this, "get");

        return this.webclient.get(url, {headers: hdrs}).pipe(
            catchError(err => {
                if (err.status && err.status == 404) {
                    if (err.message.includes("ID not found"))
                        throw new errors.IDNotFound(this.recid);
                    throw new errors.PartNotFound(this.recid, ep);
                }
                return this._handleWebError(err, url, "access", ep);
            })
        ) as Observable<Object>;
    }

    /**
     * replace some property of the NERDm record data with the given value
     */
    setDataSubset(propname: string, val: Object) : Observable<Object> {
        return this._updateWithMethod("PUT", propname, val);
    }

    protected _updateWithMethod(meth: string, propname: string,
                                val: Object, key?: string|number)
        : Observable<Object>
    {
        let ep = "/data/" + propname;
        if (typeof key == 'number')
            key = "["+key+"]";
        if (key) 
            ep += "/"+key;
        const url = this.endpoint + this.recid + ep;
        const hdrs = _headersFor(this, meth);
        if (typeof val === "string" || val instanceof String)
            val = '"'+val+'"';

        return this.webclient.request(meth, url, {body: val, headers: hdrs}).pipe(
            catchError(err => {
                if (err.status && err.status == 404) {
                    if (err.message.includes("ID not found"))
                        throw new errors.IDNotFound(this.recid);
                    throw new errors.PartNotFound(this.recid, ep);
                }
                return this._handleWebError(err, url, "update", ep);
            })
        ) as Observable<Object>;
    }

    /**
     * update some property of the NERDm record data.  When the property is an object with 
     * subproperties, the given object will be merged in with the existing object value, 
     * overriding the subproperties where their names overlap.
     */
    updateDataSubset(propname: string, val: Object) : Observable<Object> {
        return this._updateWithMethod("PATCH", propname, val);        
    }

    /**
     * add an item to the identified list of items (e.g. adding and author to the authors list).
     * It will be appended to the list.
     * @param propname  the name of the property containing a list of values (e.g. "authors")
     * @param item      the object to append to the list
     */
    addDataItem(propname: string, item: Object) : Observable<Object> {
        return this._updateWithMethod("POST", propname, item);
    }

    /**
     * replace an item to the identified list of items (e.g. adding and author to the authors list).
     * It will be appended to the list.
     * @param propname  the name of the property containing a list of values (e.g. "authors")
     * @param id        the id for the particular item to repace
     * @param item      the object to append to the list
     */
    setDataItem(propname: string, key: string|number, item: Object) : Observable<Object> {
        return this._updateWithMethod("PUT", propname, item, key);
    }

    /**
     * update an item in the identified list of items (e.g. updating author data within the 
     * authors list).  The item is assumed to be an object with 
     * subproperties; the item data will be overlayed onto with the identified item, 
     * overriding the subproperties where their names overlap.
     * @param propname  the name of the property containing a list of values (e.g. "authors")
     * @param id        the id for the particular item to update
     * @param item      the object to append to the list
     */
    updateDataItem(propname: string, key: string|number, item: Object) : Observable<Object> {
        return this._updateWithMethod("PATCH", propname, item, key);
    }

    /**
     * change the mnemonic name of this resource
     * @return string -- the name that was set
     */
    setName(newname: string) : Observable<string> {
        const url = this.endpoint + this.recid + "/name";
        const hdrs = _headersFor(this, "put");
        newname = '"'+newname+'"';

        return this.webclient.put(url, newname, {headers: hdrs, responseType: "json"}).pipe(
            tap<string>(name => { this._rec.name = name; }),
            catchError(err => { return this._handleWebError(err, url, "change name", "/name"); })
        ) as Observable<string>;
    }
}

/**
 * A DAPService that caches and edits its record using local browser storage.  This 
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
        return of(this._exists(id));
    }

    /**
     * attempt to delete a draft DAP with the given ID; this destroys all changes made to the 
     * record.  True is returned if the record is completely purged from the system; this 
     * occurs if the record was never published before.  False is returned if the record was 
     * simply returned to its last published state.  
     */
    deleteRec(id : string) : Observable<boolean> {
        if (! this._exists(id)) 
            return throwError(() => { return new errors.IDNotFound(id); });

        this.store.removeItem(id);
        return of(true);
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
            return throwError(e)
        }
        return of(new LocalStoreDAPUpdateService(req.id, this.store));
    }

    /**
     * fill out missing information to turn a record request into an initial record
     */
    _initialize(request : DAPRecordRequest) : DAPRecordRequest {
        if (! request.name)
            throw new errors.BadInputError("Unable to create a DAP without a name")
        if (this._name_exists(request.name))
            throw new errors.BadInputError("DAP name already exists for current user")
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
            out.data[prop] = request.data[prop];

        if (! data['contactPoint'])
            out.data['contactPoint'] = {};
        if (! data['contactPoint']['fn'])
            out.data['contactPoint']['fn'] = "John Q. Nist";
        if (! data['contactPoint']['hasEmail'])
            out.data['contactPoint']['hasEmail'] = "mailto:jqn@nist.gov";

        if (out['meta']['resourceType'] == "software")
            out.data['@type'].unshift("nrdw:SoftwarePublication");
        else if (out['meta']['resourceType'] == "srd")
            out.data['@type'].unshift("nrdp:SRD");

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
            return throwError(new errors.IDNotFound(id));
        return of(new LocalStoreDAPUpdateService(id, this.store));
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
            return throwError(new errors.IDNotFound(id));
        return of(rec.data);
    }
}

export class LocalStoreDAPUpdateService extends DAPUpdateService {

    public constructor(recid: string, public store: Storage) {
        super(recid, JSON.parse(store.getItem(recid)));
    }

    protected _refreshRec() {
        let rec = this.store.getItem(this.recid);
        if (! rec)
            throw new errors.IDNotFound(this.recid);
        this._rec = JSON.parse(rec);
    }

    protected _saveRec(rec : DAPRecord) {
        this.store.setItem(this.recid, JSON.stringify(rec));
        this._rec = rec;
    }

    /**
     * return the full DAP record that includes the DBIO envelope (containing record name, ACLs,
     * etc.)  Note that the data property will not contain the full NERDm metadata, but rather a 
     * digest; in particular, it will not include the full list of components. 
     * 
     * This default implementation returns the direct reference of the internal record for testing 
     * purposes

    getRecord() : DAPRecord {
        return this._rec;
    }
     */
    
    /** 
     * return the complete NERDm data 
     */
    getData() : Observable<NerdmRes> { return of(this._rec.data); }

    /**
     * return some property of the NERDm record data
     */
    getDataSubset(propname: string) : Observable<Object> {
        let props = propname.split('/');
        let out = this._rec.data
        let top = null;
        while (props.length > 0) {
            top = props.shift();
            if (out[top] == undefined)
                return throwError(new errors.PartNotFound(this.recid, propname));
            out = out[top];
        }
        return of(out);
    }

    /**
     * replace some property of the NERDm record data with the given value
     */
    setDataSubset(propname: string, val: Object) : Observable<Object> {
        let props = propname.split('/');
        let obj = this._rec.data
        let top = null;
        while (props.length > 1) {
            top = props.shift();
            if (obj[top] == undefined || obj[top] == null)
                obj[top] = {}
            obj = obj[top];
        }
        obj[props[0]] = val;
        this._saveRec(this._rec);
        return of(obj[props[0]]);
    }

    /**
     * update some property of the NERDm record data.  When the property is an object with 
     * subproperties, the given object will be merged in with the existing object value, 
     * overriding the subproperties where their names overlap.
     */
    updateDataSubset(propname: string, val: Object) : Observable<Object> {
        let props = propname.split('/');
        let obj = this._rec.data
        let top = null;
        while (props.length > 1) {
            top = props.shift();
            if (obj[top] == undefined || obj[top] == null) 
                obj[top] = {}
            obj = obj[top];
        }
        if (! obj[props[0]] || ! (val instanceof Object))
            obj[props[0]] = val;
        else if (! (val instanceof Object))
            throw new errors.BadInputError(this.recid+": Target subset, "+propname+
                                           ", is not currently an object");
        else {
            for(const p in val)
                obj[props[0]][p] = val[p];
        }
        
        this._saveRec(this._rec);
        return of(obj[props[0]]);
    }

    /**
     * add an item to the identified list of items (e.g. adding and author to the authors list).
     * It will be appended to the list.
     * @param propname  the name of the property containing a list of values (e.g. "authors")
     * @param item      the object to append to the list
     */
    addDataItem(propname: string, item: Object) : Observable<Object> {
        let props = propname.split('/');
        let obj = this._rec.data
        let top = null;
        while (props.length > 1) {
            top = props.shift();
            if (obj[top] == undefined || obj[top] == null) 
                obj[top] = {}
            obj = obj[top];
        }
        if (! obj[props[0]])
            obj[props[0]] = [];
        let list = obj[props[0]];
        list.push(item);
        
        this._saveRec(this._rec);
        return of(list[list.length-1]);
    }

    /**
     * replace an item to the identified list of items (e.g. adding and author to the authors list).
     * It will be appended to the list.
     * @param propname  the name of the property containing a list of values (e.g. "authors")
     * @param id        the id for the particular item to repace
     * @param item      the object to append to the list
     */
    setDataItem(propname: string, key: string|number, item: Object) : Observable<Object> {
        let props = propname.split('/');
        let obj = this._rec.data
        let top = null;
        while (props.length > 1) {
            top = props.shift();
            if (obj[top] == undefined || obj[top] == null) 
                obj[top] = {}
            obj = obj[top];
        }
        if (! obj[props[0]])
            obj[props[0]] = [];
        let list = obj[props[0]];

        if (typeof key == 'number') {
            if (key < 0 || key >= list.length)
                return throwError(new errors.BadInputError("index, "+key+
                                                           ", out of range for property, "+propname));
            let id = list[key]["@id"];
            list[key] = item;
            if (id)
                list[key]["@id"] = id;
            obj = list[key]
        }
        else {
            let idx = this._listIndexForID(list, key);
            if (idx < 0)
                return throwError(new errors.PartNotFound(this.recid, propname+"/"+key));
            list[idx] = item
            list[idx]["@id"] = key;
            obj = list[key]
        }
        
        this._saveRec(this._rec);
        return of(obj);
    }

    _listIndexForID(list: Array<Object>, id: string) {
        for(let i=0; i < list.length; i++) {
            if (list[i]["@id"] == id)
                return i;
        }
        return -1;
    }

    /**
     * update an item in the identified list of items (e.g. updating author data within the 
     * authors list).  The item is assumed to be an object with 
     * subproperties; the item data will be overlayed onto with the identified item, 
     * overriding the subproperties where their names overlap.
     * @param propname  the name of the property containing a list of values (e.g. "authors")
     * @param id        the id for the particular item to update
     * @param item      the object to append to the list
     */
    updateDataItem(propname: string, key: string|number, item: Object) : Observable<Object> {
        let props = propname.split('/');
        let obj = this._rec.data
        let top = null;
        while (props.length > 1) {
            top = props.shift();
            if (obj[top] == undefined || obj[top] == null) 
                obj[top] = {}
            obj = obj[top];
        }
        if (! obj[props[0]])
            obj[props[0]] = [];
        let list = obj[props[0]];

        if (typeof key == 'number') {
            if (key < 0 || key >= list.length)
                return throwError(new errors.BadInputError("index, "+key+
                                                           ", out of range for property, "+propname));
            obj = list[key]
        }
        else {
            let idx = this._listIndexForID(list, key);
            if (idx < 0)
                return throwError(new errors.PartNotFound(this.recid, propname+"/"+key));
            obj = list[idx]
        }
        for(const p in item) {
            if (p != "@id")
                obj[p] = item[p];
        }
        
        this._saveRec(this._rec);
        return of(obj);
    }

    /**
     * change the mnemonic name of this resource
     * @return string -- the name that was set
     */
    setName(newname: string) : Observable<string> {
        this._rec.name = newname;
        this._saveRec(this._rec);
        return of(this._rec.name);
    }
}
