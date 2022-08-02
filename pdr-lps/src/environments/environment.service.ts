
import { IEnvironment } from './ienvironment';
import { Injectable } from '@angular/core';
import { environment } from './environment-impl';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService implements IEnvironment {
  get context() {
    return environment.context;
  }

  get lPSConfig() {
    return environment.lPSConfig;
  }

  get testdata() {
    return environment.testdata;
  }

  constructor() {}
}