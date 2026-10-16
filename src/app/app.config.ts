
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
} from '@angular/core';

import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { AuthService } from './services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideRouter(routes),

    provideAppInitializer(() => {
      const authService = inject(AuthService);
      authService.initializeSession();
    }),
  ],
};
