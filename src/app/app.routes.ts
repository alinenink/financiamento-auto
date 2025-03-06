import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { ControlePrestacoesComponent } from './components/controle-prestacoes/controle-prestacoes.component';
import { AdiantarPrestacoesComponent } from './components/adiantar-prestacoes/adiantar-prestacoes.component';
import { QuitarContratoComponent } from './components/quitar-contrato/quitar-contrato.component';

export const routes: Routes = [
  { path: "", redirectTo: "/login", pathMatch: "full" },
  { path: 'login', component: LoginComponent, title: 'Login' },
  { path: 'home', component: HomeComponent },
  { path: 'gerar-boleto', component: ControlePrestacoesComponent, data: { animation: 'GerarBoletoPage' } },
  { path: 'adiantar-parcelas', component: AdiantarPrestacoesComponent, data: { animation: 'AdiantarParcelasPage' } },
  { path: 'quitar-contrato', component: QuitarContratoComponent, data: { animation: 'QuitarContratoPage' } },
  { path: "**", redirectTo: "/Login" },
];

export const appRouter = [provideRouter(routes)];
