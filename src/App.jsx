import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import StudentRequest from './pages/StudentRequest';
import TeacherApply from './pages/TeacherApply';

function App() {
  return (
    <BrowserRouter>
      {/* We removed the old navbar from here! */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/request-tutor" element={<StudentRequest />} />
        <Route path="/apply-teacher" element={<TeacherApply />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;