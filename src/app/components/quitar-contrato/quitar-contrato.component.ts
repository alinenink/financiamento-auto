import { Component, EventEmitter, Output, inject, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PrestacoesStore } from '../../stores/prestacoes.store';
import { signal } from '@angular/core';
import { AlertComponent } from '../alert/alert.component';
import { PdfGeneratorService } from '../../services/PdfGeneratorService';


interface Prestacao {
  parcela: string;
  mes: string;
  dataVencimento: string;
  valor: number;
  selecionada: boolean;
  desconto: number;
  status: string;
}

@Component({
  selector: 'app-quitar-contrato',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AlertComponent],
  templateUrl: './quitar-contrato.component.html',
  styleUrls: ['./quitar-contrato.component.scss'],
})
export class QuitarContratoComponent {
  /** Lista de feriados utilizados para validação da data de quitação. */
  feriados = [
    '2025-01-01',
    '2025-04-21',
    '2025-05-01',
    '2025-09-07',
    '2025-12-25',
  ];

  alertMessage = signal<string | null>(null);
  alertType = signal<'success' | 'error' | 'warning' | 'info'>('info');
  dataQuitacao: string | null = null;

  @Output() fecharPopup = new EventEmitter<void>();
  store = inject(PrestacoesStore);
  prestacoes: Signal<Record<number, Prestacao[]>> = this.store.prestacoes;

  aceitouTermos = false;
  mostrarTermos = false;
  showResult = false;

  constructor(
    private pdfService: PdfGeneratorService,
    public prestacoesStore: PrestacoesStore
  ) {}

  ngOnInit() {
    const prestacoesData = this.prestacoes();
    Object.entries(prestacoesData).forEach(([ano, prestacoes]) => {
      console.log(`Ano ${ano}: ${prestacoes.length} prestações`);
    });
  }

  /** Calcula o total de prestações em aberto ou em atraso. */
  get valorTotal(): number {
    const allPrestacoes = Object.entries(this.prestacoes() || {}).flatMap(
      ([ano, prestacoesArray]) =>
        prestacoesArray.filter(
          (p) =>
            p.status?.trim().toLowerCase() === 'em aberto' ||
            p.status?.trim().toLowerCase() === 'em atraso'
        )
    );
    return allPrestacoes.reduce((acc, p) => acc + p.valor, 0);
  }

  /** Retorna a porcentagem de desconto baseada na data de quitação. */
  get desconto(): number {
    if (!this.dataQuitacao) return 0;
    const dataEscolhida = new Date(this.dataQuitacao);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const diferencaDias = Math.ceil(
      (dataEscolhida.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diferencaDias === 0) return 25;
    if (diferencaDias <= 7) return 20;
    if (diferencaDias <= 15) return 15;
    if (diferencaDias <= 30) return 10;
    return 5;
  }

  /** Calcula o valor final com desconto aplicado. */
  get novoCusto(): number {
    const descontoValor = this.valorTotal * (this.desconto / 100);
    return this.valorTotal - descontoValor;
  }

  /** Exibe os termos de uso. */
  abrirTermos() {
    this.mostrarTermos = true;
  }

  /** Oculta os termos de uso. */
  fecharTermos() {
    this.mostrarTermos = false;
  }

  /** Gera um boleto de quitação após validar os termos. */
  gerarBoleto() {
    if (!this.aceitouTermos) {
      this.showAlert(
        'Você precisa aceitar os termos para gerar o boleto.',
        'error'
      );
      return;
    }
    
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
      this.valorTotal.toString(),
      this.novoCusto,
      0, 
      0, 
      this.desconto,
      'sim'
    );

    this.showAlert(`Boleto de ${mesAtual} gerado com sucesso!`, 'success');
  }

  /** Valida a data escolhida conforme regras de quitação. */
  validarDataQuitacao(): void {
    if (!this.dataQuitacao) {
      this.showAlert('Escolha uma data válida.', 'error');
      return;
    }
    const data = new Date(this.dataQuitacao);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const diaSemana = data.getUTCDay();
    if (data < hoje) {
      this.showAlert('A data não pode ser retroativa.', 'error');
      return;
    }
    if (diaSemana === 0 || diaSemana === 6) {
      this.showAlert(
        'A quitação só pode ser feita em dias úteis (segunda a sexta-feira).',
        'error'
      );
      return;
    }
    if (this.feriados.includes(this.dataQuitacao)) {
      this.showAlert(
        'A data escolhida é um feriado. Escolha outro dia útil.',
        'error'
      );
      return;
    }
    const total = this.valorTotal;
    const desc = this.desconto;
    const custo = this.novoCusto;

    this.showResult = true;
  }

  /** Exibe uma mensagem de alerta com tempo de duração controlado. */
  showAlert(message: string, type: 'success' | 'error' | 'warning' | 'info') {
    this.alertMessage.set(message);
    this.alertType.set(type);
    setTimeout(() => {
      if (this.alertMessage() === message) {
        this.alertMessage.set(null);
      }
    }, 3000);
  }
}
