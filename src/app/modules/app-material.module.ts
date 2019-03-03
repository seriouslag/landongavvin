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
  MatDialogModule,
  MatProgressSpinnerModule
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
  MatDialogModule,
  MatProgressSpinnerModule
];

@NgModule({
  imports: materialArray,
  exports: materialArray
})
export class AppMaterialModule { }
