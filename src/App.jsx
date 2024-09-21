import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import LoginPage from './components/LoginPage'
import EmailWorkflow from './components/EmailWorkFlow'


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/email-workflow" element={<EmailWorkflow/>} />
      </Routes>
    </Router>
  )
}

export default App