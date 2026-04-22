import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, RoleRoute } from './routes/ProtectedRoute';
import AuthLayout from './components/layout/AuthLayout';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/auth/Login';
import LandingPage from './pages/LandingPage';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboards/Dashboard';
import AdminUsers from './pages/admin/AdminUsers';
import Profile from './pages/profile/Profile';
import Unauthorized from './pages/Unauthorized';

import ClubsList from './pages/football/clubs/ClubsList';
import ClubForm from './pages/football/clubs/ClubForm';
import ClubDetail from './pages/football/clubs/ClubDetail';
import JoueursList from './pages/football/joueurs/JoueursList';
import JoueurForm from './pages/football/joueurs/JoueurForm';
import JoueurDetail from './pages/football/joueurs/JoueurDetail';
import CompetitionsList from './pages/football/competitions/CompetitionsList';
import CompetitionForm from './pages/football/competitions/CompetitionForm';
import CompetitionDetail from './pages/football/competitions/CompetitionDetail';
import ParticipationsList from './pages/football/participations/ParticipationsList';
import ArbitresList from './pages/football/arbitres/ArbitresList';
import ArbitreForm from './pages/football/arbitres/ArbitreForm';
import MatchsList from './pages/football/matchs/MatchsList';
import MatchForm from './pages/football/matchs/MatchForm';
import MatchDetail from './pages/football/matchs/MatchDetail';
import ResultatsList from './pages/football/resultats/ResultatsList';
import ResultForm from './pages/football/resultats/ResultForm';
import ResultDetail from './pages/football/resultats/ResultDetail';
import ClassementsList from './pages/classements/ClassementsList';
import ClassementDetail from './pages/classements/ClassementDetail';
import TropheesList from './pages/trophees/TropheesList';

