export const MAX_INTERESTS = 3

export const INTEREST_OPTIONS = [
  {
    id: 'fantasy',
    label: 'Fantasía',
    symbol: '✧',
    description: 'Mundos imposibles y magia',
    image:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'science-fiction',
    label: 'Ciencia ficción',
    symbol: '☄',
    description: 'Futuros, ciencia y tecnología',
    image:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'romance',
    label: 'Romance',
    symbol: '♡',
    description: 'Vínculos y emociones',
    image:
      'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'mystery',
    label: 'Misterio',
    symbol: '⌕',
    description: 'Secretos por resolver',
    image:
      'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'history',
    label: 'Historia',
    symbol: '◷',
    description: 'Épocas y hechos reales',
    image:
      'https://images.unsplash.com/photo-1461360228754-6e81c478b882?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'adventure',
    label: 'Aventura',
    symbol: '↗',
    description: 'Viajes y grandes retos',
    image:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80',
  },
]

export function getInterestLabel(interestId) {
  return INTEREST_OPTIONS.find((interest) => interest.id === interestId)?.label ?? interestId
}
