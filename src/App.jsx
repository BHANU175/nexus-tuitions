import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import StudentRequest from './pages/StudentRequest';
import TeacherApply from './pages/TeacherApply';

function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-[#1e1f20] border-b border-gray-800 text-white">
      {/* Left side: Logo + Title */}
      <Link to="/" className="flex items-center gap-2.5 text-white no-underline hover:opacity-90 transition-opacity">
        <img 
          src="/n-badge.png" 
          alt="Logo" 
          className="w-6 h-6 object-contain" 
        />
        <span className="font-semibold text-lg tracking-wide">learning-hub-frontend</span>
      </Link>

      {/* Right side: Optional Navigation Links */}
      <div className="flex gap-4 text-sm font-medium">
        <Link to="/request-tutor" className="text-gray-300 hover:text-white transition-colors">Request Tutor</Link>
        <Link to="/apply-teacher" className="text-gray-300 hover:text-white transition-colors">Apply Teacher</Link>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/request-tutor" element={<StudentRequest />} />
        <Route path="/apply-teacher" element={<TeacherApply />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;