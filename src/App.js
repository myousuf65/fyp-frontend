import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import RoomInput from "./components/RoomInput";
import Test from "./components/Test";

const { Component } = require("react");

export default class App extends Component {

	render() {
		return (
			<Router>
				<Routes>
					<Route path="/dashboard" element={<Dashboard />} />
				</Routes>
			</Router>
		)
	}
}

