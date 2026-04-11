import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import TrainingMaterials from "./pages/TrainingMaterials";
import TelephoneDirectory from "./pages/TelephoneDirectory";
import HolidayList from "./pages/HolidayList";
import UpcomingEvents from "./pages/UpcomingEvents";
import People from "./pages/People";
import Login from "./pages/Login";
import AdminPanel from "./pages/AdminPanel";
import ManageDashboard from "./pages/ManageDashboard";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/training-materials" element={<TrainingMaterials />} />
          <Route path="/telephone-directory" element={<TelephoneDirectory />} />
          <Route path="/holiday-list" element={<HolidayList />} />
          <Route path="/upcoming-events" element={<UpcomingEvents />} />
          <Route path="/people" element={<People />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/manage-dashboard" element={<ManageDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;