import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators  } from '@angular/forms';
import { VacinacaoService } from '../../services/vacinacao.service';
import { PessoaService } from '../../services/pessoa.service';
import { VacinaService } from '../../services/vacina.service';
import { Pessoa } from '../../models/pessoa.model';
import { Vacina } from '../../models/vacina.model';

@Component({
  selector: 'app-cadastro-vacinacao',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cadastro-vacinacao.html',
})
export class CadastroVacinacaoComponent implements OnInit {
  vacinacaoForm: FormGroup;

  pessoas: Pessoa[] = [];
  vacinas: Vacina[] = [];

  mensagem: string = '';
  tipoMensagem: 'success' | 'error' = 'success';

  constructor(
    private vacinacaoService: VacinacaoService,
    private pessoaService: PessoaService,
    private vacinaService: VacinaService,
     private fb: FormBuilder
  ) {
    const hoje = new Date();
    this.vacinacaoForm = this.fb.group({
      pessoaId: ['', [Validators.required]],
      vacinaId: ['', [Validators.required]],
      dose: [1, [Validators.required, Validators.min(1)]],
      dataAplicacao: [hoje.toISOString().split('T')[0], [Validators.required]]
    })
  }

  get pessoaId() { return this.vacinacaoForm.get('pessoaId'); }
  get vacinaId() { return this.vacinacaoForm.get('vacinaId'); }
  get dose() { return this.vacinacaoForm.get('dose'); }
  get dataAplicacao() { return this.vacinacaoForm.get('dataAplicacao'); }

  ngOnInit() {
    this.carregarDados();
  }

  carregarDados() {
    this.pessoaService.getPessoas().subscribe(pessoas => {
      this.pessoas = pessoas;
    });

    this.vacinaService.getVacinas().subscribe(vacinas => {
      this.vacinas = vacinas;
    });
  }

  cadastrarVacinacao() {
    if (this.vacinacaoForm.valid) {
      this.vacinacaoService.adicionarVacinacao({
        pessoaId: this.pessoaId?.value,
        vacinaId: this.vacinaId?.value,
        dose: this.dose?.value,
        dataAplicacao: new Date(this.dataAplicacao?.value)
      }).subscribe({
        next: (vacinacao) => {
          alert('Vacinação registrada com sucesso!');
          this.vacinacaoForm.reset();
        },
        error: (error) => {
          alert(error.message || 'Erro ao registrar vacinação');
          Object.keys(this.vacinacaoForm.controls).forEach(key => {
            this.vacinacaoForm.get(key)?.markAsTouched();
          });
        }
      });
    } else {
      alert('Preencha os campos obrigatórios')
    }
  }
}
