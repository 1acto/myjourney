import { Route, Routes, Navigate } from "react-router-dom";
import axios from "axios";

import PoiEditPage from "./pages/poi/edit/PoiEditPage";

import { ProtectedRoute } from "@/components/features/auth/ProtectedRoute";

//pages
import LoginPage from "@/pages/LoginPage";
import UserPage from "@/pages/UserPage";
import MapPage from "@/pages/MapPage";
import PoiCreatePage from "@/pages/poi/create/PoiCreatePage";
import PoiPage from "@/pages/poi/lists/PoiPage";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

function App() {
  return (
    <Routes>
      <Route element={<Navigate replace to="/map" />} path="*" />
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
            <PoiPage />
          </ProtectedRoute>
        }
        path="/poi"
      />
      <Route
        element={
          <ProtectedRoute>
            <PoiPage />
          </ProtectedRoute>
        }
        path="/poi"
      />

      <Route
        element={
          <ProtectedRoute>
            <PoiEditPage />
          </ProtectedRoute>
        }
        path="/poi/edit" // /:id
      />
    </Routes>
  );
}

export default App;
