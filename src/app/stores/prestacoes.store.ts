import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

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

@Injectable({
  providedIn: 'root',
})
export class PrestacoesStore {
  private _prestacoes = signal<Record<number, Prestacao[]>>({});
  private _email = signal<string>('cliente@email.com');
  private _codigoBarras = signal<string>(this.gerarCodigoBarras());

  prestacoes = computed(() => this._prestacoes());
  email = computed(() => this._email());
  codigoBarras = computed(() => this._codigoBarras());

  constructor(private http: HttpClient) {
    this.carregarPrestacoes();
  }

  carregarPrestacoes() {
    const url = `${environment.apiBaseUrl}prestacoes.json`;  // Use a URL baseada no ambiente
  
    this.http.get<Record<number, Prestacao[]>>(url).subscribe(
      (data) => {
        const atualizadas = this.atualizarStatusInicial(data);
        this._prestacoes.set(atualizadas);
      },
      (error) => {
        console.error('Erro ao carregar JSON:', error);
        this._prestacoes.set({});
      }
    );
  }

  private atualizarStatusInicial(
    prestacoes: Record<number, Prestacao[]>
  ): Record<number, Prestacao[]> {
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();

    const atualizadas = Object.fromEntries(
      Object.entries(prestacoes).map(([ano, listaPrestacoes]) => {
        const anoNumerico = Number(ano);

        // Se o ano for anterior ao ano atual, mantém o estado original
        if (anoNumerico < anoAtual) {
          return [anoNumerico, listaPrestacoes];
        }

        // Para o ano atual e os posteriores, aplica as regras
        const ordenadas = listaPrestacoes.sort(
          (a, b) =>
            this._converterData(a.dataVencimento).getTime() -
            this._converterData(b.dataVencimento).getTime()
        );

        const anteriores = ordenadas.filter(
          (p) => this._converterData(p.dataVencimento) < hoje
        );
        const futuras = ordenadas.filter(
          (p) => this._converterData(p.dataVencimento) >= hoje
        );

        // Atualiza status para as prestações anteriores
        anteriores.forEach((p, index) => {
          if (index >= anteriores.length - 2) {
            p.status = 'Em Atraso';
          } else {
            p.status = 'Pago';
          }
        });

        // Atualiza status para as futuras
        futuras.forEach((p) => {
          p.status = 'Em Aberto';
        });

        return [anoNumerico, [...anteriores, ...futuras]];
      })
    );

    this._prestacoes.set({ ...atualizadas });

    return atualizadas;
  }

  private _converterData(data: string): Date {
    const [dia, mes, ano] = data.split('/').map(Number);
    return new Date(ano, mes - 1, dia);
  }

  getPrestacoesPorAno(ano: number): Prestacao[] {
    // Apenas retorna a lista atualizada sem revalidar o status
    return this.prestacoes()?.[ano] || [];
  }

  atualizarDataVencimento(ano: number, numero: number, novaData: string) {
    const atualizadas = { ...this._prestacoes() };

    if (atualizadas[ano]) {
      atualizadas[ano] = atualizadas[ano].map((prestacao) =>
        prestacao.numero === numero
          ? { ...prestacao, dataVencimento: novaData }
          : prestacao
      );

      this._prestacoes.set(this.atualizarStatusInicial(atualizadas));
    }
  }

  adicionarPrestacao(ano: number, novaPrestacao: Prestacao) {
    const atualizadas = { ...this._prestacoes() };
    atualizadas[ano] = atualizadas[ano]
      ? [...atualizadas[ano], novaPrestacao]
      : [novaPrestacao];

    this._prestacoes.set(this.atualizarStatusInicial(atualizadas));
  }

  atualizarEmail(novoEmail: string) {
    this._email.set(novoEmail);
  }

  atualizarCodigoBarras(novoCodigo: string) {
    this._codigoBarras.set(novoCodigo);
  }

  private gerarCodigoBarras(): string {
    return Array.from({ length: 48 }, () =>
      Math.floor(Math.random() * 10)
    ).join('');
  }
}
