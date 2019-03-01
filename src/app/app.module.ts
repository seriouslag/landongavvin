import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './modules/app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';

import { environment } from '../environments/environment';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { reducers, metaReducers } from './reducers/';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppMaterialModule } from './modules/app-material.module';
import { BlogListComponent } from './components/blog-list/blog-list.component';
import { BlogComponent } from './components/blog/blog.component';
import { EffectsModule } from '@ngrx/effects';
import { BlogEffects } from './effects/blog';
import { HomeComponent } from './pages/home/home.component';
import { reducer as blogReducer } from './reducers/blogs';

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    BlogListComponent,
    BlogComponent,
    HomeComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    StoreModule.forRoot({ blogs: blogReducer }),
    EffectsModule.forRoot([BlogEffects]),
    FlexLayoutModule,
    AppMaterialModule, // import the Angular Material modules after Angular's BrowserModule
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production, // Restrict extension to log-only mode
    }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
