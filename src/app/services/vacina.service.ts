import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Vacina } from '../models/vacina.model';

@Injectable({
  providedIn: 'root'
})
export class VacinaService {
  private vacinas: Vacina[] = [
    { id: '1', nome: 'BCG' },
    { id: '2', nome: 'Hepatite B' },
    { id: '3', nome: 'Anti-Polio (VIP)' },
    { id: '4', nome: 'Tríplice Bacteriana (DTP)' },
    { id: '5', nome: 'Haemophilus Influenzae' },
    { id: '6', nome: 'Tríplice Acelular' },
    { id: '7', nome: 'Pneumo 10 Valente' },
    { id: '8', nome: 'Meningocócica C' },
    { id: '9', nome: 'Rotavírus' }
  ];

  private vacinasSubject = new BehaviorSubject<Vacina[]>(this.vacinas);

  constructor() { }

  getVacinas(): Observable<Vacina[]> {
    return this.vacinasSubject.asObservable();
  }

  getVacinaById(id: string): Vacina | undefined {
    return this.vacinas.find(vacina => vacina.id === id);
  }

  adicionarVacina(vacina: Omit<Vacina, 'id'>): Vacina {
    const novaVacina: Vacina = {
      ...vacina,
      id: this.generateId()
    };
    this.vacinas.push(novaVacina);
    this.vacinasSubject.next([...this.vacinas]);
    return novaVacina;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

