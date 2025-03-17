import logo from './logo.svg';
import './App.css';
import Dashboard from './Dashboard';
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Schedule from './Schedule';
import AuthPage from './Authpage';
import Middleware from './middleware';
function App() {

  const logout=()=>{
    localStorage.removeItem('token')
    window.location.href="/"
  }
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Link
                  to="/"
                  className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Admin Panel
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  to="/"
                  className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>

             {localStorage.getItem('token')?<p onClick={logout} className="text-gray-600 cursor-pointer hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">

              Logout
             </p>:<>
              <Link
                  to="/auth/false"
                  className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
             </>}
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <Routes>
           <Route element={<Middleware/>}>
           <Route path="/" element={<Dashboard />} />
           <Route path='/schedule' element={<Schedule />} />
           </Route>
            <Route path='/auth/:login' element={<AuthPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
