import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './modules/app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireStorageModule } from '@angular/fire/storage';

import { environment } from '../environments/environment';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppMaterialModule } from './modules/app-material.module';
import { BlogListComponent } from './components/blog-list/blog-list.component';
import { BlogComponent } from './components/blog/blog.component';
import { HomeComponent } from './pages/home/home.component';
import { HeaderComponent } from './components/header/header.component';
import { MenuComponent } from './components/menu/menu.component';
import { LoginComponent } from './components/login/login.component';
import { AccountComponent } from './components/account/account.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginFormComponent } from './components/forms/login-form/login-form.component';
import { NewUserDialogComponent } from './components/dialogs/new-user-dialog/new-user-dialog.component';
import { MatIconRegistry } from '@angular/material';
import { HttpClientModule } from '@angular/common/http';
import { QuestionDialogComponent } from './components/dialogs/question-dialog/question-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    BlogListComponent,
    BlogComponent,
    HomeComponent,
    HeaderComponent,
    MenuComponent,
    LoginComponent,
    AccountComponent,
    LoginFormComponent,
    NewUserDialogComponent,
    QuestionDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFireStorageModule,
    FlexLayoutModule,
    AppMaterialModule, // import the Angular Material modules after Angular's BrowserModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [QuestionDialogComponent, NewUserDialogComponent],
})
export class AppModule {
  constructor(matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) {
    matIconRegistry
    .addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('./assets/mdi.svg'));
  }
}
