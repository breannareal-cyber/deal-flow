export type ETACaseData = {
  company: string;          // case presentation — plain text, \n\n = paragraph break
  expertAnswer: string;     // full expert analysis, same format
  teachingConcepts: string[];
  keyRedFlags: string[];
  keyGreenFlags: string[];
};

export type ETACase = {
  id: number;
  caseNumber: number;
  title: string;
  industry: string;
  difficulty: number;
  source: string;
  listingId: string | null;
  data: ETACaseData;
};
