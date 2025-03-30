import { api } from '..';

type PatientAuthProps = {
  cpf: string;
  date_of_birth: string;
};

type PatientAuthResponseProps = {
  id: number;
  name: string;
  email: string;
  email_verified_at: Date;
  api_token: string;
};

export async function auth(
  params: PatientAuthProps,
): Promise<PatientAuthResponseProps | null> {
  const controller = new AbortController();
  const { signal } = controller;

  const { data } = await api.post<PatientAuthResponseProps>(
    '/auth-patient',
    params,
    {
      signal,
    },
  );

  return data;
}
