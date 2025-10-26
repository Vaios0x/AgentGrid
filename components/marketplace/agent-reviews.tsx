'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { NeuralCard } from '../ui/neural-card'
import { Button } from '../ui/button'
import { Star, ThumbsUp, ThumbsDown, MoreHorizontal } from 'lucide-react'

interface Review {
  id: string
  user: {
    name: string
    address: string
    avatar: string
  }
  rating: number
  comment: string
  date: string
  helpful: number
  verified: boolean
}

const mockReviews: Review[] = [
  {
    id: '1',
    user: {
      name: 'CryptoTrader123',
      address: '0x1234...5678',
      avatar: '/avatars/1.jpg'
    },
    rating: 5,
    comment: 'Excellent portfolio optimization! The agent helped me increase my returns by 23% while reducing risk. Highly recommended for anyone serious about crypto investing.',
    date: '2024-01-10',
    helpful: 12,
    verified: true
  },
  {
    id: '2',
    user: {
      name: 'DeFiMax',
      address: '0xabcd...efgh',
      avatar: '/avatars/2.jpg'
    },
    rating: 4,
    comment: 'Great agent for portfolio management. The rebalancing feature works perfectly and the interface is intuitive. Only minor issue was response time during high volatility.',
    date: '2024-01-08',
    helpful: 8,
    verified: true
  },
  {
    id: '3',
    user: {
      name: 'BlockchainPro',
      address: '0x9876...5432',
      avatar: '/avatars/3.jpg'
    },
    rating: 5,
    comment: 'Outstanding performance! This agent saved me hours of manual work and the results speak for themselves. My portfolio is now perfectly balanced and optimized.',
    date: '2024-01-05',
    helpful: 15,
    verified: false
  },
  {
    id: '4',
    user: {
      name: 'CryptoNewbie',
      address: '0x1111...2222',
      avatar: '/avatars/4.jpg'
    },
    rating: 3,
    comment: 'Good agent overall, but I had some issues with the risk analysis. It seemed to be too conservative for my risk tolerance. Otherwise, solid performance.',
    date: '2024-01-03',
    helpful: 3,
    verified: true
  }
]

export function AgentReviews({ agentId }: { agentId: string }) {
  const [reviews, setReviews] = useState<Review[]>(mockReviews)
  const [showAll, setShowAll] = useState(false)

  const handleHelpful = (reviewId: string) => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { ...review, helpful: review.helpful + 1 }
        : review
    ))
  }

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  const totalReviews = reviews.length

  const displayedReviews = showAll ? reviews : reviews.slice(0, 3)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <NeuralCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">Reviews & Ratings</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(averageRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-400'
                    }`}
                  />
                ))}
              </div>
              <span className="text-white font-semibold">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-gray-400">
                ({totalReviews} reviews)
              </span>
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviews.filter(r => r.rating === rating).length
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
                
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm text-gray-400 w-8">{rating}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-400 w-8">{count}</span>
                  </div>
                )
              })}
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      i < Math.floor(averageRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-400'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-400">
                Based on {totalReviews} reviews
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {displayedReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="border-b border-white/10 pb-6 last:border-b-0"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold">
                    {review.user.name.charAt(0)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-white font-semibold">
                        {review.user.name}
                      </h4>
                      <span className="text-xs text-gray-400">
                        {review.user.address}
                      </span>
                      {review.verified && (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/30">
                          Verified
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-400'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-400">
                        {review.date}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 leading-relaxed mb-4">
                      {review.comment}
                    </p>
                    
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleHelpful(review.id)}
                        className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        Helpful ({review.helpful})
                      </button>
                      
                      <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
                        <ThumbsDown className="w-4 h-4" />
                        Not helpful
                      </button>
                      
                      <button className="text-sm text-gray-400 hover:text-white transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Show More/Less Button */}
          {reviews.length > 3 && (
            <div className="text-center mt-6">
              <Button
                onClick={() => setShowAll(!showAll)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                {showAll ? 'Show Less' : `Show All ${totalReviews} Reviews`}
              </Button>
            </div>
          )}
        </div>
      </NeuralCard>
    </motion.div>
  )
}
