import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import StudentRequest from './pages/StudentRequest';
import TeacherApply from './pages/TeacherApply';

function Navbar() {
  return (
    /* Changed bg-[#1e1f20] to bg-[#FAF7F2] (or bg-transparent) and updated text/border colors */
    <nav className="flex items-center justify-between px-6 py-3 bg-[#FAF7F2] border-b border-gray-200/60 text-gray-900">
      {/* Left side: Logo + Title */}
      <Link to="/" className="flex items-center gap-2.5 text-gray-900 no-underline hover:opacity-80 transition-opacity">
        <img 
          src="/n-badge.png" 
          alt="Logo" 
          className="w-6 h-6 object-contain" 
        />
        <span className="font-semibold text-lg tracking-wide uppercase">NEXUS TUITIONS</span>
      </Link>

      {/* Right side: Navigation Links */}
      <div className="flex gap-4 text-sm font-medium">
        <Link to="/request-tutor" className="text-gray-700 hover:text-black transition-colors">Request Tutor</Link>
        <Link to="/apply-teacher" className="text-gray-700 hover:text-black transition-colors">Apply Teacher</Link>
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