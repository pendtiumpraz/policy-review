export type SectionStatus = 'comply' | 'partial' | 'non_comply' | 'missing';

export interface ReviewSection {
  sectionTitle: string;
  status: SectionStatus;
  score: number;
  gapDescription: string;
  recommendation: string;
  reference: string;
}

export interface PriorityAction {
  action: string;
  priority: 'high' | 'medium' | 'low';
  deadlineSuggestion: string;
}

export interface RegulationResult {
  regulationId: string;
  title: string;
  status: 'comply' | 'partial' | 'non_comply';
  score: number;
  findings: string;
}

export interface ReviewResult {
  overallScore: number;
  complianceLevel: 'compliant' | 'partial' | 'non_compliant';
  summary: string;
  strengths: string[];
  missingElements: string[];
  priorityActions: PriorityAction[];
  notApplicableDimensions: string[];
  regulationResults: RegulationResult[];
  sections: ReviewSection[];
}

export interface RegulationChecklistEntry {
  regulationId: string;
  items: { id: string; text: string }[];
  checked: string[]; // item ids
}
