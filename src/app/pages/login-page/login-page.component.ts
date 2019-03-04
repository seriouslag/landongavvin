import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { User } from 'src/app/models/User';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit, OnDestroy {

  private routerSubscription: Subscription;
  private redirectAfterLogin: string;
  private userSubscription: Subscription;
  user: firebase.User;

  constructor(private activatedRoute: ActivatedRoute, private firebaseService: FirebaseService) {
    this.userSubscription = this.firebaseService.user.subscribe((user) => {
      this.user = user;
    });
  }

  ngOnInit(): void {
    this.routerSubscription = this.activatedRoute.params.subscribe(params => {
      if (params.redirectAfterLogin) {
        this.redirectAfterLogin = params.redirectAfterLogin;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  signOut(): void {
    this.firebaseService.logout();
  }
}
