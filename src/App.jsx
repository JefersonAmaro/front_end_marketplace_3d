import './App.css'
import { Outlet } from 'react-router-dom'
import Header from './components/header'
import Footer from './components/footer'

import ScrollToTop from './components/scrollToTop'

function App() {

  return (
    <>
      <Header />
      <ScrollToTop />
      <Outlet />
      <Footer />
    </>
  )
}

export default App
