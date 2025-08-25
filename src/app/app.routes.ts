import { Routes } from '@angular/router';
import { CadastroPessoaComponent } from './components/cadastro-pessoa/cadastro-pessoa';
import { CadastroVacinaComponent } from './components/cadastro-vacina/cadastro-vacina';

export const routes: Routes = [

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
];
