import {
  Component,
  inject,
  signal,
  Signal,
  effect,
  computed,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AlertComponent } from '../alert/alert.component';
import { PdfGeneratorService } from '../../services/PdfGeneratorService';
import { PrestacoesStore } from '../../stores/prestacoes.store';
import { CustomCurrencyPipe } from '../../pipes/currency.pipe';

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
  selector: 'app-adiantar-prestacoes',
  standalone: true,
  imports: [
    CustomCurrencyPipe,
    FormsModule,
    CommonModule,
    RouterModule,
    AlertComponent,
  ],
  templateUrl: './adiantar-prestacoes.component.html',
  styleUrls: ['./adiantar-prestacoes.component.scss'],
})
export class AdiantarPrestacoesComponent {
  showQuitarContratoAlert = false;

  store = inject(PrestacoesStore);

  // ==================== Bloco de Simulação ====================
  numPrestacoes: string = '';
  tipoSelecao: string = '';
  prestacoesSimulacao: Signal<Record<number, Prestacao[]>> = computed(() => {
    const prestacoes = this.store.prestacoes();
    const filtradas: Record<number, Prestacao[]> = {};

    Object.keys(prestacoes).forEach((ano) => {
      const prestacoesFiltradas = prestacoes[Number(ano)].filter(
        (p) => p.status === 'Em Aberto'
      );
      if (prestacoesFiltradas.length > 0) {
        filtradas[Number(ano)] = prestacoesFiltradas;
      }
    });

    return filtradas;
  });
  
  valorTotalSimulacao: number = 0;
  totalDescontoSimulacao: number = 0;

  // ==================== Bloco da Tabela ====================
  prestacoesTabela: Signal<Record<number, Prestacao[]>> = computed(() => {
    const prestacoes = this.store.prestacoes();
    const filtradas: Record<number, Prestacao[]> = {};

    Object.keys(prestacoes).forEach((ano) => {
      const prestacoesFiltradas = prestacoes[Number(ano)].filter(
        (p) => p.status === 'Em Aberto'
      );
      if (prestacoesFiltradas.length > 0) {
        filtradas[Number(ano)] = prestacoesFiltradas;
      }
    });

    return filtradas;
  });

  prestacoesTabelaPagina: Prestacao[] = [];
  todasSelecionadasTabela: boolean = false;
  tabelaAberta: boolean = false;
  paginaAtual: number = 1;
  itensPorPagina: number = 10;
  valorTotalTabelaSemDesconto: number = 0;
  valorTotalTabelaComDesconto: number = 0;
  totalDescontoTabela: number = 0;

  alertMessage = signal<string | null>(null);
  alertType = signal<'success' | 'error' | 'warning' | 'info'>('info');

  constructor(
    private pdfService: PdfGeneratorService,
    private prestacoesStore: PrestacoesStore,
    private router: Router
  ) {
    effect(() => {
      console.log('Dados da store detectados, atualizando tabela...');
      this.atualizarPaginacaoTabela();
    });
  }

  ngOnInit() {
    this.carregarPrestacoes();
  }

  carregarPrestacoes() {
    // Aguarda a inicialização do estado antes de acessar os dados
    const prestacoes = this.prestacoesStore.prestacoes();
    if (!prestacoes || Object.keys(prestacoes).length === 0) {
      return;
    }

    this.inicializarTabela();
    this.inicializarSimulacao();
    this.atualizarPaginacaoTabela();
  }

  inicializarTabela() {
    this.carregarPrestacoes();
  }

  inicializarSimulacao() {
    this.valorTotalSimulacao = 0;
    this.totalDescontoSimulacao = 0;
  }

  // Obtém as prestações da página atual com base na paginação
  obterPrestacoesPagina(
    prestacoes: Record<number, Prestacao[]>,
    pagina: number
  ): Prestacao[] {
    const startIndex = (pagina - 1) * this.itensPorPagina;
    const endIndex = startIndex + this.itensPorPagina;
    return Object.values(prestacoes).flat().slice(startIndex, endIndex);
  }

  validarNumeroPrestacoes() {
    // Permite apenas números e limita a 2 dígitos
    this.numPrestacoes = this.numPrestacoes.replace(/[^0-9]/g, '').slice(0, 2);
  }

  // ======================== Boleto =============================

