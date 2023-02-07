  
import { Component } from '@angular/core';
import {HostListener} from "@angular/core";
import { CartService } from '../datacart/cart.service';

@Component({
    template: ''
})
export abstract class ComponentCanDeactivate {
 
    abstract  canDeactivate(): boolean;

    constructor(public cartService: CartService){

    }

    @HostListener('window:beforeunload', ['$event'])
    unloadNotification($event: any) {
        if (!this.canDeactivate()) {
            $event.returnValue = true;
        }
    }
}