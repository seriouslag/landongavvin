import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/modules/app-material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoginPageComponent } from './login-page.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AppCommonModule } from 'src/app/modules/app-common.module';

@NgModule({
  declarations: [
    LoginPageComponent
  ],
  imports: [
    RouterModule.forChild([{ path: '', component: LoginPageComponent }]),
    CommonModule,
    AppMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    AppCommonModule
  ]
})
export class LoginPageModule { }
