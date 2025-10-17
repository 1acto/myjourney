import { Route, Routes, Navigate } from "react-router-dom";
import axios from "axios";
import { ProtectedRoute } from "@/components/features/auth/ProtectedRoute";

//pages
import LoginPage from "@/pages/LoginPage";
import UserPage from "@/pages/UserPage";
import MapPage from "@/pages/MapPage";
import BranchesPage from "@/pages/branch/lists/BranchesPage";
import BranchCreatePage from "@/pages/branch/create/BranchCreatePage";
import BranchEditPage from "@/pages/branch/edit/BranchesEditPage";
import BranchInfo from "@/pages/branch/info/BranchInfo";
import TagsPage from "@/pages/setting/TagsPage";
import PoiCreatePage from "@/pages/poi/create/PoiCreatePage";


axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

function App() {
  return (
    <Routes>
      <Route path="*" element={<Navigate to="/map" replace />} />
      <Route element={<LoginPage />} path="/login" />
      <Route
        element={
          <ProtectedRoute>
            <UserPage />
          </ProtectedRoute>
        }
        path="/user"
      />
      <Route element={<PoiCreatePage />} path="/poi/create" />
      <Route
        element={
          <ProtectedRoute>
            <MapPage />
          </ProtectedRoute>
        }
        path="/map"
      />

      <Route
        element={
          <ProtectedRoute>
            <BranchesPage />
          </ProtectedRoute>
        }
        path="/branches"
      />
      <Route 
        element={
          <ProtectedRoute>
            <BranchCreatePage />
          </ProtectedRoute>
        } 
        path="/branches/create" 
      />
      <Route
        element={
          <ProtectedRoute>
            <BranchEditPage />
          </ProtectedRoute>
        }
        path="/branches/edit"
      />
      <Route
        element={
          <ProtectedRoute>
            <BranchInfo />
          </ProtectedRoute>
        }
        path="/branches/info"
      />
      <Route
        element={
          <ProtectedRoute>
            <TagsPage />
          </ProtectedRoute>
        }
        path="/settings/tags"
      />
    </Routes>
  );
}

export default App;
