import './App.css'
import { Route, Routes } from 'react-router-dom'
import EstimationPage from './pages/estimation'
import HomePage from './pages/home'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/estimation" element={<EstimationPage/>} />
    </Routes>
  )
}

export default App
