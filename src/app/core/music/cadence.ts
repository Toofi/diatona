export interface CadenceDef {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  /** Zero-based degrees of the progression. */
  readonly degrees: readonly number[];
}

export const CADENCES: readonly CadenceDef[] = [
  { id: 'perfect', label: 'Cadence parfaite', description: 'V → I · la résolution la plus forte', degrees: [4, 0] },
  { id: 'plagal', label: 'Cadence plagale', description: "IV → I · l'« amen », plus douce", degrees: [3, 0] },
  { id: 'deceptive', label: 'Cadence rompue', description: 'V → VI · la résolution surprise', degrees: [4, 5] },
  { id: 'half', label: 'Demi-cadence', description: 'II → V · suspension sur la dominante', degrees: [1, 4] },
  { id: 'two-five-one', label: 'II – V – I', description: 'Le tour jazz par excellence', degrees: [1, 4, 0] },
  { id: 'pop', label: 'I – V – VI – IV', description: 'La boucle pop universelle', degrees: [0, 4, 5, 3] },
  { id: 'pop-minor', label: 'VI – IV – I – V', description: 'Variante mélancolique de la boucle pop', degrees: [5, 3, 0, 4] },
  { id: 'anatole', label: 'Anatole I – VI – II – V', description: 'Turnaround classique', degrees: [0, 5, 1, 4] },
];
