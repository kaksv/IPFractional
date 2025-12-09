import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAccount, useDisconnect } from 'wagmi'
import { Wallet, Home, Plus, ShoppingBag, LayoutDashboard, Sparkles, Vote } from 'lucide-react'
import WalletButton from './WalletButton'
import ChainChecker from './ChainChecker'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { isConnected } = useAccount()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <nav className="navbar-glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Sparkles className="h-8 w-8 text-white relative z-10 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">IP Fractional</span>
              </Link>
              
              <div className="hidden md:flex space-x-2">
                <Link
                  to="/"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive('/') 
                      ? 'bg-white/20 text-white backdrop-blur-md border border-white/30' 
                      : 'text-gray-400 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-transparent'
                  }`}
                >
                  <Home className="inline h-4 w-4 mr-2" />
                  Home
                </Link>
                <Link
                  to="/marketplace"
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive('/marketplace') 
                      ? 'bg-white/20 text-white backdrop-blur-md border border-white/30' 
                      : 'text-gray-400 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-transparent'
                  }`}
                >
                  <ShoppingBag className="inline h-4 w-4 mr-2" />
                  Marketplace
                </Link>
                {isConnected && (
                  <>
                    <Link
                      to="/mint"
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                        isActive('/mint') 
                          ? 'bg-white/20 text-white backdrop-blur-md border border-white/30' 
                          : 'text-gray-400 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-transparent'
                      }`}
                    >
                      <Plus className="inline h-4 w-4 mr-2" />
                      Mint IP
                    </Link>
                    <Link
                      to="/dashboard"
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                        isActive('/dashboard') 
                          ? 'bg-white/20 text-white backdrop-blur-md border border-white/30' 
                          : 'text-gray-400 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-transparent'
                      }`}
                    >
                      <LayoutDashboard className="inline h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                    <Link
                      to="/governance"
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                        location.pathname.startsWith('/governance')
                          ? 'bg-white/20 text-white backdrop-blur-md border border-white/30' 
                          : 'text-gray-400 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-transparent'
                      }`}
                    >
                      <Vote className="inline h-4 w-4 mr-2" />
                      Governance
                    </Link>
                  </>
                )}
              </div>
            </div>
            
            <WalletButton />
          </div>
        </div>
      </nav>

      <main className="flex-1 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ChainChecker />
        </div>
        {children}
      </main>

      <footer className="bg-black/40 backdrop-blur-xl border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-400">
            <p className="text-white font-medium mb-2">Built on Story Protocol Testnet</p>
            <p className="text-sm">Fractionalized IP Ownership Platform • Native Currency: IP</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
