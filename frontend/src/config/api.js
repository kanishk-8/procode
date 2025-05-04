const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
console.log("API URL being used:", API_URL);

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_URL}/login`,
  LOGOUT: `${API_URL}/logout`,
  SIGNUP: `${API_URL}/signup`,
  CURRENT_USER: `${API_URL}/currentUser`,
  REFRESH_TOKEN: `${API_URL}/refresh`,

  // Batch endpoints
  GET_BATCHES_BY_TEACHER: `${API_URL}/getBatchesByTeacher`,
  GET_STUDENT_BATCHES: `${API_URL}/getstudentbatches`,
  ADD_BATCH: `${API_URL}/addBatch`,
  DELETE_BATCH: `${API_URL}/deleteBatch`,
  JOIN_BATCH: (code) => `${API_URL}/joinbatch/${code}`,
  GET_STUDENTS_IN_BATCH: (batchId) =>
    `${API_URL}/getstudentsinbatch/${batchId}`,

  // Question endpoints
  GET_QUESTIONS_BY_BATCH: (batchId) =>
    `${API_URL}/getquestionsbybatch/${batchId}`,
  GET_QUESTION_DETAILS: (batchId, questionId) =>
    `${API_URL}/getquestiondetailsbyid/${batchId}/${questionId}`,
  EVAL_QUESTION: `${API_URL}/evalques`,
  ADD_QUESTION: `${API_URL}/addquestion`,

  // Student evaluation endpoints
  GET_QUESTION_STATUS: (batchId, questionId) =>
    `${API_URL}/question-status/${batchId}/${questionId}`,

  // Student dashboard endpoint
  STUDENT_DASHBOARD: `${API_URL}/student/dashboard`,

  // Teacher dashboard endpoint
  TEACHER_DASHBOARD: `${API_URL}/teacher/dashboard`,

  // Blog endpoints
  GET_BLOG: (blogId) => `${API_URL}/blog/${blogId}`,
  GET_ALL_BLOGS: `${API_URL}/blogs`,
  CREATE_BLOG: `${API_URL}/blog`,
  UPDATE_BLOG: `${API_URL}/blog`,
  DELETE_BLOG: `${API_URL}/blog`,
  VERIFY_BLOG: `${API_URL}/blog/verify`,
  REQUEST_DELETION: `${API_URL}/blog/request-deletion`,
};
