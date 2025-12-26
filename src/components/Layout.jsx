import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import PageTransition from './PageTransition'
import './Layout.css'

export default function Layout() {
  return (
    <div className="layout">
      <Header />
      <main className="main-content">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
    </div>
  )
}
