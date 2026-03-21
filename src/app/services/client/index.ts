import { auth } from './auth';
import {
  cancelExamRequest,
  getExamById,
  getExamFileDownloadUrl,
  getExamFileViewerUrl,
  getExamPdfBlob,
  rescheduleExamRequest,
} from './exam-details';
import { getAppointmentSettings } from './appointment-settings';
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
  cancelExamRequest,
  rescheduleExamRequest,
  getExamFileViewerUrl,
  getExamFileDownloadUrl,
  getExamPdfBlob,
  getAppointmentSettings,
  update,
  changePassword,
  tenant,
  realtime,
  masterData,
  appointment,
};
