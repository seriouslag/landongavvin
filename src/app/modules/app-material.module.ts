import {
  MatButtonModule,
  MatCheckboxModule,
  MatCardModule,
  MatIconModule,
  MatMenuModule,
  MatExpansionModule,
  MatTooltipModule,
  MatFormFieldModule,
  MatInputModule,
  MatRadioModule,
  MatSnackBarModule,
  MatStepperModule,
  MatDialogModule
} from '@angular/material';
import { NgModule } from '@angular/core';

const materialArray = [
  MatButtonModule,
  MatCheckboxModule,
  MatCardModule,
  MatIconModule,
  MatMenuModule,
  MatExpansionModule,
  MatTooltipModule,
  MatFormFieldModule,
  MatInputModule,
  MatRadioModule,
  MatSnackBarModule,
  MatStepperModule,
  MatDialogModule
];

@NgModule({
  imports: materialArray,
  exports: materialArray
})
export class AppMaterialModule { }
