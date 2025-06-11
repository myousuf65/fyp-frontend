import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard";
const { Component } = require("react");

export default class App extends Component {
  render() {
    return (
      <Router>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    );
  }
}
