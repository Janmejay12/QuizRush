import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Cars from './Cars'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Cars/>
    </>
  )
}

export default App
