import { inject, Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { GlobalService } from '../globals/globals';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    globalService = inject(GlobalService);
    constructor(private toastr: ToastrService) {
        this.globalService.watchMessage1((msg) => {
            if (msg.type === 'error' || msg.type === 'syserror') {
                this.showError(msg.text, msg.prefix);
            }
        });
    }

    showSuccess(message, title) {
        this.toastr.success(message, title, {
            positionClass: 'toast-top-right'
        })
    }

    showSuccessWithTimeout(message, title, timespan) {
        console.log("showing success message with timeout", message, title, timespan);
        this.toastr.success(message, title, {
            timeOut: timespan,
            positionClass: 'toast-top-right'
        })
        console.log("message should be shown now");
    }

    showHTMLMessage(message, title) {
        this.toastr.success(message, title, {
            enableHtml: true,
            positionClass: 'toast-top-right'
        })
    }

    showError(message, title) {
        this.toastr.error(message, title, {
            enableHtml: true,
            positionClass: 'toast-top-right'
        })
    }
}