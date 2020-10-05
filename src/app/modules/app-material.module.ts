import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
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
  MatProgressSpinnerModule,
  MatToolbarModule
];

@NgModule({
  imports: materialArray,
  exports: materialArray
})
export class AppMaterialModule { }
