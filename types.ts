
export enum UserRole {
  OFFICER = 'OFFICER', // 普通民警
  COMMANDER = 'COMMANDER', // 科所队长/录入者
  LEADER = 'LEADER', // 政工/领导者
  ADMIN = 'ADMIN' // 系统管理员
}

export interface UserAccount {
  username: string; // 对应警号
  password: string;
  role: UserRole | 'MULTIPLE'; // MULTIPLE 表示演示账号，可进入身份选择
  name: string;
}

export interface SystemConfig {
  openRouterKey: string;
  preferredModel: string;
  apiBaseUrl: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  job: string;
  company: string;
  phone: string;
}

export interface PersonalInfo {
  name: string;
  department: string;
  position: string;
  policeId: string;
  gender: string;
  age: string;
  idCard: string;
  hometown: string;
  address: string;
  phone: string;
  email: string;
  family: FamilyMember[];
}

export interface ExamReport {
  id: string;
  date: string;
  fileName: string;
  analysis: string;
  status: 'pending' | 'completed';
}

export interface PsychTestReport {
  id: string;
  date: string;
  score: number;
  level: string; // 优良, 关注, 高危
  content: string;
  messages: { role: 'user' | 'model'; text: string }[];
}

export interface TalkRecord {
  id: string;
  officerName: string;
  policeId: string;
  interviewer: string;
  participants: string;
  date: string;
  location: string;
  entryTime: string;
  armedUnit: string;
  hasFamilyConflict: boolean;
  familyConflictDetail: string;
  hasMajorChange: boolean;
  majorChangeDetail: string;
  hasDebt: boolean;
  debtDetail: string;
  hasAlcoholIssue: boolean;
  alcoholDetail: string;
  hasRelationshipIssue: boolean;
  relationshipDetail: string;
  hasComplexSocial: boolean;
  complexSocialDetail: string;
  isUnderInvestigation: boolean;
  investigationDetail: string;
  hasMentalIssue: boolean;
  mentalIssueDetail: string;
  otherInfo: string;
  thoughtDynamic: string;
  realityPerformance: string;
  mentalStatus: string;
  canCarryGun: string;
}

export interface AIAnalysisReport {
  policeId: string;
  generatedAt: string;
  content: string;
  manualEdit?: string; // 人工修改内容
  editStatus: 'ai' | 'modified' | 'finalized';
  editorName?: string;
}

export interface AppState {
  currentUser: {
    username: string;
    role: UserRole;
    actualId?: string; // 实际登录的警号
  } | null;
  accounts: Record<string, UserAccount>; // 账号数据库
  personalInfo: Record<string, PersonalInfo>;
  examReports: Record<string, ExamReport[]>;
  psychTestReports: Record<string, PsychTestReport[]>;
  talkRecords: TalkRecord[];
  analysisReports: Record<string, AIAnalysisReport>;
  systemConfig: SystemConfig;
}
