import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: false,
  templateUrl: './loading.html',
  styleUrl: './loading.css',
})
export class Loading {
    @Input() fullscreen = true;

}
