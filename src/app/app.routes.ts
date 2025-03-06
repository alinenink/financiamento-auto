import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { BoletoComponent } from './components/boleto/boleto.component';
import { AdiantarParcelasPopupComponent } from './components/adiantar-parcelas-popup/adiantar-parcelas-popup.component';
import { QuitarContratoPopupComponent } from './components/quitar-contrato-popup/quitar-contrato-popup.component';

export const routes: Routes = [
  { path: '', component: LoginComponent, title: 'Login' },
  { path: 'home', component: HomeComponent },
  { path: 'gerar-boleto', component: BoletoComponent, data: { animation: 'GerarBoletoPage' } },
  { path: 'adiantar-parcelas', component: AdiantarParcelasPopupComponent, data: { animation: 'AdiantarParcelasPage' } },
  { path: 'quitar-contrato', component: QuitarContratoPopupComponent, data: { animation: 'QuitarContratoPage' } },
];

export const appRouter = [provideRouter(routes)];
