import { auth } from './auth';
import {
  getExamById,
  getExamFileDownloadUrl,
  getExamFileViewerUrl,
  getExamPdfBlob,
} from './exam-details';
import { getAllExams } from './exams-list';
import { forgotPassword } from './forgot-password';
import { logout } from './logout';
import * as masterData from './master-data';
import * as appointment from './appointment';
import { getPatientByCpf, getPatientsList } from './patients-list';
import * as realtime from './realtime';
import { resetPassword } from './reset-password';
import * as tenant from './tenant';
import { update } from './update';
import { verifyToken } from './verify-token';

import { changePassword } from './change-password';

export const clientService = {
  auth,
  logout,
  forgotPassword,
  resetPassword,
  verifyToken,
  getAllExams,
  getPatientsList,
  getPatientByCpf,
  getExamById,
  getExamFileViewerUrl,
  getExamFileDownloadUrl,
  getExamPdfBlob,
  update,
  changePassword,
  tenant,
  realtime,
  masterData,
  appointment,
};
