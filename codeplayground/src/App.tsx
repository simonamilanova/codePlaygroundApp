import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import WelcomePage from "../src/Pages/welcomePage/WelcomePage";
import Playground from "./Pages/playground/Playground";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/welcomePage" />} />
        <Route path="/welcomePage" element={<WelcomePage />} />
        <Route path="/playground" element={<Playground />} />
      </Routes>
    </Router>
  );
}

export default App;
