import { Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './components/Login'
import Signup from './components/Signup'
import BlogPage from './pages/BlogPage'

function App() {

  return (
    <>
      <div>
        <Routes>
          <Route path='/login' element={<Login/>}/>
          <Route path='/signup' element={<Signup/>}/>
        </Routes>
      
      </div>
    </>
  )
}

export default App
