import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
export class PdfGeneratorService {
  constructor() {}

  private formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  }

  gerarBoletoFake(
    dataVencimento: string,
    parcela: string,
    valor: number,
    juros: number = 0,
    multa: number = 0,
    desconto: number = 0,
    quitar?: any
  ) {
    const totalPagar = valor + juros + multa - desconto;
    const doc = new jsPDF();

    // Cabeçalho do boleto
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('BANCO FINANCIADOR XYZ', 20, 15);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Rua Exemplo, 123 - Centro - São Paulo/SP', 20, 22);
    doc.text('CNPJ: 00.000.000/0001-00', 20, 28);

    // Linha digitável do boleto
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    const codigoBarras = this.gerarCodigoBarrasDinamico();
    doc.text(codigoBarras, 20, 38);

    // Beneficiário e Pagador
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Beneficiário:', 20, 48);
    doc.text('Banco Financiador XYZ', 20, 54);
    doc.text('Pagador:', 20, 64);
    doc.text('Cliente Exemplo', 20, 70);
    doc.text('CPF/CNPJ: 123.456.789-00', 20, 76);

    // Informações do boleto
    doc.text(`Data de Vencimento: ${dataVencimento}`, 140, 48);
    doc.text(
      `Nosso Número: ${Math.floor(Math.random() * 1000000000)}`,
      140,
      54
    );
    doc.text(`Valor do Documento: ${this.formatarMoeda(valor)}`, 140, 60);
    doc.text(`Juros: ${this.formatarMoeda(juros)}`, 140, 66);
    doc.text(`Multa: ${this.formatarMoeda(multa)}`, 140, 72);
    doc.text(`Desconto: ${this.formatarMoeda(desconto)}`, 140, 78);
    doc.text(`Total a Pagar: ${this.formatarMoeda(totalPagar)}`, 140, 84);

    let desc;
    if (quitar) {
      desc = 'Valor total do contrato';
    } else {
      `Parcela ${parcela}`;
    }
    // Tabela de Detalhes do Pagamento
    autoTable(doc, {
      startY: 95,
      head: [['Descrição', 'Valor']],
      body: [
        [`${desc}`, this.formatarMoeda(valor)],
        ['Juros', this.formatarMoeda(juros)],
        ['Multa', this.formatarMoeda(multa)],
        ['Desconto', this.formatarMoeda(desconto)],
        ['Total a Pagar', this.formatarMoeda(totalPagar)],
      ],
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      bodyStyles: { textColor: [0, 0, 0] },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 50, halign: 'right' },
      },
    });

    // Simulação de código de barras
    this.gerarCodigoBarras(doc, 20, 160, codigoBarras);

    doc.setFontSize(9);
    doc.setTextColor(200, 0, 0);
    doc.text('ESTE É UM BOLETO FICTÍCIO PARA FINS DE DEMONSTRAÇÃO', 20, 180);
    doc.setTextColor(0, 0, 0);
    doc.text(
      'Não possui valor real e não pode ser utilizado para pagamentos.',
      20,
      186
    );

    // Salva o PDF com nome contendo a data
    doc.save(`boleto_financiamento_${dataVencimento.replace(/\//g, '_')}.pdf`);
  }

  private gerarCodigoBarrasDinamico(): string {
    return `${this.randomDigits(5)}.${this.randomDigits(5)} ${this.randomDigits(
      5
    )}.${this.randomDigits(5)} ${this.randomDigits(5)}.${this.randomDigits(
      5
    )} ${Math.floor(Math.random() * 9)} ${this.randomDigits(14)}`;
  }

  private randomDigits(length: number): string {
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join(
      ''
    );
  }

  private gerarCodigoBarras(doc: jsPDF, x: number, y: number, codigo: string) {
    doc.setFont('courier', 'bold');
    doc.setFontSize(14);
    doc.text(codigo, x, y);

    // Simulação de barras usando retângulos
    let barraX = x;
    for (let i = 0; i < codigo.length; i++) {
      if (codigo[i] !== ' ') {
        const largura = Math.random() > 0.5 ? 2 : 1;
        doc.rect(barraX, y + 5, largura, 10, 'F');
      }
      barraX += 3;
    }
  }

  public gerarDemonstrativoParcelas() {
    const doc = new jsPDF();

    // Cabeçalho
    doc.setFontSize(16);
    doc.text('Demonstrativo de Parcelas - Financiamento de Automóvel', 14, 20);
    doc.setFontSize(10);
    doc.text('Contrato nº: 123456789', 14, 30);
    doc.text(`Data: ${new Date().toLocaleDateString()}`, 14, 36);

    // Gerar Parcelas Simuladas
    const parcelas = [];
    const totalParcelas = 52;
    const valorParcela = 1450;
    const jurosAtraso = 0.02;
    const dataInicio = new Date();
    dataInicio.setMonth(dataInicio.getMonth() - 3); // 3 meses atrás

    for (let i = 1; i <= totalParcelas; i++) {
      const dataVencimento = new Date(dataInicio);
      dataVencimento.setMonth(dataInicio.getMonth() + i);
      let status = 'Em Aberto';
      let dataPagamento = dataVencimento.toLocaleDateString();
      let valorComJuros = this.formatarMoeda(valorParcela);

      if (i <= 3) {
        status = 'Liquidada';
      } else if (i > 3 && i <= 6) {
        status = 'Em Atraso';
        const atraso = 15 * (i - 3);
        valorComJuros = (valorParcela * (1 + jurosAtraso)).toFixed(2);
        dataPagamento = `Atraso: ${atraso} dias`;
      }

      parcelas.push([
        i,
        dataVencimento.toLocaleDateString(),
        `${this.formatarMoeda(valorParcela)}`,
        `${valorComJuros}`,
        status,
        dataPagamento,
      ]);
    }

    // Tabela de Parcelas
    autoTable(doc, {
      head: [
        ['Parcela', 'Vencimento', 'Valor', 'Com Juros', 'Status', 'Pagamento'],
      ],
      body: parcelas,
      startY: 45,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: {
        fillColor: [100, 100, 100],
        textColor: 255,
        fontSize: 9,
        halign: 'center',
      },
      columnStyles: {
        0: { halign: 'center' },
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'center' },
        5: { halign: 'center' },
      },
    });

    // Rodapé
    doc.setFontSize(9);
    doc.text(
      `Total de Parcelas: ${totalParcelas}`,
      14,
      doc.internal.pageSize.height - 15
    );
    doc.text(
      'Este documento é gerado automaticamente para fins demonstrativos.',
      14,
      doc.internal.pageSize.height - 10
    );

    // Baixar PDF
    doc.save('demonstrativo-parcelas.pdf');
  }

  public gerarComprovante = (valorPago: number, dataVencimento: string) => {
    const doc = new jsPDF();

    // Configurações gerais
    doc.setFontSize(16);
    doc.text('COMPROVANTE DE PAGAMENTO', 70, 20);

    // Dados do pagador
    doc.setFontSize(12);
    doc.text('Pagador:', 20, 40);
    doc.text('Aline Nink', 50, 40);

    // Dados do pagamento
    doc.text('Valor Pago:', 20, 50);
    doc.text(`R$ ${valorPago.toFixed(2)}`, 50, 50);

    doc.text('Data de Vencimento:', 20, 60);
    doc.text(dataVencimento, 60, 60);

    doc.text('Data de Pagamento:', 20, 70);
    doc.text(dataVencimento, 60, 70);

    doc.text('Forma de Pagamento:', 20, 80);
    doc.text('Boleto', 70, 80);

    // Código da transação
    doc.text('Código da Transação:', 20, 90);
    doc.text('1234567890ABCDEF', 70, 90);

    // Salvar PDF
    doc.save('comprovante_pagamento.pdf');
  };

  gerarBoletoComPrestacoes(prestacoes: Prestacao[]): void {
    const doc = new jsPDF();
  
    // Cabeçalho do boleto
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('BANCO FINANCIADOR XYZ', 20, 15);
  
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Rua Exemplo, 123 - Centro - São Paulo/SP', 20, 22);
    doc.text('CNPJ: 00.000.000/0001-00', 20, 28);
  
    // Linha digitável do boleto
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    const codigoBarras = this.gerarCodigoBarrasDinamico();
    doc.text(codigoBarras, 20, 38);
  
    // Beneficiário e Pagador
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Beneficiário:', 20, 48);
    doc.text('Banco Financiador XYZ', 20, 54);
    doc.text('Pagador:', 20, 64);
    doc.text('Cliente Exemplo', 20, 70);
    doc.text('CPF/CNPJ: 123.456.789-00', 20, 76);
    doc.text(`Nosso Número: ${Math.floor(Math.random() * 1000000000)}`, 140, 54);
  
    // Espaço para a tabela de prestações (posicionada abaixo das informações do boleto)
    const tableStartY = 90;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Nº', 15, tableStartY);
    doc.text('Parcela', 35, tableStartY);
    doc.text('Vencimento', 65, tableStartY);
    doc.text('Valor', 120, tableStartY);
  
    // Variável para controlar a posição vertical dos itens da tabela e acumular o total
    let y = tableStartY + 10;
    let total = 0;
    doc.setFont('helvetica', 'normal');
  
    // Listando cada prestação selecionada
    prestacoes.forEach((prestacao) => {
      doc.text(`${prestacao.numero}`, 15, y);
      doc.text(`${prestacao.parcela}`, 35, y);
      doc.text(`${prestacao.dataVencimento}`, 65, y);
      doc.text(`R$ ${prestacao.valor.toFixed(2)}`, 120, y);
      total += prestacao.valor;
      y += 10; // Avança 10 unidades para a próxima linha
    });
  
    // Exibe o valor total a ser quitado
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`Total a Pagar: R$ ${total.toFixed(2)}`, 15, y);
  
    // Linha separadora abaixo do total
    doc.setLineWidth(0.5);
    doc.line(15, y + 2, 195, y + 2);
  
    // Simulação de código de barras, posicionado abaixo do total
    const barcodeY = y + 10;
    this.gerarCodigoBarras(doc, 20, barcodeY, codigoBarras);
  
    // Rodapé com disclaimer
    doc.setFontSize(9);
    doc.setTextColor(200, 0, 0);
    doc.text('ESTE É UM BOLETO FICTÍCIO PARA FINS DE DEMONSTRAÇÃO', 20, barcodeY + 20);
    doc.setTextColor(0, 0, 0);
    doc.text('Não possui valor real e não pode ser utilizado para pagamentos.', 20, barcodeY + 26);
  
    // Salva o PDF
    doc.save('boleto_renegociacao.pdf');
  }
  
}
