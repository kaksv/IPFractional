import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, TrendingUp } from 'lucide-react'
import { IPAsset } from '../types'

// Dummy data for testing
const mockIPAssets: IPAsset[] = [
  {
    id: '1',
    name: 'The Legendary Hero',
    description: 'An epic fantasy character with rich backstory and world-building potential. This character has been developed over years and includes detailed lore, personality traits, and story arcs.',
    creator: '0x1234567890123456789012345678901234567890',
    imageUrl: 'https://res.cloudinary.com/dagn33ye3/image/upload/v1765194877/fractional-ownership_iqj8ov.jpg',
    mintedAt: new Date('2024-01-15'),
    totalSupply: 10000,
    fractionalized: true,
    royaltyRate: 50,
  },
  {
    id: '2',
    name: 'Midnight Symphony',
    description: 'A haunting orchestral piece perfect for film and game soundtracks. Features complex harmonies and emotional depth that captures the essence of mystery and wonder.',
    creator: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    imageUrl: 'https://res.cloudinary.com/dagn33ye3/image/upload/v1765194877/fractional-ownership_iqj8ov.jpg',
    mintedAt: new Date('2024-01-20'),
    totalSupply: 5000,
    fractionalized: true,
    royaltyRate: 40,
  },
]

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'fractionalized' | 'new'>('all')
  
  // Use dummy data
  const ipAssets = mockIPAssets
  const totalIPAssets = mockIPAssets.length

  const filteredAssets = useMemo(() => {
    return ipAssets.filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           asset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           asset.creator.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesFilter = filter === 'all' || 
                           (filter === 'fractionalized' && asset.fractionalized) ||
                           (filter === 'new' && new Date().getTime() - asset.mintedAt.getTime() < 7 * 24 * 60 * 60 * 1000)
      
      return matchesSearch && matchesFilter
    })
  }, [searchQuery, filter])

  // Dummy 24h volume
  const volume24h = 12.5

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h1 className="text-5xl font-bold text-white mb-2">Marketplace</h1>
          <p className="text-gray-400">
            {totalIPAssets} IP {totalIPAssets === 1 ? 'Asset' : 'Assets'} Total
          </p>
        </div>
        <div className="flex items-center space-x-3 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
          <TrendingUp className="h-5 w-5 text-white" />
          <span className="text-sm text-white font-medium">
            24h Volume: <span className="text-gray-300">{volume24h.toFixed(2)} IP</span>
          </span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search IP assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-12"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="input-field"
            >
              <option value="all">All Assets</option>
              <option value="fractionalized">Fractionalized</option>
              <option value="new">New This Week</option>
            </select>
          </div>
        </div>
      </div>

      {/* IP Assets Grid */}
      {filteredAssets.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-400 text-lg">No IP assets found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset, index) => (
            <Link
              key={asset.id}
              to={`/ip/${asset.id}`}
              className="card glow-effect group cursor-pointer animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {asset.imageUrl && (
                <div className="relative overflow-hidden rounded-xl mb-4">
                  <img
                    src={asset.imageUrl}
                    alt={asset.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              )}
              <h3 className="text-xl font-bold mb-2 text-white group-hover:text-gray-200 transition-colors">{asset.name}</h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{asset.description}</p>
              <div className="flex justify-between items-center text-sm pt-4 border-t border-white/10">
                <span className="text-gray-400">
                  {asset.fractionalized ? `${asset.totalSupply.toLocaleString()} shares` : 'Not fractionalized'}
                </span>
                <span className="text-white font-semibold bg-white/10 px-3 py-1 rounded-lg">
                  {asset.royaltyRate}% royalty
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
