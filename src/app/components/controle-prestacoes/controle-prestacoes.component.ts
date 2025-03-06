import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject, signal, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PrestacoesStore } from '../../stores/prestacoes.store';
import { AlertComponent } from '../alert/alert.component';
import { PdfGeneratorService } from '../../services/PdfGeneratorService';
import { CustomCurrencyPipe } from '../../pipes/currency.pipe';

// Definição da estrutura das prestações
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
  selector: 'app-boleto',
  standalone: true,
  imports: [    FormsModule,
    CommonModule,
    RouterModule,
    AlertComponent,
    CustomCurrencyPipe
  ],
  templateUrl: './controle-prestacoes.component.html',
  styleUrls: ['./controle-prestacoes.component.scss'],
})
export class ControlePrestacoesComponent {
  selectedOption: string | null = null;
  email: string = '';
  barcode: string = '';

  store = inject(PrestacoesStore);
  prestacoes: Signal<Record<number, Prestacao[]>> = this.store.prestacoes;
  openYear: number | null = null;

  alertMessage = signal<string | null>(null);
  alertType = signal<'success' | 'error' | 'warning' | 'info'>('info');

  mostrarModalRenegociacao = false;
  prestacoesEmAtraso: Prestacao[] = [];
  totalSelecionado = 0;

  constructor(
    private pdfService: PdfGeneratorService,
    public prestacoesStore: PrestacoesStore
  ) {
    this.checkForLatePayments();
    this.email = this.prestacoesStore.email();
    this.barcode = this.prestacoesStore.codigoBarras();
  }

  gerarDemonstrativoParcelas() {
    this.pdfService.gerarDemonstrativoParcelas();
  }

  // Define qual opção está selecionada
  onOptionChange(option: string) {
    this.selectedOption = option;
  }

  // Função do botão dinâmico, que muda com base na opção escolhida
  onActionClick() {
    if (this.selectedOption === 'generatePdf') {
      this.generateBoletoPdf();
    } else if (this.selectedOption === 'sendEmail') {
      this.sendBoletoEmail();
    }
  }

  // Texto dinâmico para o botão de ação
  getButtonText(): string {
    switch (this.selectedOption) {
      case 'generatePdf':
        return 'Baixar Boleto em PDF';
      case 'sendEmail':
        return 'Enviar Boleto por Email';
      default:
        return '';
    }
  }

  toggleYear(year: number) {
    this.openYear = this.openYear === year ? null : year;
  }

  getPrestacoes(ano: number) {
    return this.prestacoes()[ano] || [];
  }
  

  // Lógica para baixar o boleto em PDF
  generateBoletoPdf() {
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.toLocaleString('pt-BR', { month: 'long' }); // Nome do mês em português

    // Obtém as prestações do ano atual
    const prestacoesAnoAtual =
      this.prestacoesStore.getPrestacoesPorAno(anoAtual);

    // Filtra a prestação do mês atual
    const prestacaoAtual = prestacoesAnoAtual.find(
      (p) => p.mes.toLowerCase() === mesAtual.toLowerCase()
    );

    if (!prestacaoAtual) {
      this.showAlert(
        `Nenhuma prestação encontrada para ${mesAtual} de ${anoAtual}.`,
        'warning'
      );
      return;
    }

    // Gera o boleto com os valores da prestação do mês atual
    this.pdfService.gerarBoletoFake(
      prestacaoAtual.dataVencimento,
      prestacaoAtual.parcela,
      prestacaoAtual.valor,
      0,
      0, 
      prestacaoAtual.desconto
    );

    this.showAlert(`Boleto de ${mesAtual} gerado com sucesso!`, 'success');
  }

  showAlert(message: string, type: 'success' | 'error' | 'warning' | 'info') {
    this.alertMessage.set(message);
    this.alertType.set(type);

    setTimeout(() => {
      if (this.alertMessage() === message) {
        this.alertMessage.set(null);
      }
    }, 3000);
  }

  sendBoletoEmail() {
    if (!this.email) {
      this.showAlert('Por favor, informe um e-mail válido.', 'error');
      return;
    }

    this.showAlert(`Boleto enviado para ${this.email}`, 'success');
  }

  // Lógica para copiar código de barras
  copyBarcode() {
    if (!this.barcode) {
      this.showAlert(
        'Nenhum código de barras disponível para copiar.',
        'error'
      );
      return;
    }
    navigator.clipboard.writeText(this.barcode);
    this.showAlert('Código de barras copiado com sucesso!', 'success');
  }

  // Verifica se há parcelas em atraso e exibe um alerta
  checkForLatePayments() {
    const prestacoesData = this.prestacoes();

    for (const year of Object.keys(prestacoesData).map(Number)) {
      if (
        prestacoesData[year]?.some((p: Prestacao) => p.status === 'Em Atraso')
      ) {
        return;
      }
    }
  }

  onRenegotiation(): void {
    this.prestacoesEmAtraso = this.prestacoesEmAtrasoStore();
    this.calcularTotal();
    this.mostrarModalRenegociacao = true;
  }

  onFecharModal(): void {
    this.mostrarModalRenegociacao = false;
  }

  calcularTotal(): void {
    this.totalSelecionado = this.prestacoesEmAtraso
      .filter((p: Prestacao) => p.selecionada === true)
      .reduce((acc: number, p: Prestacao) => acc + p.valor, 0);
  }

  prestacoesEmAtrasoStore(): Prestacao[] {
    return Object.values(this.prestacoes())
      .flat()
      .filter((p: Prestacao): p is Prestacao => !!p && p.status === 'Em Atraso')
      .map((p) => ({ ...p, selecionada: p.selecionada ?? false }));
  }

  gerarBoletoRenegociacao(): void {
    const selecionadas = this.prestacoesEmAtraso.filter(
      (p: Prestacao) => p.selecionada
    );
    if (selecionadas.length === 0) {
      return;
    }
    this.pdfService.gerarBoletoComPrestacoes(selecionadas);
    this.onFecharModal();
  }

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }
  
}
