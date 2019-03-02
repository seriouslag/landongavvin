import { Component, OnInit, Input } from '@angular/core';
import { Blog } from 'src/app/models/Blog';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {

  @Input() public blog: Blog;

  constructor() { }

  ngOnInit() {
  }

}
