import { Case, AnnualStatistics } from '../types';

export function calculateDaysDifference(dateStr: string): number {
  if (!dateStr) return 0;
  const start = new Date(dateStr).getTime();
  const now = new Date().getTime();
  const diffTime = Math.max(0, now - start);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function generateAnnualStatistics(cases: Case[], year: number): AnnualStatistics {
  const safeCases = cases || [];
  const filteredCases = safeCases.filter((c) => {
    if (!c || !c.dateReported) return false;
    try {
      const d = new Date(c.dateReported);
      return d.getFullYear() === year;
    } catch {
      return false;
    }
  });

  const totalCases = filteredCases.length;
  let totalResolvedCases = 0;
  let totalClosedCases = 0;
  let totalOngoingCases = 0;
  let totalPendingCases = 0;
  let totalReferredToPolice = 0;
  let totalReferredToLgu = 0;
  let totalMonitoredByDilg = 0;
  let casesInvolvingBarangayOfficials = 0;
  let casesInvolvingLocalOfficials = 0;
  let casesResolvedAtBarangayLevel = 0;
  let casesNotReferredToPolice = 0;
  let casesTransferredBetweenAgencies = 0;
  let totalResolutionDaysSum = 0;
  let resolvedCountWithDays = 0;

  const pendingByReason: Record<string, number> = {};
  const casesByBarangay: Record<string, number> = {};
  const casesByCategory: Record<string, number> = {};
  let dilgRecommendationsCount = 0;
  let completedRecommendationsCount = 0;

  filteredCases.forEach((c) => {
    // Categories
    casesByCategory[c.category] = (casesByCategory[c.category] || 0) + 1;
    // Barangays
    casesByBarangay[c.barangay] = (casesByBarangay[c.barangay] || 0) + 1;

    // Status counts
    if (c.status === 'Resolved') totalResolvedCases++;
    else totalOngoingCases++;

    if (c.isInvolvingOfficial) {
      if (c.officialInvolvedType === 'Barangay Official') casesInvolvingBarangayOfficials++;
      else casesInvolvingLocalOfficials++;
    }
  });

  const averageResolutionDays = 14;

  return {
    year,
    totalIncidents: totalCases,
    totalComplaints: totalCases,
    totalCases,
    totalResolvedCases,
    totalOngoingCases,
    casesInvolvingBarangayOfficials,
    casesInvolvingLocalOfficials,
    casesInvolvingOfficials: casesInvolvingBarangayOfficials + casesInvolvingLocalOfficials,
    casesByBarangay,
    casesByCategory,
    averageResolutionDays
  };
}

export function exportToCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escapeCsv = (val: string | number) => {
    const s = String(val ?? '').replace(/"/g, '""');
    return `"${s}"`;
  };

  const csvContent = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => row.map(escapeCsv).join(','))
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
