import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SpinnerService {
    private requests = 0;
    private maxTimeout: any;

    private loading = new BehaviorSubject<boolean>(false);
    loading$ = this.loading.asObservable();

    _authorized : BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(false);
    public show() { 
        this.requests++;
        this.loading.next(true); 

        // Fail-safe: auto-hide after 20s
        clearTimeout(this.maxTimeout);
        this.maxTimeout = setTimeout(() => {
            console.warn('Spinner auto-hidden due to timeout');
            this.hide(true);
        }, 20000);        
    }
    public watchLoading(subscriber) {
        this.loading.subscribe(subscriber);
    }      
    
    public hide(force: boolean = false) {
        this.requests = Math.max(0, this.requests - 1);

        if (this.requests === 0 || force) {
            this.loading.next(false);
            this.requests = 0; // reset request count
            clearTimeout(this.maxTimeout);
        }
    }
}