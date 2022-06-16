import {
  Component, EventEmitter, Input,OnChanges,
  OnDestroy, OnInit, Output, SimpleChanges,
  ViewChild
} from '@angular/core';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { MatMenuTrigger } from '@angular/material/menu';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export type SocalLinks = 'instagram'|'github'|'facebook'|'youtube'|'twitter'|'linkedin'|'twitch';

@Component({
  selector: 'app-social-link',
  templateUrl: './social-link.component.html',
  styleUrls: ['./social-link.component.scss']
})
export class SocialLinkComponent implements OnInit, OnChanges, OnDestroy {

  @Input()
  editMode = false;

  @Input()
  type: SocalLinks = 'facebook';

  @Input()
  link: string = '';

  @Output()
  notify: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild(MatMenuTrigger) menu: MatMenuTrigger | undefined;

  href = '';
  icon = '';
  editPanelOpen = false;

  private mediaSubscription: Subscription|undefined;
  mediaAlias: string = '';

  constructor(private mediaObserver: MediaObserver ) {}

  ngOnInit() {
    this.mediaSubscription = this.mediaObserver.asObservable()
    .pipe(
      filter((changes: MediaChange[]) => changes.length > 0),
      map((changes: MediaChange[]) => changes[0])
    ).subscribe((mediaAlias: MediaChange) => {
      this.mediaAlias = mediaAlias.mqAlias;
    });
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
        this.setHREF(propName as SocalLinks);
      } else if (propName === 'link') {
        this.type = this.type.toLowerCase() as SocalLinks;
        this.setHREF(this.type);
      }
    }
  }

  ngOnDestroy(): void {
    this.mediaSubscription?.unsubscribe();
  }

  private setHREF(type: SocalLinks) {
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
    this.menu?.closeMenu();
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
