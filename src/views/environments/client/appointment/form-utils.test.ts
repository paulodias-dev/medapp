import { describe, expect, it } from 'vitest';
import { ClientPatientListItem } from '@/app/models';
import {
  AppointmentEmployeeForm,
  canSubmitAppointmentReview,
  cpfMask,
  isValidCpf,
  mapPatientAutofill,
  toInputDate,
  validateEmployee,
} from './form-utils';

function makeEmployee(overrides: Partial<AppointmentEmployeeForm> = {}): AppointmentEmployeeForm {
  return {
    name: 'Paulo Roberto',
    cpf: '111.444.777-35',
    rg: '12.345.678-9',
    birthDate: '1990-06-15',
    gender: 'Masculino',
    maritalStatus: 'Casado(a)',
    position_id: 2,
    department_id: 3,
    email: 'paulo@empresa.com',
    phone: '(82) 99999-1111',
    altPhone: '(82) 98888-2222',
    ...overrides,
  };
}

function makePatient(overrides: Partial<ClientPatientListItem> = {}): ClientPatientListItem {
  return {
    id: 11,
    name: 'Maria Souza',
    cpf: '52998224725',
    rg: '1234567',
    date_of_birth: '1988-02-20',
    marital_status: 'solteira',
    gender: 'f',
    email: 'maria@empresa.com',
    phone1: '82999990000',
    phone2: '82977776666',
    active: true,
    created_at: '2026-03-01 10:00:00',
    updated_at: '2026-03-10 10:00:00',
    ...overrides,
  };
}

describe('appointment form utils', () => {
  it('validates CPF check digits correctly', () => {
    expect(isValidCpf('111.444.777-35')).toBe(true);
    expect(isValidCpf('11144477735')).toBe(true);
    expect(isValidCpf('111.111.111-11')).toBe(false);
    expect(isValidCpf('123.456.789-00')).toBe(false);
  });

  it('applies CPF mask as user types', () => {
    expect(cpfMask('11144477735')).toBe('111.444.777-35');
    expect(cpfMask('111444')).toBe('111.444');
  });

  it('normalizes multiple date formats to input date format', () => {
    expect(toInputDate('2024-12-31')).toBe('2024-12-31');
    expect(toInputDate('31/12/2024')).toBe('2024-12-31');
    expect(toInputDate('')).toBe('');
  });

  it('returns no validation errors for a valid employee form', () => {
    const errors = validateEmployee(makeEmployee());
    expect(errors).toEqual({});
  });

  it('returns validation errors for invalid fields', () => {
    const errors = validateEmployee(
      makeEmployee({
        name: 'Pa',
        cpf: '123.456.789-00',
        rg: '123',
        birthDate: '2999-01-01',
        gender: '',
        maritalStatus: '',
        position_id: null,
        department_id: null,
        email: 'invalid-email',
        phone: '12345',
        altPhone: '12345',
      }),
    );

    expect(errors.name).toBeDefined();
    expect(errors.cpf).toBeDefined();
    expect(errors.rg).toBeDefined();
    expect(errors.birthDate).toBeDefined();
    expect(errors.gender).toBeDefined();
    expect(errors.maritalStatus).toBeDefined();
    expect(errors.position_id).toBeDefined();
    expect(errors.department_id).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(errors.phone).toBeDefined();
    expect(errors.altPhone).toBeDefined();
  });

  it('maps patient data into employee form for autofill', () => {
    const currentEmployee = makeEmployee({
      name: 'Nome Inicial',
      cpf: '111.444.777-35',
      rg: '99.999.999-9',
      birthDate: '',
      gender: '',
      maritalStatus: '',
      email: '',
      phone: '',
      altPhone: '',
    });

    const mapped = mapPatientAutofill(currentEmployee, makePatient());

    expect(mapped.name).toBe('Maria Souza');
    expect(mapped.cpf).toBe('529.982.247-25');
    expect(mapped.birthDate).toBe('1988-02-20');
    expect(mapped.gender).toBe('Feminino');
    expect(mapped.maritalStatus).toBe('Solteiro(a)');
    expect(mapped.email).toBe('maria@empresa.com');
    expect(mapped.phone).toBe('(82) 99999-0000');
    expect(mapped.altPhone).toBe('(82) 97777-6666');
  });

  it('keeps current values when patient has nullable fields', () => {
    const currentEmployee = makeEmployee({
      phone: '(82) 91111-1111',
      altPhone: '(82) 92222-2222',
      email: 'atual@empresa.com',
    });

    const mapped = mapPatientAutofill(
      currentEmployee,
      makePatient({
        email: null,
        phone1: null,
        phone2: null,
        rg: null,
      }),
    );

    expect(mapped.email).toBe('atual@empresa.com');
    expect(mapped.phone).toBe('(82) 91111-1111');
    expect(mapped.altPhone).toBe('(82) 92222-2222');
    expect(mapped.rg).toBe('12.345.678-9');
  });

  it('enforces review confirmation rule before submit', () => {
    expect(canSubmitAppointmentReview([], true, false)).toBe(false);
    expect(canSubmitAppointmentReview(['1'], false, false)).toBe(false);
    expect(canSubmitAppointmentReview(['1'], true, true)).toBe(false);
    expect(canSubmitAppointmentReview(['1'], true, false)).toBe(true);
  });
});

