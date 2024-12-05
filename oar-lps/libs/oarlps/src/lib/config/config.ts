/**
 * Classes used to support the configuration infrastructure.  
 * 
 * This file provides import compatibility with the previous implementation (see config.module).
 */
import { Injectable } from '@angular/core';
import { LPSConfig } from './config.model';
import { AppConfig } from './config.service';

export { LPSConfig, AppConfig }
