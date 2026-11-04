import assert from 'node:assert/strict';
import { test } from 'node:test';
import { InvalidResponseError, normalizeApplicationsResponse } from '../src/utils/normalizeApplicationsResponse.js';

const row = { applicationNumber: 'UNI-DEMO-0001', candidateName: 'Avery Demo 1', packageName: 'Standard Verification', status: 'SUBMITTED', submittedOn: '2026-10-01T00:00:00.000Z' };

test('normal payload is passed through', () => {
  const result = normalizeApplicationsResponse({ applications: [row], total: 47, page: 1, pageSize: 20, totalPages: 3 });
  assert.equal(result.total, 47);
  assert.equal(result.totalPages, 3);
  assert.equal(result.applications.length, 1);
});

test('applications: null is an invalid-response error, not an empty list', () => {
  assert.throws(() => normalizeApplicationsResponse({ applications: null, total: 47, page: 1, pageSize: 20, totalPages: 3 }), InvalidResponseError);
});

test('missing totalPages is derived from total and pageSize', () => {
  assert.equal(normalizeApplicationsResponse({ applications: [row], total: 47, page: 1, pageSize: 20 }).totalPages, 3);
  assert.equal(normalizeApplicationsResponse({ applications: [], total: 0, page: 1, pageSize: 20 }).totalPages, 0);
});

test('a short last page keeps the true total', () => {
  const rows = Array.from({ length: 7 }, () => row);
  const result = normalizeApplicationsResponse({ applications: rows, total: 47, page: 3, pageSize: 20, totalPages: 3 });
  assert.equal(result.applications.length, 7);
  assert.equal(result.total, 47);
});

test('non-object or missing total is rejected', () => {
  assert.throws(() => normalizeApplicationsResponse(null), InvalidResponseError);
  assert.throws(() => normalizeApplicationsResponse('oops'), InvalidResponseError);
  assert.throws(() => normalizeApplicationsResponse({ applications: [] }), InvalidResponseError);
});
