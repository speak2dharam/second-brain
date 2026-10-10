import type { ReactNode } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import Shell from './components/Shell';
import { useDemo } from './lib/store';
import Agents from './pages/Agents';
import Assistant from './pages/Assistant';
import DigestPage from './pages/Digest';
import DataSources from './pages/DataSources';
import { DevOpsExplorer, DirectoryExplorer, DocumentsExplorer, EmailExplorer, LeaveExplorer, TeamsExplorer } from './pages/Explorers';
import Leads from './pages/Leads';
import Learning from './pages/Learning';
import Login from './pages/Login';
import Nominations from './pages/Nominations';
import People from './pages/People';
import PersonPage from './pages/Person';
import Roles from './pages/Roles';

function RequireUser({ children }: { children: ReactNode }) {
  const { state } = useDemo();
  return state.userId ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<RequireUser><Shell /></RequireUser>}>
          <Route index element={<Assistant />} />
          <Route path="people" element={<People />} />
          <Route path="people/:id" element={<PersonPage />} />
          <Route path="leads" element={<Leads />} />
          <Route path="nominations" element={<Nominations />} />
          <Route path="nominations/:id" element={<Nominations />} />
          <Route path="explore/directory" element={<DirectoryExplorer />} />
          <Route path="explore/email" element={<EmailExplorer />} />
          <Route path="explore/teams" element={<TeamsExplorer />} />
          <Route path="explore/devops" element={<DevOpsExplorer />} />
          <Route path="explore/leave" element={<LeaveExplorer />} />
          <Route path="explore/documents" element={<DocumentsExplorer />} />
          <Route path="explore/learning" element={<Learning />} />
          <Route path="admin/sources" element={<DataSources />} />
          <Route path="admin/roles" element={<Roles />} />
          <Route path="admin/agents" element={<Agents />} />
          <Route path="digest" element={<DigestPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
