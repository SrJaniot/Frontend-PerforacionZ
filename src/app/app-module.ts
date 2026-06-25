import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';


//import { NgToastModule } from 'ng-angular-popup'; este es el modulo de popup  npm install ng-angular-popup  https://www.npmjs.com/package/ng-angular-popup
import { NgToastModule } from 'ng-angular-popup';

//importacion para peticiones http
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

@NgModule({
  declarations: [
    App
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgToastModule,
    HttpClientModule

  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
  ],
  bootstrap: [App]
})
export class AppModule { }
