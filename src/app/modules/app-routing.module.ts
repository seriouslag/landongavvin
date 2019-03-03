import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from '../pages/page-not-found/page-not-found.component';
import { HomeComponent } from '../pages/home/home.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'about', redirectTo: 'about/LandonGavin', pathMatch: 'full' },
  { path: 'about/:vanity', loadChildren: '../pages/about-page/about-page.module#AboutPageModule' },
  { path: 'account', loadChildren: '../pages/account-page/account-page.module#AccountPageModule' },
  // { path: 'login', loadChildren: '../pages/login/login.page.module#LoginPageModule' },

  /*
    Lazy loading with a wildcard does not work with angular4 yet.
    {path: '**', loadChildren: 'app/pages/splash/splash.page.module#SplashPageModule'}
   */
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
