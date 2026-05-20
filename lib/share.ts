export function shareToWhatsApp(text: string): void {
  const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  if (isMobile) {
    window.open(`whatsapp://send?text=${encodeURIComponent(text)}`);
  } else {
    window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(text)}`);
  }
}

export function generatePredictionShareText(topResult: any, rank: number | string, siteUrl: string): string {
  return `My EAPCET rank ${rank.toLocaleString('en-IN')} got predicted for:
${topResult.college_name} - ${topResult.branch}
Admission chances: ${topResult.probability}
Annual fee: ${topResult.annual_fees}
Placement rating: ${topResult.placement_rating || 'N/A'}/5

Check YOUR college prediction free at ${siteUrl}

#EAPCET2025 #EAMCET2025`;
}

export function generateCollegeShareText(collegeName: string, location: string, siteUrl: string): string {
  return `Check out ${collegeName} in ${location}.

See EAPCET 2025 cutoffs, fee structures, and placement details for this college here:
${siteUrl}/college/${encodeURIComponent(collegeName)}

#EAPCET2025 #EngineeringColleges`;
}

export function generateComparisonShareText(colleges: string[], siteUrl: string): string {
  return `I'm comparing these colleges for EAPCET 2025:
${colleges.map(c => `• ${c}`).join('\n')}

Which one is better? See the side-by-side comparison here:
${siteUrl}/compare?colleges=${colleges.map(encodeURIComponent).join(',')}

#EAPCET2025 #CollegePredictor`;
}
