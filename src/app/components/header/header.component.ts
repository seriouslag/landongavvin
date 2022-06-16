import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  private fbAuthUserSubscription: Subscription|undefined;
  fbAuthUser: firebase.default.User|null = null;

  constructor(private firebaseService: FirebaseService) { }

  ngOnInit() {
    this.fbAuthUserSubscription = this.firebaseService.fbAuthUser.subscribe((fbAuthUser) => {
      this.fbAuthUser = fbAuthUser;
    });
  }

  ngOnDestroy(): void {
    if (this.fbAuthUserSubscription) {
      this.fbAuthUserSubscription.unsubscribe();
    }
  }

}
