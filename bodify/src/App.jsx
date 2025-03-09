import React from 'react'
import Header from './layout/Header'
import Home from './pages/Homes/Home'
import Classes from './pages/Homes/Classes'
import FitnessNow from './pages/Homes/FitnessNow'
import Footer from './layout/Footer'
import Choose from './pages/Homes/Choose'
import MeetPT from './pages/Homes/MeetPT'

const App = () => {
  return (
    <div>
      <Header/>
      <Home/>
      <Classes/>
      <FitnessNow/>
      <Choose/>
      <MeetPT/>
      <Footer/>
    </div>
  )
}

export default App