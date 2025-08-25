import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterOutlet } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CartaoVacinacaoComponent } from './components/cartao-vacinacao/cartao-vacinacao';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    CartaoVacinacaoComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  titulo = 'Sistema de Cartão de Vacinação';
  activeTab = 'cartao';
  currentPath: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {
        this.currentPath = event.url;
      });
  }

  mostarTituloENavegacao() {
    return this.currentPath != '/login' && this.currentPath != '/criar-conta'
  }

  setActiveTab(tab: string) {
    this.activeTab = tab
    switch (tab) {
      case 'cartao':
        this.router.navigate(['/cartao-vacinacao']);
        break;
      case 'cadastro-pessoa':
        this.router.navigate(['/cadastro-pessoa']);
        break;
      case 'cadastro-vacina':
        this.router.navigate(['/cadastro-vacina']);
        break;
      case 'cadastro-vacinacao':
        this.router.navigate(['/cadastro-vacinacao']);
        break;
      case 'lista-pessoas':
        this.router.navigate(['/lista-pessoas']);
        break;
      default:
        this.router.navigate(['/cartao-vacinacao']);
    }
  }

  sair() {
    this.router.navigate(['/login'])
  }
}