  gerarBoletoSimulacao() {
    const formatDate = (date: Date): string => {
      const dia = String(date.getDate()).padStart(2, '0');
      const mes = String(date.getMonth() + 1).padStart(2, '0');
      const ano = date.getFullYear();

      return `${dia}-${mes}-${ano}`;
    };

    const hoje = new Date();
    const dataFormatada = formatDate(hoje);
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.toLocaleString('pt-BR', { month: 'long' });

    // Obtém as prestações do ano atual
    const prestacoesAnoAtual =
      this.prestacoesStore.getPrestacoesPorAno(anoAtual) || [];

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

    this.pdfService.gerarBoletoFake(
      dataFormatada,
      this.numPrestacoes,
      this.valorTotalSimulacao,
      0,
      0,
      this.totalDescontoSimulacao
    );

    this.showAlert(`Boleto de adiantanemnto de prestações gerado com sucesso!`, 'success');
  }

  gerarBoletoTabela() {
    const formatDate = (date: Date): string => {
      const dia = String(date.getDate()).padStart(2, '0');
      const mes = String(date.getMonth() + 1).padStart(2, '0');
      const ano = date.getFullYear();

      return `${dia}-${mes}-${ano}`;
    };

    const hoje = new Date();
    const dataFormatada = formatDate(hoje);
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.toLocaleString('pt-BR', { month: 'long' });

    // Obtém as prestações do ano atual
    const prestacoesAnoAtual =
      this.prestacoesStore.getPrestacoesPorAno(anoAtual) || [];

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

    this.pdfService.gerarBoletoFake(
      dataFormatada,
      this.numPrestacoes,
      this.valorTotalTabelaSemDesconto,
      0,
      0,
      this.totalDescontoTabela
    );

    this.showAlert(`Boleto de adiantanemnto de prestações gerado com sucesso!`, 'success');
  }

  showAlert(message: string, type: 'success' | 'error' | 'warning' | 'info') {
    this.alertMessage.set(message);
    this.alertType.set(type);

    // Garante que o alerta fecha corretamente após 3 segundos
    setTimeout(() => {
      if (this.alertMessage() === message) {
        // Evita fechar outro alerta prematuramente
        this.alertMessage.set(null);
      }
    }, 3000);
  }

  // ==================== Métodos da Simulação ====================
  atualizarSelecaoAutomatica() {
    this.resetSimulacao();

    const prestacoesMap = this.prestacoesSimulacao();
    const prestacoesArray = Object.values(prestacoesMap).flat();
    const totalParcelasDisponiveis = prestacoesArray.length;

    const qtd = Number(this.numPrestacoes);
    if (!this.tipoSelecao || !qtd) {
      this.calcularValoresSimulacao([]);
      return;
    }

    // Valida se a quantidade inserida não ultrapassa as parcelas disponíveis
    if (qtd > totalParcelasDisponiveis) {
      this.showAlert(
        `O número de parcelas informadas (${qtd}) excede o total disponível (${totalParcelasDisponiveis}).`,
        'warning'
      );
      return;
    }

    let selecionadas: Prestacao[] = [];
    if (this.tipoSelecao === 'primeiras') {
      selecionadas = prestacoesArray.slice(0, qtd);
    } else if (this.tipoSelecao === 'ultimas') {
      selecionadas = prestacoesArray.slice(-qtd);
    }

    // Calcula o desconto com base na seleção
    let totalValor = selecionadas.reduce((total, p) => total + p.valor, 0);
    let totalDesconto = 0;

    if (this.tipoSelecao === 'primeiras') {
      totalDesconto = totalValor * 0.1; // 10% de desconto no total
    } else if (this.tipoSelecao === 'ultimas') {
      totalDesconto = totalValor * 0.2; // 20% de desconto no total
    }

    this.valorTotalSimulacao = totalValor - totalDesconto;
    this.totalDescontoSimulacao = totalDesconto;

    // Exibe mensagem se todas as parcelas em aberto forem selecionadas
    this.showQuitarContratoAlert = qtd === totalParcelasDisponiveis;
  }

  calcularValoresSimulacao(prestacoesArray: Prestacao[]) {
    this.valorTotalSimulacao = prestacoesArray.reduce(
      (total, p) => total + (p.valor - p.desconto),
      0
    );

    this.totalDescontoSimulacao = prestacoesArray.reduce(
      (total, p) => total + p.desconto,
      0
    );
  }

  resetSimulacao() {
    const novoMapaPrestacoes = { ...this.prestacoesSimulacao() };
    Object.values(novoMapaPrestacoes)
      .flat()
      .forEach((p) => {
        p.desconto = 0;
      });

    this.valorTotalSimulacao = 0;
    this.totalDescontoSimulacao = 0;
  }

  quitarContrato() {
    this.showQuitarContratoAlert = false;
    this.router.navigate(['/quitar-contrato']);
  }

  // ==================== Métodos da Tabela ====================
  atualizarPaginacaoTabela() {
    this.resetTabela();

    // Obtém apenas as prestações filtradas já com status "Em Aberto"
    const prestacoesArray = Object.values(this.prestacoesTabela()).flat();

    if (!prestacoesArray.length) {
      return;
    }

    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    this.prestacoesTabelaPagina = prestacoesArray.slice(inicio, fim);
  }

