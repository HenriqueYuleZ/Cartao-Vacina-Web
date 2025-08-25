import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PessoaService } from '../../services/pessoa.service';
import { VacinacaoService } from '../../services/vacinacao.service';
import { Pessoa } from '../../models/pessoa.model';

@Component({
  selector: 'app-lista-pessoas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-pessoas.html',
})
export class ListaPessoasComponent implements OnInit {
  pessoas: Pessoa[] = [];
  mensagem: string = '';
  tipoMensagem: 'success' | 'error' = 'success';

  constructor(
    private pessoaService: PessoaService,
    private vacinacaoService: VacinacaoService
  ) {}

  ngOnInit() {
    this.carregarPessoas();
  }

  carregarPessoas() {
    this.pessoaService.getPessoas().subscribe(pessoas => {
      this.pessoas = pessoas;
    });
  }

  removerPessoa(pessoa: Pessoa) {
    if (confirm(`Tem certeza que deseja remover ${pessoa.nome}? Isso também removerá todas as vacinações desta pessoa.`)) {
      // Primeiro, remover as vacinações da pessoa
      this.vacinacaoService.excluirVacinacoesPorPessoa(pessoa.id).subscribe({
        next: () => {
          // Depois, remover a pessoa
          this.pessoaService.removerPessoa(pessoa.id).subscribe({
            next: (removido) => {
              if (removido) {
                this.mostrarMensagem('Pessoa removida com sucesso!', 'success');
              } else {
                this.mostrarMensagem('Erro ao remover pessoa', 'error');
              }
            },
            error: (error) => {
              this.mostrarMensagem('Erro ao remover pessoa: ' + error.message, 'error');
            }
          });
        },
        error: (error) => {
          this.mostrarMensagem('Erro ao remover vacinações: ' + error.message, 'error');
        }
      });
    }
  }

  private mostrarMensagem(mensagem: string, tipo: 'success' | 'error') {
    this.mensagem = mensagem;
    this.tipoMensagem = tipo;
    setTimeout(() => {
      this.mensagem = '';
    }, 3000);
  }
}
