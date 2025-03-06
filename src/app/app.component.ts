import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { slideInAnimation } from './route-animations';
import { materialModules } from './material.module';

@Component({
  selector: 'app-root',
  standalone: true, 
  imports: [RouterModule, materialModules], 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [slideInAnimation], 
})
export class AppComponent {
  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
