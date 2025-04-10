import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;

registerLocaleData(localeFr);

