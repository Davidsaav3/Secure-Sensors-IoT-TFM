import '@angular/compiler';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from "./app/environments/environment"

platformBrowserDynamic().bootstrapModule(AppModule).catch(err => console.error(err));
