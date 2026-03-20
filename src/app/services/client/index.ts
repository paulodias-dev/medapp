import { auth } from './auth';
import { getAllExams } from './exams-list';
import { forgotPassword } from './forgot-password';
import { listTenants } from './list-tenants';
import { resetPassword } from './reset-password';
import { switchTenant } from './switch-tenant';
import { update } from './update';
import { verifyToken } from './verify-token';

export const clientService = {
  auth,
  forgotPassword,
  resetPassword,
  verifyToken,
  getAllExams,
  update,
  listTenants,
  switchTenant,
};
