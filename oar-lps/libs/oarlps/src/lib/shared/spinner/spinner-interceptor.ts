import { Injectable } from '@angular/core';
import { HttpInterceptor } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { SpinnerService } from './spinner.service';

@Injectable()
export class SpinnerInterceptor implements HttpInterceptor {
    constructor(private spinner: SpinnerService) {}

    intercept(req, next) {
        this.spinner.show();

        return next.handle(req).pipe(
            finalize(() => this.spinner.hide())
        );
    }
}