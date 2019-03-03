import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-text-input',
  templateUrl: './text-input.component.html',
  styleUrls: ['./text-input.component.scss']
})
export class TextInputComponent implements OnInit {

  @Input()
  editMode: boolean;

  @Input()
  text: string;

  @Input()
  placeholder: string;

  @Input()
  type: string;

  @Input()
  maxlength: number;

  @Output()
  notify: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  enter: EventEmitter<void> = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {
  }

  public onInput(text: string): void {
    this.notify.emit(text);
  }

  public onEnter(): void {
    this.enter.emit();
  }
}
