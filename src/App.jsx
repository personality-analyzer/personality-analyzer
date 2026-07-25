import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import { useApp } from './store/AppContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import HomeTab from './tabs/HomeTab.jsx';
import ProfileTab from './tabs/ProfileTab.jsx';
import AnalyzeTab from './tabs/AnalyzeTab.jsx';
import FirasaTab from './tabs/FirasaTab.jsx';
import PersonalityTab from './tabs/PersonalityTab.jsx';
import CompareTab from './tabs/CompareTab.jsx';
import HistoryTab from './tabs/HistoryTab.jsx';
import SettingsTab from './tabs/SettingsTab.jsx';
import ResearchTab from './tabs/ResearchTab.jsx';
import ArchiveTab from './tabs/ArchiveTab.jsx';
import ChatTab from './tabs/ChatTab.jsx';
import ReportTab from './tabs/ReportTab.jsx';

const TABS = {
  home: HomeTab, profile: ProfileTab, analyze: AnalyzeTab, firasa: FirasaTab, personality: PersonalityTab,
  compare: CompareTab, report: ReportTab, research: ResearchTab, archive: ArchiveTab,
  chat: ChatTab, history: HistoryTab, settings: SettingsTab,
};

export default function App() {
  const { tab } = useApp();
  const Active = TABS[tab] || HomeTab;
  return (
    <div className="flex h-screen flex-col">
      <Topbar />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-5">
          <div className="mx-auto max-w-2xl">
            <ErrorBoundary key={tab}>
              <Active />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
