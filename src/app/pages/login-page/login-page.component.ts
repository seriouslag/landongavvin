import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit, OnDestroy {

  private routerSubscription: Subscription|undefined;;
  private redirectAfterLogin: string|undefined;
  private userSubscription: Subscription|undefined;
  fbAuthUser: firebase.default.User|undefined;

  constructor(private activatedRoute: ActivatedRoute, private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.userSubscription = this.firebaseService.fbAuthUser.subscribe((fbAuthUser) => {
      this.fbAuthUser = fbAuthUser;
    });
    this.routerSubscription = this.activatedRoute.params.subscribe(params => {
      if (params.redirectAfterLogin) {
        this.redirectAfterLogin = params.redirectAfterLogin;
      }
    });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
  }

  async signOut(): Promise<void> {
    await this.firebaseService.logout();
  }
}
