import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import MintIP from './pages/MintIP'
import Marketplace from './pages/Marketplace'
import IPDetail from './pages/IPDetail'
import Dashboard from './pages/Dashboard'
import Governance from './pages/Governance'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mint" element={<MintIP />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/ip/:id" element={<IPDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/governance" element={<Governance />} />
          <Route path="/governance/:id" element={<Governance />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App

