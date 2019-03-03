import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/modules/app-material.module';
import { FormsModule } from '@angular/forms';
import { AboutPageComponent } from './about-page.component';
import { RouterModule } from '@angular/router';
import { AboutComponent } from 'src/app/components/about/about.component';
import { SocialLinkComponent } from 'src/app/components/editable/social-link/social-link.component';
import { TextInputComponent } from 'src/app/components/editable/text-input/text-input.component';
import { ProfileImageComponent } from 'src/app/components/editable/profile-image/profile-image.component';
import { EmailVerificationComponent } from 'src/app/components/editable/email-verification/email-verification.component';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [
    AboutPageComponent,
    AboutComponent,
    SocialLinkComponent,
    TextInputComponent,
    ProfileImageComponent,
    EmailVerificationComponent
  ],
  imports: [
    RouterModule.forChild([{ path: '', component: AboutPageComponent }]),
    AppMaterialModule,
    FormsModule,
    CommonModule,
    FlexLayoutModule
  ],
})
export class AboutPageModule { }
