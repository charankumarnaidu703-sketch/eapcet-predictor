export interface CounsellingEvent {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string
  state: 'AP' | 'Telangana' | 'Both';
  category: string;
  isImportant: boolean;
}

// Ensure the dates are somewhat in the future so the countdown works,
// but some can be in the past to test the "PASSED" badge logic.
export const counsellingDates: CounsellingEvent[] = [
  {
    id: 'ts-phase1-cert',
    title: 'TS Phase 1 Certificate Verification',
    description: 'Document verification for Telangana Phase 1 candidates.',
    date: '2025-07-05T09:00:00Z',
    state: 'Telangana',
    category: 'Verification',
    isImportant: true
  },
  {
    id: 'ap-phase1-cert',
    title: 'AP Phase 1 Certificate Verification',
    description: 'Document verification for AP Phase 1 candidates.',
    date: '2025-07-10T09:00:00Z',
    state: 'AP',
    category: 'Verification',
    isImportant: true
  },
  {
    id: 'ts-web-opts-open',
    title: 'TS Web Options Entry Opens',
    description: 'Students can start entering their college preferences.',
    date: '2025-07-08T10:00:00Z',
    state: 'Telangana',
    category: 'Web Options',
    isImportant: false
  },
  {
    id: 'ap-web-opts-open',
    title: 'AP Web Options Entry Opens',
    description: 'Students can start entering their college preferences.',
    date: '2025-07-12T10:00:00Z',
    state: 'AP',
    category: 'Web Options',
    isImportant: false
  },
  {
    id: 'ts-web-opts-close',
    title: 'TS Web Options Closes',
    description: 'Last date to enter and freeze web options.',
    date: '2025-07-15T18:00:00Z',
    state: 'Telangana',
    category: 'Web Options',
    isImportant: true
  },
  {
    id: 'ap-web-opts-close',
    title: 'AP Web Options Closes',
    description: 'Last date to enter and freeze web options.',
    date: '2025-07-18T18:00:00Z',
    state: 'AP',
    category: 'Web Options',
    isImportant: true
  },
  {
    id: 'ts-round1-allot',
    title: 'TS Round 1 Allotment',
    description: 'First phase seat allotment results declared.',
    date: '2025-07-19T14:00:00Z',
    state: 'Telangana',
    category: 'Allotment',
    isImportant: true
  },
  {
    id: 'ap-round1-allot',
    title: 'AP Round 1 Allotment',
    description: 'First phase seat allotment results declared.',
    date: '2025-07-22T14:00:00Z',
    state: 'AP',
    category: 'Allotment',
    isImportant: true
  },
  {
    id: 'ts-reporting-freeze',
    title: 'TS Reporting & Freezing Deadline',
    description: 'Deadline to report to college or freeze the allotted seat.',
    date: '2025-07-24T17:00:00Z',
    state: 'Telangana',
    category: 'Reporting',
    isImportant: true
  },
  {
    id: 'ap-reporting-freeze',
    title: 'AP Reporting & Freezing Deadline',
    description: 'Deadline to report to college or freeze the allotted seat.',
    date: '2025-07-27T17:00:00Z',
    state: 'AP',
    category: 'Reporting',
    isImportant: true
  },
  {
    id: 'ts-round2-allot',
    title: 'TS Round 2 Allotment',
    description: 'Second phase seat allotment results declared.',
    date: '2025-08-05T14:00:00Z',
    state: 'Telangana',
    category: 'Allotment',
    isImportant: true
  },
  {
    id: 'ap-round2-allot',
    title: 'AP Round 2 Allotment',
    description: 'Second phase seat allotment results declared.',
    date: '2025-08-10T14:00:00Z',
    state: 'AP',
    category: 'Allotment',
    isImportant: true
  }
];
