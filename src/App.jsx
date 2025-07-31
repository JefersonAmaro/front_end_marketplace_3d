import './App.css'
import { Outlet } from 'react-router-dom'
import Header from './components/header'
import Footer from './components/footer'

import ScrollToTop from './components/scrollToTop'

import { CartPreview } from './components/cartPreview'

function App() {

  return (
    <>
      <Header />
      <ScrollToTop />
      <Outlet />
      <CartPreview />
      <Footer />
    </>
  )
}

export default App
