import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Blog } from 'src/app/models/Blog';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.scss']
})
export class BlogListComponent implements OnInit {

  blogs: Observable<Blog[]>;

  constructor(private firebaseService: FirebaseService) { }

  ngOnInit() {
    this.blogs = this.firebaseService.getBlogs();
  }

}
