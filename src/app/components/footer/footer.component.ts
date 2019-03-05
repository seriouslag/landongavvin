import { Component, OnInit } from '@angular/core';
import { WindowService } from 'src/app/services/window.service';
import { buildTime } from 'src/environments/buildTime';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {

  domain: string;
  lastBuildDate: string;

  constructor(private windowService: WindowService) {
    this.domain = windowService.getHostname();
    this.lastBuildDate = buildTime.LastBuildDate;
  }
}
