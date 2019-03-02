import { Component, OnInit, OnDestroy } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Subscription, of } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  private userSubscription: Subscription;
  user: firebase.User = null;

  constructor(private firebaseService: FirebaseService) { }

  ngOnInit() {
    this.userSubscription = this.firebaseService.user.subscribe((user) => {
      this.user = user;
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

}
