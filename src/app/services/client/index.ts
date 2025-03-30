import { auth } from './auth';
import { getAllExams } from './exams-list';
import { forgotPassword } from './forgot-password';
import { resetPassword } from './reset-password';
import { update } from './update';
import { verifyToken } from './verify-token';

export const clientService = {
  auth,
  forgotPassword,
  resetPassword,
  verifyToken,
  getAllExams,
  update,
};
