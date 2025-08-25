import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators  } from '@angular/forms';
import { PessoaService } from '../../services/pessoa.service';

@Component({
  selector: 'app-cadastro-pessoa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cadastro-pessoa.html',
})
export class CadastroPessoaComponent {
  pessoaForm: FormGroup;

  constructor(private pessoaService: PessoaService, private fb: FormBuilder) {
    this.pessoaForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      documento: ['', [Validators.required]],
      sexo: ['', [Validators.required]],
      idade: [0, [Validators.required]]
    })
  }

  get nome() { return this.pessoaForm.get('nome'); }
  get documento() { return this.pessoaForm.get('documento'); }
  get sexo() { return this.pessoaForm.get('sexo'); }
  get idade() { return this.pessoaForm.get('idade'); }

  cadastrarPessoa() {
    if(this.pessoaForm.valid) {
      try {
        this.pessoaService.adicionarPessoa({
          nome: this.nome?.value.trim(),
          documento: this.documento?.value.trim(),
          sexo: this.sexo?.value.trim(),
          idade: this.idade?.value,
        });
        alert('Pessoa cadastrada com sucesso!');
        this.pessoaForm.reset();
      } catch (error: any) {
        alert(error.message || 'Erro ao cadastrar pessoa');
        Object.keys(this.pessoaForm.controls).forEach(key => {
          this.pessoaForm.get(key)?.markAsTouched();
        });
      }
    } else {
      alert('Preencha os campos obrigatórios')
    }
  }

}
