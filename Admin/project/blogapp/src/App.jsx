import { Navigate, Route, Routes } from 'react-router-dom'
import React from 'react'
import Navbar from './components/Navbar'
import Login from './components/Login'
import AdminDashboard from './components/AdminDashboard'


const App = () => {
  return (
    <div>
      <Navbar/>


<Routes>
  <Route path="/" element={<Navigate to="/login" />} />
  <Route path="/login" element={<Login/>}></Route>
  <Route path="/admin" element={<AdminDashboard />} /> 
  
</Routes>


    </div>
  )
}

export default App