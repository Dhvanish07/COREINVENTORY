import { useState } from 'react'
import axios from 'axios'
import PasswordResetForm from './components/PasswordResetForm'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <PasswordResetForm />
    </div>
  )
}

export default App