  verificarTodasSelecionadasTabela() {
    this.todasSelecionadasTabela = this.prestacoesTabelaPagina.every(
      (p) => p.selecionada
    );
  }

  get totalPaginasTabela(): number {
    const totalPrestacoes = Object.values(this.prestacoesTabela()).flat()
      .length;
    return Math.ceil(totalPrestacoes / this.itensPorPagina);
  }

  get hasSelectedTabela(): boolean {
    return Object.values(this.prestacoesTabela())
      .flat()
      .some((p) => p.selecionada);
  }

  toggleTabela() {
    this.tabelaAberta = !this.tabelaAberta;
  }

  resetTabela() {
    const novoMapaPrestacoes = { ...this.prestacoesTabela() };
    Object.values(novoMapaPrestacoes)
      .flat()
      .forEach((p) => {
        p.selecionada = false;
        p.desconto = 0;
      });

    this.todasSelecionadasTabela = false;
    this.valorTotalTabelaSemDesconto = 0;
    this.totalDescontoTabela = 0;
  }

  paginaAnterior() {
    if (this.paginaAtual > 1) {
      this.paginaAtual--;
      this.resetTabela();
      this.atualizarPaginacaoTabela();
    }
  }

  proximaPagina() {
    if (this.paginaAtual < this.totalPaginasTabela) {
      this.paginaAtual++;
      this.resetTabela();
      this.atualizarPaginacaoTabela();
    }
  }

  selecionarTodasTabela(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;

    if (!this.prestacoesTabelaPagina.length) return;

    this.calcularValoresTabela(checked);
    this.verificarTodasSelecionadasTabela(); // Atualiza a seleção geral
  }

  selecionarPrestacao(event: Event, prestacao: Prestacao) {
    const checked = (event.target as HTMLInputElement).checked;
    prestacao.selecionada = checked;
    this.calcularValoresPrestacoesUnitarias();
  }

  calcularValoresTabela(checked: any) {
    const prestacoesMap = this.prestacoesSimulacao();
    const prestacoesArray = Object.values(prestacoesMap).flat();
    const totalParcelasDisponiveis = prestacoesArray.length;
    const metadeParcelas = Math.floor(totalParcelasDisponiveis / 2); // arredonda pra baixo

    let totalValor = 0;
    let totalDesconto = 0;

    // Atualiza apenas as prestações visíveis na página atual
    this.prestacoesTabelaPagina.forEach((p) => {
      p.selecionada = checked;

      if (checked) {
        // Aplica desconto baseado na posição RELATIVA dentro das 10 parcelas visíveis
        if (p.numero < metadeParcelas) {
          p.desconto = p.valor * 0.1; // 10% de desconto na primeira metade
        } else {
          p.desconto = p.valor * 0.2; // 20% de desconto na segunda metade
        }

        totalValor += p.valor;
        totalDesconto += p.desconto;
      } else {
        p.desconto = 0; // Se desmarcado, remove o desconto
      }
    });

    
    // Atualiza os valores totais corretamente para a página atual
    this.valorTotalTabelaSemDesconto = totalValor;
    this.totalDescontoTabela = totalDesconto;
    this.valorTotalTabelaComDesconto = this.valorTotalTabelaSemDesconto - this.totalDescontoTabela;
  
  }

  calcularValoresPrestacoesUnitarias() {
    const prestacoesMap = this.prestacoesSimulacao();
    const prestacoesArray = Object.values(prestacoesMap).flat();
    const totalParcelasDisponiveis = prestacoesArray.length;
    const metadeParcelas = Math.floor(totalParcelasDisponiveis / 2);
  
    let totalValor = 0;
    let totalDesconto = 0;
  
    // Filtra apenas as prestações selecionadas
    this.prestacoesTabelaPagina.forEach((p) => {
      if (p.selecionada) {
        // Aplica desconto baseado na posição RELATIVA dentro do total de parcelas
        if (p.numero < metadeParcelas) {
          p.desconto = p.valor * 0.1; // 10% de desconto na primeira metade
        } else {
          p.desconto = p.valor * 0.2; // 20% de desconto na segunda metade
        }
  
        totalValor += p.valor;
        totalDesconto += p.desconto;
      } else {
        p.desconto = 0; // Se não estiver selecionada, zera o desconto
      }
    });
  
    // Atualiza os valores totais corretamente para a página atual
    this.valorTotalTabelaSemDesconto = totalValor;
    this.totalDescontoTabela = totalDesconto;
    this.valorTotalTabelaComDesconto = this.valorTotalTabelaSemDesconto - this.totalDescontoTabela;
  }
  
}
