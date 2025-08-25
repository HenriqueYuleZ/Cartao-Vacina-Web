import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login'
import { CadastroPessoaComponent } from './components/cadastro-pessoa/cadastro-pessoa';
import { CadastroVacinaComponent } from './components/cadastro-vacina/cadastro-vacina';
import { CadastroVacinacaoComponent } from './components/cadastro-vacinacao/cadastro-vacinacao';
import { CartaoVacinacaoComponent } from './components/cartao-vacinacao/cartao-vacinacao';
import { ListaPessoasComponent } from './components/lista-pessoas/lista-pessoas';
import { CriarContaComponent } from './components/criar-conta/criar-conta';
export const routes: Routes = [
  {
    title: 'login',
    path: 'login',
    component: LoginComponent
  },
  {
    title: 'cadastro-pessoa',
    path: 'cadastro-pessoa',
    component: CadastroPessoaComponent
  },
  {
    title: 'cadastro-vacina',
    path: 'cadastro-vacina',
    component: CadastroVacinaComponent
  },
  {
    title: 'cadastro-vacinacao',
    path: 'cadastro-vacinacao',
    component: CadastroVacinacaoComponent
  },
  {
    title: 'cartao-vacinacao',
    path: 'cartao-vacinacao',
    component: CartaoVacinacaoComponent
  },
  {
    title: 'lista-pessoas',
    path: 'lista-pessoas',
    component: ListaPessoasComponent
  },
  {
    title: 'criar-conta',
    path: 'criar-conta',
    component: CriarContaComponent
  }
];
