import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/modules/app-material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccountPageComponent } from './account-page.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [
    AccountPageComponent,
  ],
  imports: [
    RouterModule.forChild([{ path: '', component: AccountPageComponent }]),
    AppMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    FlexLayoutModule
  ],
})
export class AccountPageModule { }
