import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { slideInAnimation } from './route-animations';
import { materialModules } from './material.module';
import { APP_BASE_HREF } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true, 
  imports: [RouterModule, materialModules], 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [slideInAnimation], 
  providers: [
    {
      provide: APP_BASE_HREF,
      useValue: '/financiamento-auto/', // Ajuste o baseHref conforme o seu deploy
    },
  ],
})
export class AppComponent {
  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
