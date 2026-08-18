import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import StudentRequest from './pages/StudentRequest';
import TeacherApply from './pages/TeacherApply';
import Contact from './pages/Contact';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/request-tutor" element={<StudentRequest />} />
        <Route path="/apply-teacher" element={<TeacherApply />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;