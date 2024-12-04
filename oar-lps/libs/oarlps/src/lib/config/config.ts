/**
 * Classes used to support the configuration infrastructure.  
 * 
 * Configuration parameters used by the application are defined in the form of
 * interfaces.  The AppConfig is an implementation of the app-level configuration
 * interface, LPSConfig, that can be injected into Components.  
 */
import { Injectable } from '@angular/core';
import { LPSConfig } from './config.model';
import { ConfigService } from './config.service';

class AppConfig extends ConfigService { }

export { LPSConfig, AppConfig }
