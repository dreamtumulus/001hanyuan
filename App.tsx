
import React, { useState, useEffect } from 'react';
import { UserRole, AppState, PersonalInfo, TalkRecord, ExamReport, PsychTestReport, AIAnalysisReport, SystemConfig, UserAccount } from './types';
import Login from './pages/Login';
import IdentitySelect from './pages/IdentitySelect';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PersonalInfoPage from './pages/PersonalInfoPage';
import ExamReportPage from './pages/ExamReportPage';
import PsychTestPage from './pages/PsychTestPage';
import PsychCounselingPage from './pages/PsychCounselingPage';
import TalkEntryPage from './pages/TalkEntryPage';
import DashboardPage from './pages/DashboardPage';
import AnalysisReportPage from './pages/AnalysisReportPage';
import AdminSettings from './pages/AdminSettings';

const STORAGE_KEY = 'jingxin_guardian_data_v6';

// 系统预设默认配置
const SYSTEM_DEFAULT_CONFIG: SystemConfig = {
  openRouterKey: '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',
  preferredModel: 'google/gemini-2.0-flash-001',
  apiBaseUrl: 'https://openrouter.ai/api/v1'
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    
    // 基础配置优先顺序：环境变量 > 代码内置默认
    const baseConfig: SystemConfig = {
      openRouterKey: (process.env as any).OPENROUTER_API_KEY || SYSTEM_DEFAULT_CONFIG.openRouterKey,
      preferredModel: (process.env as any).PREFERRED_MODEL || SYSTEM_DEFAULT_CONFIG.preferredModel,
      apiBaseUrl: (process.env as any).API_BASE_URL || SYSTEM_DEFAULT_CONFIG.apiBaseUrl
    };

    if (saved) {
      const parsed = JSON.parse(saved);
      // 合并逻辑：如果用户保存的 Key 为空字符串，则回退到 baseConfig 的默认值
      const mergedConfig: SystemConfig = {
        openRouterKey: parsed.systemConfig?.openRouterKey || baseConfig.openRouterKey,
        preferredModel: parsed.systemConfig?.preferredModel || baseConfig.preferredModel,
        apiBaseUrl: parsed.systemConfig?.apiBaseUrl || baseConfig.apiBaseUrl,
      };
      return { ...parsed, systemConfig: mergedConfig };
    }

    // 默认初始账号
    const defaultAccounts: Record<string, UserAccount> = {
      'admin': { username: 'admin', password: 'xiaoyuan', role: UserRole.ADMIN, name: '管理员' },
      'xiaoyuantest': { username: 'xiaoyuantest', password: '123456', role: 'MULTIPLE', name: '演示账号' },
      'TEST001': { username: 'TEST001', password: 'password123', role: UserRole.OFFICER, name: '演示民警' }
    };

    return {
      currentUser: null,
      accounts: defaultAccounts,
      personalInfo: {
        'TEST001': { 
          name: '演示民警', policeId: 'TEST001', department: '演示大队', position: '二级警员',
          gender: '男', age: '28', idCard: '110101199501011234', hometown: '北京市',
          address: '警苑小区', phone: '13800138000', email: 'test@police.cn', family: []
        }
      },
      examReports: {},
      psychTestReports: {},
      talkRecords: [],
      analysisReports: {},
      systemConfig: baseConfig
    };
  });

  const [currentPath, setCurrentPath] = useState<string>(() => window.location.hash.replace('#', '') || 'login');
  const [activeOfficerId, setActiveOfficerId] = useState<string>('TEST001');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const handleHashChange = () => {
      const path = window.location.hash.replace('#', '') || 'login';
      setCurrentPath(path);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
  };

  const handleLogin = (username: string, password: string): boolean => {
    const account = state.accounts[username];
    if (account && account.password === password) {
      if (account.role === 'MULTIPLE') {
        setState(prev => ({ ...prev, currentUser: { username, role: UserRole.OFFICER, actualId: username } })); 
        navigate('identity-select');
      } else {
        setState(prev => ({ ...prev, currentUser: { username, role: account.role as UserRole, actualId: username } }));
        if (account.role === UserRole.ADMIN) navigate('admin-settings');
        else if (account.role === UserRole.LEADER) navigate('dashboard');
        else if (account.role === UserRole.COMMANDER) navigate('talk-entry');
        else navigate('personal-info');
      }
      return true;
    }
    return false;
  };

  const setRole = (role: UserRole) => {
    setState(prev => ({ ...prev, currentUser: { ...prev.currentUser!, role } }));
    if (role === UserRole.LEADER) navigate('dashboard');
    else if (role === UserRole.COMMANDER) navigate('talk-entry');
    else navigate('personal-info');
  };

  const updatePersonalInfo = (info: PersonalInfo) => {
    setState(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [info.policeId]: info }
    }));
  };

  const handleAddTalkRecord = (record: TalkRecord, password?: string) => {
    setState(prev => {
      const updatedPersonalInfo = { ...prev.personalInfo };
      const updatedAccounts = { ...prev.accounts };
      
      if (!updatedPersonalInfo[record.policeId]) {
        updatedPersonalInfo[record.policeId] = {
          name: record.officerName,
          policeId: record.policeId,
          department: '基层科所队',
          position: '待定',
          gender: '男',
          age: '',
          idCard: '',
          hometown: '',
          address: '',
          phone: '',
          email: '',
          family: []
        };
        
        updatedAccounts[record.policeId] = {
          username: record.policeId,
          password: password || '123456',
          role: UserRole.OFFICER,
          name: record.officerName
        };
      }
      
      return {
        ...prev,
        personalInfo: updatedPersonalInfo,
        accounts: updatedAccounts,
        talkRecords: [record, ...prev.talkRecords]
      };
    });
  };

  const saveAnalysisReport = (report: AIAnalysisReport) => {
    setState(prev => ({
      ...prev,
      analysisReports: { ...prev.analysisReports, [report.policeId]: report }
    }));
  };

  const logout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
    navigate('login');
  };

  const renderContent = () => {
    if (!state.currentUser) return <Login onLogin={handleLogin} />;
    if (currentPath === 'identity-select') return <IdentitySelect onSelect={setRole} />;
    if (currentPath === 'admin-settings') return <AdminSettings config={state.systemConfig} onSave={(c) => setState(prev => ({...prev, systemConfig: c}))} />;

    const effectiveId = (state.currentUser.role === UserRole.OFFICER) ? (state.currentUser.actualId || 'TEST001') : activeOfficerId;

    switch (currentPath) {
      case 'personal-info':
        return <PersonalInfoPage info={state.personalInfo[effectiveId]} onSave={updatePersonalInfo} />;
      case 'exam-reports':
        return <ExamReportPage reports={state.examReports[effectiveId] || []} systemConfig={state.systemConfig} onAdd={(r) => setState(prev => ({...prev, examReports: {...prev.examReports, [effectiveId]: [...(prev.examReports[effectiveId] || []), r]}}))} onDelete={(id) => setState(prev => ({...prev, examReports: {...prev.examReports, [effectiveId]: prev.examReports[effectiveId].filter(r => r.id !== id)}}))} />;
      case 'psych-test':
        return <PsychTestPage reports={state.psychTestReports[effectiveId] || []} onAddReport={(r) => setState(prev => ({...prev, psychTestReports: {...prev.psychTestReports, [effectiveId]: [...(prev.psychTestReports[effectiveId] || []), r]}}))} officerInfo={state.personalInfo[effectiveId]} systemConfig={state.systemConfig} />;
      case 'psych-counseling':
        return <PsychCounselingPage officerInfo={state.personalInfo[effectiveId]} exams={state.examReports[effectiveId] || []} psychReports={state.psychTestReports[effectiveId] || []} systemConfig={state.systemConfig} />;
      case 'talk-entry':
        return <TalkEntryPage records={state.talkRecords} onAdd={handleAddTalkRecord} onDelete={(id) => setState(prev => ({...prev, talkRecords: prev.talkRecords.filter(r => r.id !== id)}))} />;
      case 'dashboard':
        return <DashboardPage state={state} onNavigate={(path) => navigate(path)} />;
      case 'analysis-report':
        return <AnalysisReportPage state={state} onSaveReport={saveAnalysisReport} />;
      default:
        return <PersonalInfoPage info={state.personalInfo[effectiveId]} onSave={updatePersonalInfo} />;
    }
  };

  const showSidebar = state.currentUser && currentPath !== 'identity-select' && currentPath !== 'login';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {state.currentUser && currentPath !== 'login' && (
        <Header 
          user={state.currentUser} 
          onBack={() => window.history.back()} 
          onLogout={logout} 
          showBack={currentPath !== 'identity-select'}
        />
      )}
      <div className="flex flex-1 overflow-hidden relative">
        {showSidebar && <Sidebar role={state.currentUser.role} currentPath={currentPath} onNavigate={navigate} />}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
