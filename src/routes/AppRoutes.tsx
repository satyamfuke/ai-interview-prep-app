import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from '../pages/Home.tsx'
import Login from '../pages/Login.tsx'
import Signup from '../pages/Signup.tsx'
import Dashboard from '../pages/Dashboard.tsx'
import InterviewGenerator from '../pages/InterviewGenerator.tsx'
import History from '../pages/History.tsx'
import Profile from '../pages/Profile.tsx'
import AnswerEvaluation from '../pages/AnswerEvaluation.tsx'
import NotFound from '../pages/NotFound.tsx'
import DashboardLayout from '../layouts/DashboardLayout.tsx'
import { PrivateRoute } from '../components/PrivateRoute.tsx'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="interview" element={<InterviewGenerator />} />
          <Route path="evaluate" element={<AnswerEvaluation />} />
          <Route path="history" element={<History />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
