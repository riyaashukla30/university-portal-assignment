export const applications = Array.from({ length: 47 }, (_, index) => ({
  applicationNumber: `UNI-DEMO-${String(index + 1).padStart(4, '0')}`,
  candidateName: `${['Avery', 'Morgan', 'Taylor', 'Jordan', 'Casey'][index % 5]} Demo ${index + 1}`,
  packageName: index % 2 ? 'Education Verification' : 'Standard Verification',
  status: ['SUBMITTED', 'IN_PROGRESS', 'COMPLETED'][index % 3],
  submittedOn: new Date(Date.UTC(2026, 9, 1 + index)).toISOString(),
}));

export const cartCases = [
  { individual_service_id: 201, candidate_name: 'Avery Demo', case_status: 'DRAFT', created_on: '2026-10-10T10:00:00Z', checks: [{ id: 1, name: 'Education', status: 'Pending' }, { id: 2, name: 'Employment', status: 'Pending' }] },
  { individual_service_id: 202, candidate_name: 'Morgan Demo', case_status: 'DRAFT', created_on: '2026-10-12T10:00:00Z', checks: [{ id: 3, name: 'Education', status: 'Pending' }] },
];

export const orders = cartCases.map((item, index) => ({ ...item, case_status: index ? 'COMPLETED' : 'IN_PROGRESS' }));
