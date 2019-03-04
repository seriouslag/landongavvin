import { Component, OnInit } from '@angular/core';
import { WindowService } from 'src/app/services/window.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {

  domain: string;

  constructor(private windowService: WindowService) {
    this.domain = windowService.getHostname();
  }
}
