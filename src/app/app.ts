import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class AppComponent {
  constructor() {
    // Instantiate ThemeService at startup so the saved theme is applied
    // on every route (login and signup included), not only where the header shows.
    inject(ThemeService);
  }
}
