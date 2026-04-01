import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import TrainingMaterials from "./pages/TrainingMaterials"; // We will create this next

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/training-materials" element={<TrainingMaterials />} />
      </Routes>
    </Router>
  );
}

export default App;