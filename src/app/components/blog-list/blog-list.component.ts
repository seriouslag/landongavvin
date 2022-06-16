import { Component, OnDestroy, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Blog } from 'src/app/models/Blog';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.scss']
})
export class BlogListComponent implements OnInit, OnDestroy {

  blogsSubscription: Subscription|undefined;
  blogs: Blog[] = [];
  loading = true;
  failed = false;

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit() {
    this.blogsSubscription = this.firebaseService
      .getBlogs()
      .pipe(
        tap(() => this.loading = false)
      )
      .subscribe((blogs) => {
        this.blogs = blogs;
      },
        (error) => {
          console.log('Failed loading blogs', error);
          this.failed = true;
          this.blogs = [];
        });
  }

  ngOnDestroy() {
    this.blogsSubscription?.unsubscribe();
  }
}
