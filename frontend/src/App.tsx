import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/components/routes/ProtectedRoute";
import axios from "axios";

//pages
import LoginPage from "@/pages/login";
import UserPage from "@/pages/user";
import MapPage from "@/pages/map";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.API_URL;

function App() {
  return (
    <Routes>
      <Route element={<LoginPage />} path="/login" />
      <Route
        element={
          <ProtectedRoute>
            <UserPage />
          </ProtectedRoute>
        }
        path="/user"
      />
      <Route path="/map" element={<MapPage />} />
    </Routes>
  );
}

export default App;