function App() {
  return (
<BrowserRouter future={{ v7_relativeSplatPath: true }}>
      <Routes>
        {/* Route publique par défaut */}
        <Route path="/" element={<LandingPage />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/* Le Dashboard est maintenant accessible sur /dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />
            
            <Route path="admin/users" element={
              <RoleRoute allowedRoles={['super_admin']}>
                <AdminUsers />
              </RoleRoute>
            } />
            
            <Route path="profile" element={<Profile />} />

            <Route path="clubs" element={
              <RoleRoute allowedRoles={['super_admin', 'admin_sportif', 'responsable_club', 'visiteur']}>
                <ClubsList />
              </RoleRoute>
            } />
            <Route path="clubs/new" element={
              <RoleRoute allowedRoles={['super_admin', 'admin_sportif']}>
                <ClubForm />
              </RoleRoute>
            } />
            <Route path="clubs/:id" element={
              <RoleRoute allowedRoles={['super_admin', 'admin_sportif', 'responsable_club', 'visiteur']}>
                <ClubDetail />
              </RoleRoute>
            } />
            <Route path="clubs/:id/edit" element={
              <RoleRoute allowedRoles={['super_admin', 'admin_sportif']}>
                <ClubForm />
              </RoleRoute>
            } />

            <Route path="joueurs" element={
              <RoleRoute allowedRoles={['super_admin', 'admin_sportif', 'responsable_club']}>
                <JoueursList />
              </RoleRoute>
            } />
            <Route path="joueurs/new" element={
              <RoleRoute allowedRoles={['super_admin', 'admin_sportif', 'responsable_club']}>
                <JoueurForm />
              </RoleRoute>
            } />
            <Route path="joueurs/:id" element={
              <RoleRoute allowedRoles={['super_admin', 'admin_sportif', 'responsable_club']}>
                <JoueurDetail />
              </RoleRoute>
            } />
            <Route path="joueurs/:id/edit" element={
              <RoleRoute allowedRoles={['super_admin', 'admin_sportif', 'responsable_club']}>
                <JoueurForm />
              </RoleRoute>
            } />

            <Route path="competitions" element={
              <RoleRoute allowedRoles={['super_admin', 'admin_sportif', 'responsable_club', 'visiteur']}>
                <CompetitionsList />
              </RoleRoute>
            } />
            <Route path="competitions/new" element={
              <RoleRoute allowedRoles={['super_admin', 'admin_sportif']}>
                <CompetitionForm />
              </RoleRoute>
            } />
            <Route path="competitions/:id" element={
              <RoleRoute allowedRoles={['super_admin', 'admin_sportif', 'responsable_club', 'visiteur']}>
                <CompetitionDetail />
              </RoleRoute>
            } />
            <Route path="competitions/:id/edit" element={
              <RoleRoute allowedRoles={['super_admin', 'admin_sportif']}>
                <CompetitionForm />
              </RoleRoute>
            } />

            <Route path="participations" element={
              <RoleRoute allowedRoles={['super_admin', 'admin_sportif']}>
                <ParticipationsList />
              </RoleRoute>
            } />

            <Route path="arbitres" element={
              <RoleRoute allowedRoles={['super_admin', 'admin_sportif']}>
                <ArbitresList />
              </RoleRoute>
            } />
            <Route path="arbitres/new" element={
              <RoleRoute allowedRoles={['super_admin', 'admin_sportif']}>
                <ArbitreForm />
              </RoleRoute>
            } />
            <Route path="arbitres/:id" element={
              <RoleRoute allowedRoles={['super_admin', 'admin_sportif']}>
                <ArbitreForm />
              </RoleRoute>
            } />
            <Route path="arbitres/:id/edit" element={
              <RoleRoute allowedRoles={['super_admin', 'admin_sportif']}>
                <ArbitreForm />
              </RoleRoute>
            } />

            <Route path="matchs" element={
              <RoleRoute allowedRoles={['super_admin', 'admin_sportif', 'responsable_club', 'arbitre', 'visiteur']}>
                <MatchsList />
              </RoleRoute>
            } />
            <Route path="matchs/new" element={
              <RoleRoute allowedRoles={['super_admin', 'admin_sportif']}>
                <MatchForm />
              </RoleRoute>
            } />
            <Route path="matchs/:id" element={
              <RoleRoute allowedRoles={['super_admin', 'admin_sportif', 'responsable_club', 'arbitre', 'visiteur']}>
                <MatchDetail />
              </RoleRoute>
            } />
            <Route path="matchs/:id/edit" element={
              <RoleRoute allowedRoles={['super_admin', 'admin_sportif']}>
                <MatchForm />
              </RoleRoute>
            } />

            <Route path="resultats" element={
              <RoleRoute allowedRoles={['super_admin', 'admin_sportif', 'responsable_club', 'arbitre', 'visiteur']}>
                <ResultatsList />
              </RoleRoute>
            } />
            <Route path="resultats/new" element={
              <RoleRoute allowedRoles={['super_admin', 'admin_sportif']}>
                <ResultForm />
              </RoleRoute>
            } />
            <Route path="resultats/:id" element={
              <RoleRoute allowedRoles={['super_admin', 'admin_sportif', 'responsable_club', 'arbitre', 'visiteur']}>
                <ResultDetail />
              </RoleRoute>
            } />
            <Route path="resultats/:id/edit" element={
              <RoleRoute allowedRoles={['super_admin', 'admin_sportif']}>
                <ResultForm />
              </RoleRoute>
            } />
            <Route path="classements" element={
              <RoleRoute allowedRoles={['super_admin', 'admin_sportif', 'responsable_club', 'visiteur']}>
                <ClassementsList />
              </RoleRoute>
            } />
            <Route path="classements/:equipe" element={
              <RoleRoute allowedRoles={['super_admin', 'admin_sportif', 'responsable_club', 'visiteur']}>
                <ClassementDetail />
              </RoleRoute>
            } />
            <Route path="trophees" element={
              <RoleRoute allowedRoles={['super_admin', 'admin_sportif', 'responsable_club', 'visiteur']}>
                <TropheesList />
              </RoleRoute>
            } />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
