export interface Vacinacao {
  id: string;
  pessoaId: string;
  vacinaId: string;
  dose: number;
  dataAplicacao: Date;
  vacinaNome?: string;
  pessoaNome?: string;
}

