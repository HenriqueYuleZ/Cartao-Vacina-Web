import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VacinacaoService } from '../../services/vacinacao.service';
import { PessoaService } from '../../services/pessoa.service';
import { Pessoa } from '../../models/pessoa.model';
import { Vacinacao } from '../../models/vacinacao.model';

@Component({
  selector: 'app-cartao-vacinacao',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cartao-vacinacao.html',
})
export class CartaoVacinacaoComponent implements OnInit {
  pessoaId: string = '';
  pessoas: Pessoa[] = [];
  vacinacoes: Vacinacao[] = [];
  pessoaSelecionada: Pessoa | null = null;
  mensagem: string = '';
  tipoMensagem: 'success' | 'error' = 'success';

  constructor(
    private vacinacaoService: VacinacaoService,
    private pessoaService: PessoaService
  ) {}

  ngOnInit() {
    this.carregarPessoas();
  }

  carregarPessoas() {
    this.pessoaService.getPessoas().subscribe(pessoas => {
      this.pessoas = pessoas;
    });
  }

  consultarCartao() {
    if (!this.pessoaId) {
      this.mostrarMensagem('Por favor, selecione uma pessoa', 'error');
      return;
    }

    this.pessoaSelecionada = this.pessoas.find(p => p.id === this.pessoaId) || null;
    
    this.vacinacaoService.getVacinacoesByPessoa(this.pessoaId).subscribe({
      next: (vacinacoes) => {
        this.vacinacoes = vacinacoes;
        if (this.vacinacoes.length === 0) {
          this.mostrarMensagem('Nenhuma vacinação encontrada para esta pessoa', 'error');
        }
      },
      error: (error) => {
        this.mostrarMensagem('Erro ao carregar vacinações: ' + error.message, 'error');
        this.vacinacoes = [];
      }
    });
  }

  excluirVacinacao(vacinacao: Vacinacao) {
    if (confirm(`Tem certeza que deseja excluir o registro da vacina ${vacinacao.vacinaNome} - Dose ${vacinacao.dose}?`)) {
      try {
        const excluido = this.vacinacaoService.excluirVacinacao(vacinacao.id);

        if (excluido) {
          this.mostrarMensagem('Registro de vacinação excluído com sucesso!', 'success');
          this.consultarCartao();
        } else {
          this.mostrarMensagem('Erro ao excluir registro de vacinação', 'error');
        }
      } catch (error) {
        this.mostrarMensagem('Erro ao excluir registro de vacinação', 'error');
      }
    }
  }

  formatarData(data: Date): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  private mostrarMensagem(mensagem: string, tipo: 'success' | 'error') {
    this.mensagem = mensagem;
    this.tipoMensagem = tipo;
    setTimeout(() => {
      this.mensagem = '';
    }, 3000);
  }
}
