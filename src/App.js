import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import AddJob from "./pages/AddJob";

function App() {

return (

<BrowserRouter>

<Routes>

<Route
path="/"
element={<Home/>}
/>

<Route
path="/login"
element={<Login/>}
/>

<Route
path="/register"
element={<Register/>}
/>

<Route
path="/dashboard"
element={<Dashboard/>}
/>

<Route
path="/admin"
element={<Admin/>}
/>

<Route
path="/admin-dashboard"
element={<AdminDashboard/>}
/>

<Route
path="/add-job"
element={<AddJob/>}
/>

</Routes>

</BrowserRouter>

);

}

export default App;