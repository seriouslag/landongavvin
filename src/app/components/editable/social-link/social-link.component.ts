import {
  Component,
  OnInit,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  OnChanges,
  OnDestroy
} from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Subscription } from 'rxjs';
import { MediaChange, MediaObserver } from '@angular/flex-layout';

@Component({
  selector: 'app-social-link',
  templateUrl: './social-link.component.html',
  styleUrls: ['./social-link.component.scss']
})
export class SocialLinkComponent implements OnInit, OnChanges, OnDestroy {

  @Input()
  editMode = false;

  @Input()
  type: string;

  @Input()
  link: string;

  @Output()
  notify: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild(MatMenuTrigger) menu: MatMenuTrigger;

  href = '';
  icon = '';
  editPanelOpen = false;

  private mediaSubscription: Subscription;
  mediaAlias: string;

  constructor(private mediaObserver: MediaObserver ) {}

  ngOnInit() {
    this.mediaSubscription = this.mediaObserver.media$.subscribe((mediaAlias: MediaChange) => {
      this.mediaAlias = mediaAlias.mqAlias;
    });
    this.type = this.type.toLowerCase();
    this.setHREF(this.type);
    if (this.mediaObserver.isActive('xs')) {
      this.mediaAlias = 'xs';
    } else if (this.mediaObserver.isActive('sm')) {
      this.mediaAlias = 'sm';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // when the aboutUser changes change the profile pic
    for (const propName in changes) {
      if (propName === 'type') {
        this.setHREF(propName);
      } else if (propName === 'link') {
        this.type = this.type.toLowerCase();
        this.setHREF(this.type);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.mediaSubscription) {
      this.mediaSubscription.unsubscribe();
    }
  }

  private setHREF(type: string) {
    this.href = '';
    this.icon = '';
    switch (type) {
      case 'instagram': {
        this.href = 'www.instagram.com/';
        this.icon = 'instagram';
        break;
      }
      case 'facebook': {
        this.href = 'www.facebook.com/';
        this.icon = 'facebook-box';
        break;
      }
      case 'youtube': {
        this.href = 'www.youtube.com/';
        this.icon = 'youtube';
        break;
      }
      case 'twitter': {
        this.href = 'www.twitter.com/';
        this.icon = 'twitter-box';
        break;
      }
      case 'twitch': {
        this.href = 'www.twitch.tv/';
        this.icon = 'twitch';
        break;
      }
      case 'linkedin': {
        this.href = 'www.linkedin.com/in/';
        this.icon = 'linkedin-box';
        break;
      }
      case 'github' : {
        this.href = 'www.github.com/';
        this.icon = 'github-circle';
      }
    }
    if (this.href && this.link) {
      this.href = this.href + this.link;
    } else {
      // invalid type :(
    }
  }

  private closeMenu(): void {
    this.menu.closeMenu();
  }

  public onEnter() {
    this.notify.emit(this.link.trim());
    this.closeMenu();
  }

  public onInput(event: string): void {
    this.link = event;
  }

  public toggleEditPanel() {
    this.editPanelOpen = !this.editPanelOpen;
  }
}
