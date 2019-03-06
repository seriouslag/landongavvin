import { Component, OnInit, OnDestroy } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Subscription, of } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  private fbAuthUserSubscription: Subscription;
  fbAuthUser: firebase.User = null;

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
