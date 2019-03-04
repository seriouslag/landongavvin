import { NgModule } from '@angular/core';
import { LoginFormComponent } from '../components/forms/login-form/login-form.component';
import { AppMaterialModule } from './app-material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

const componentArray = [
  LoginFormComponent
];

const moduleArray = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  AppMaterialModule,
  FlexLayoutModule
];

@NgModule({
  declarations: componentArray,
  imports: moduleArray,
  exports: componentArray
})
export class AppCommonModule { }
