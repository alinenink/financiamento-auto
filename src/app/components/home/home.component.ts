import {
  Component,
  computed,
  ElementRef,
  inject,
  Signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { materialModules } from '../../material.module';
import { CustomCurrencyPipe } from '../../pipes/currency.pipe';
import { FormatDatePipe } from '../../pipes/format-date.pipe';
import { PdfGeneratorService } from '../../services/PdfGeneratorService';
import { PrestacoesStore } from '../../stores/prestacoes.store';

interface Transacao {
  data: string;
  valor: number;
  status: string;
  comprovanteUrl?: string;
}

interface Prestacao {
  numero: number;
  parcela: string;
  mes: string;
  dataVencimento: string;
  valor: number;
  selecionada: boolean;
  desconto: number;
  status: 'Pago' | 'Em Aberto' | 'Em Atraso';
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    materialModules,
    CustomCurrencyPipe,
    FormatDatePipe,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  currentIndex = 0;
  totalPrestacoes: number = 52;
  prestacoesPagas: number = 4;
  prestacoesAtrasadas: number = 2;
  prestacoesAVencer: number =
    this.totalPrestacoes - (this.prestacoesPagas + this.prestacoesAtrasadas);

  store = inject(PrestacoesStore);

 ultimasPrestacoes: Signal<Prestacao[]> = computed(() => {
    const prestacoes = this.store.prestacoes();
    const todasPrestacoes = Object.values(prestacoes).flat();
    return todasPrestacoes
      .sort(
        (a, b) =>
          new Date(b.dataVencimento).getTime() -
          new Date(a.dataVencimento).getTime()
      )
      .slice(0, 7);
  });

  private todasPrestacoes = computed(() => {
    const prestacoesObj = this.store.prestacoes();
    return Object.values(prestacoesObj).flat();
  });

  totalFinanciado: Signal<number> = computed(() => {
    const prestacoes = this.todasPrestacoes();
    return prestacoes.reduce((total, prestacao) => total + prestacao.valor, 0);
  });

  totalAtraso: Signal<number> = computed(() => {
    const prestacoes = this.todasPrestacoes();
    return prestacoes
      .filter((prestacao) => prestacao.status === 'Em Atraso')
      .reduce((total, prestacao) => total + prestacao.valor, 0);
  });

  totalEmAberto: Signal<number> = computed(() => {
    const prestacoes = this.todasPrestacoes();
    const totalPago = prestacoes
      .filter((prestacao) => prestacao.status === 'Pago')
      .reduce((total, prestacao) => total + prestacao.valor, 0);
    return this.totalFinanciado() - totalPago;
  });

  constructor(private pdfService: PdfGeneratorService) {}

  baixarComprovante(valor: number, dataVenc: string) {
    this.pdfService.gerarComprovante(valor, dataVenc);
  }

  goToSlide(index: number): void {
    this.currentIndex = index;
    const carousel = document.getElementById('carousel')!;
    carousel.style.transform = `translateX(-${index * 100}%)`;
  }
}
