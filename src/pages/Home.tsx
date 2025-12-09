import { Link } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { Sparkles, TrendingUp, DollarSign, ArrowRight, Zap } from 'lucide-react'

export default function Home() {
  const { isConnected } = useAccount()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Hero Section */}
      <div className="text-center mb-24 animate-fade-in">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm text-gray-300 mb-8">
          <Zap className="h-4 w-4 text-white" />
          <span>Powered by Story Protocol Testnet</span>
        </div>
        
        <h1 className="text-6xl md:text-7xl font-bold mb-6 gradient-text leading-tight">
          Fractionalize Your
          <br />
          <span className="text-white">Intellectual Property</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
          Tokenize and sell partial ownership of your IP assets on Story Testnet. 
          Share revenue with your community and build a decentralized creative economy.
        </p>
        
        <div className="flex justify-center space-x-4">
          {isConnected ? (
            <>
              <Link to="/mint" className="btn-primary text-lg px-8 py-4">
                <Sparkles className="h-5 w-5" />
                <span>Mint Your IP</span>
              </Link>
              <Link to="/marketplace" className="btn-secondary text-lg px-8 py-4">
                <span>Explore Marketplace</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </>
          ) : (
            <div className="card-dark inline-block px-8 py-4">
              <p className="text-gray-400">Connect your wallet to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-24">
        <div className="card glow-effect group animate-slide-up">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto mb-6 group-hover:bg-white/20 transition-all duration-300">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-3 text-white">Mint IP Assets</h3>
          <p className="text-gray-400 leading-relaxed">
            Create on-chain records of your creative work - stories, characters, songs, and more.
          </p>
        </div>

        <div className="card glow-effect group animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto mb-6 group-hover:bg-white/20 transition-all duration-300">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-3 text-white">Fractionalize Ownership</h3>
          <p className="text-gray-400 leading-relaxed">
            Split your IP into tradeable tokens. Sell shares to your community and raise capital.
          </p>
        </div>

        <div className="card glow-effect group animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto mb-6 group-hover:bg-white/20 transition-all duration-300">
            <DollarSign className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-3 text-white">Automated Royalties</h3>
          <p className="text-gray-400 leading-relaxed">
            Smart contracts automatically distribute licensing revenue to all fractional owners.
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="card-dark mb-24">
        <h2 className="text-4xl font-bold mb-12 text-center text-white">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-12">
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-2xl text-white">
              1
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white mt-8">Mint Your IP</h3>
            <p className="text-gray-400 leading-relaxed">
              Use Story Protocol SDK to mint your creative work as an IP Asset (IPA) on Story Testnet. 
              Define licensing rules and royalty structure.
            </p>
          </div>
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-2xl text-white">
              2
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white mt-8">Fractionalize & Sell</h3>
            <p className="text-gray-400 leading-relaxed">
              Create fractional ownership tokens and list them on the marketplace. 
              Choose from fixed price, Dutch auction, or ITO models.
            </p>
          </div>
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-2xl text-white">
              3
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white mt-8">Earn Together</h3>
            <p className="text-gray-400 leading-relaxed">
              When your IP is licensed, revenue automatically flows to you and all fractional owners 
              based on their ownership percentage.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {isConnected && (
        <div className="card-dark text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-4 text-white">Ready to Get Started?</h2>
            <p className="text-gray-300 mb-8 text-lg max-w-2xl mx-auto">
              Mint your first IP asset and start building your fractionalized creative economy.
            </p>
            <Link 
              to="/mint" 
              className="btn-primary inline-flex items-center space-x-2 text-lg px-8 py-4"
            >
              <Sparkles className="h-5 w-5" />
              <span>Mint Your IP</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
