import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import TrainingMaterials from "./pages/TrainingMaterials";
import TelephoneDirectory from "./pages/TelephoneDirectory";
import HolidayList from "./pages/HolidayList";
import UpcomingEvents from "./pages/UpcomingEvents";
import People from "./pages/People";

function App() {
  const hiddenPaths = ["/training-materials", "/telephone-directory", "/holiday-list", "/upcoming-events", "/people"];
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/training-materials" element={<TrainingMaterials />} />
        <Route path="/telephone-directory" element={<TelephoneDirectory />} />
        <Route path="/holiday-list" element={<HolidayList />} />
        <Route path="/upcoming-events" element={<UpcomingEvents />} />
        <Route path="/people" element={<People />} />
      </Routes>
    </Router>
  );
}

export default App;