// src/api/endpoints/index.ts

export const API_ENDPOINTS = {
  // AUTH: {
  //   LOGIN: '/auth/login/',
  //   REGISTER: '/auth/register/',
  //   REFRESH: '/auth/refresh/',
  //   LOGOUT: '/auth/logout/',
  //   PROFILE: '/auth/profile/',
  // },
   AUTH: {
    LOGIN: '/auth/login/',
    REGISTER: '/auth/register/',
    REFRESH: '/auth/token/refresh/',
    LOGOUT: '/auth/logout/',
    VERIFY: '/auth/token/verify/',
  },
  
  USER: {
    BASE: '/users/',
    DETAIL: (id: number) => `/users/${id}/`,
    ME: '/users/me/',
    UPDATE_ME: '/users/me/update/',
    CHANGE_PASSWORD: '/users/change-password/',
    LOGS: '/users/logs/',
    USER_LOGS: (id: number) => `/users/${id}/logs/`,
    TOGGLE_ACTIVE: (id: number) => `/users/${id}/toggle-active/`,
    CHANGE_ROLE: (id: number) => `/users/${id}/change-role/`,
    PERMISSIONS: (id: number) => `/users/${id}/permissions/`,
    STATISTICS: '/users/statistics/',
  },
  
  PERMISSION: {
    BASE: '/permissions/',
    DETAIL: (id: number) => `/permissions/${id}/`,
    GROUPED: '/permissions/grouped/',
    INITIALIZE: '/permissions/initialize/',
  },
  
  ROLE_PERMISSION: {
    BASE: '/role-permissions/',
    BY_ROLE: (role: string) => `/role-permissions/by-role/${role}/`,
    BULK_UPDATE: '/role-permissions/bulk-update/',
    MATRIX: '/role-permissions/matrix/',
  },
  
  USER_PERMISSION: {
    BASE: '/user-permissions/',
    BY_USER: (userId: number) => `/user-permissions/by-user/${userId}/`,
    BULK_UPDATE: '/user-permissions/bulk-update/',
  },
  
  ROLE: {
    BASE: '/roles/',
    DETAIL: (code: string) => `/roles/${code}/`,
    DESCRIPTIONS: '/role-descriptions/',
    DESCRIPTION_DETAIL: (id: number) => `/role-descriptions/${id}/`,
  },
   PERSON: {
    BASE: '/persons/',
    DETAIL: (id: number) => `/persons/${id}/`,
    STATS: '/persons/stats/',
  },
  RESEARCH: {
    BASE: '/researches/',
    DETAIL: (id: number) => `/researches/${id}/`,
    STATS: '/researches/stats/',
    BY_STATUS: (status: string) => `/researches/?status=${status}`,
    BY_YEAR: (year: number) => `/researches/?year=${year}`,
    RFPS: (id: number) => `/researches/${id}/rfps/`,
  },
  RFP: {
    BASE: '/rfps/',
    DETAIL: (id: number) => `/rfps/${id}/`,
    STATS: '/rfps/stats/',
    BY_YEAR: (year: number) => `/rfps/?year=${year}`,
    BY_RESEARCH: (researchId: number) => `/rfps/?research=${researchId}`,
  },
  PROPOSAL: {
    BASE: '/proposals/',
    DETAIL: (id: number) => `/proposals/${id}/`,
    STATS: '/proposals/stats/',
    BY_RFP: (rfpId: number) => `/proposals/?rfp=${rfpId}`,
    BY_UNIVERSITY: (universityId: number) => `/proposals/?university=${universityId}`,
    WINNERS: '/proposals/?is_winner=true',
  },
    UNIVERSITY_TYPE: {
    BASE: '/university-types/',
    DETAIL: (id: number) => `/university-types/${id}/`,
  },
  UNIVERSITY: {
    BASE: '/universities/',
    DETAIL: (id: number) => `/universities/${id}/`,
  },
  
  COMPANY: {
    BASE: '/companies/',
    DETAIL: (id: number) => `/companies/${id}/`,
  },
  PROVINCE: {
    BASE: '/provinces/',
    DETAIL: (id: number) => `/provinces/${id}/`,
  },
  CITY: {
    BASE: '/cities/',
    DETAIL: (id: number) => `/cities/${id}/`,
  },
  PROJECT_SUBJECT: {
    BASE: '/project-subjects/',
    DETAIL: (id: number) => `/project-subjects/${id}/`,
  },
   CONTRACT: {
    BASE: '/contracts/',
    DETAIL: (id: number) => `/contracts/${id}/`,
    STATS: '/contracts/stats/',
    ACTIVITIES: (id: number) => `/contracts/${id}/activities/`,
    DELAYS: (id: number) => `/contracts/${id}/delays/`,
    PAYMENTS: (id: number) => `/contracts/${id}/payments/`,
    SETTLEMENTS: (id: number) => `/contracts/${id}/settlements/`,
    PROGRESSES: (id: number) => `/contracts/${id}/progresses/`,
  },
  PAYMENT: {
    BASE: '/payments/',
    DETAIL: (id: number) => `/payments/${id}/`,
    VERIFY: (id: number) => `/payments/${id}/verify/`,
    UNVERIFY: (id: number) => `/payments/${id}/unverify/`,
    BY_CONTRACT: (contractId: number) => `/payments/by-contract/${contractId}/`,
    BY_RECEIVER: (receiverId: number) => `/payments/by-receiver/${receiverId}/`,
  },
  PAYMENT_TYPE: {
    BASE: '/payment-types/',
    DETAIL: (id: number) => `/payment-types/${id}/`,
  },
  PROGRESS: {
  BASE: '/progresses/',
  DETAIL: (id: number) => `/progresses/${id}/`,
  STATS: '/progresses/stats/',
  BY_CONTRACT: (contractId: number) => `/progresses/by-contract/${contractId}/`,
},

 RESEARCH_COMMITTEE: {
    BASE: '/research-committees/',
    DETAIL: (id: number) => `/research-committees/${id}/`,
    STATS: '/research-committees/stats/',
  },
  //sss
  STEERING_COMMITTEE: {
    BASE: '/steering-committees/',
    DETAIL: (id: number) => `/steering-committees/${id}/`,
    STATS: '/steering-committees/stats/',
    BY_RESEARCH: (researchId: number) => `/steering-committees/by-research/${researchId}/`,
  },
  RESEARCH_APPROVEMENT: {
    BASE: '/research-committee-approvements/',
    DETAIL: (id: number) => `/research-committee-approvements/${id}/`,
    BY_COMMITTEE: (committeeId: number) => `/research-committee-approvements/by-committee/${committeeId}/`,
  },
  STEERING_APPROVEMENT: {
    BASE: '/steering-committee-approvements/',
    DETAIL: (id: number) => `/steering-committee-approvements/${id}/`,
    BY_COMMITTEE: (committeeId: number) => `/steering-committee-approvements/by-committee/${committeeId}/`,
  },
  COMMUNICATION: {
    BASE: '/communications/',
    DETAIL: (id: number) => `/communications/${id}/`,
    STATS: '/communications/stats/',
  },

};

export const API_CONFIG = {
  TIMEOUT: 30000,
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
  PAGE_SIZE: 20,
};