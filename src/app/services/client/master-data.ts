import { api } from '..';

export async function getExamTypes() {
  const { data } = await api.get('client/exam-types');
  return data.data;
}

export async function getAvailableExams() {
  const { data } = await api.get('client/available-exams');
  return data.data;
}

export async function getDepartments() {
  const { data } = await api.get('client/departments');
  return data.data;
}

export async function getPositions() {
  const { data } = await api.get('client/positions');
  return data.data;
}
