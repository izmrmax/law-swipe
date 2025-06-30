import apiClient from './apiclient';
import aiClient from './aiClient';

const mutualListeners = new Set()

export async function getMatches(filters) {
  let profiles = []
  try {
    const response = await apiClient.post('/matches/filter', filters)
    profiles = Array.isArray(response.data.profiles) ? response.data.profiles : []
  } catch (error) {
    console.error('Error fetching match filters:', error)
    return []
  }

  if (profiles.length === 0) {
    return profiles
  }

  try {
    const rankResponse = await aiClient.post('/matches/rank', { lawyers: profiles, filters })
    const ranking = Array.isArray(rankResponse.data.ranking) ? rankResponse.data.ranking : []
    const profileMap = new Map(profiles.map(p => [p.id, p]))
    const ranked = ranking.map(id => profileMap.get(id)).filter(Boolean)
    const rankingSet = new Set(ranking)
    const remaining = profiles.filter(p => !rankingSet.has(p.id))
    return [...ranked, ...remaining]
  } catch (error) {
    console.error('Error fetching AI ranking:', error)
    return profiles
  }
}

export async function swipeRight(lawyerId) {
  try {
    const response = await apiClient.post('/matches/swipe', {
      lawyerId,
      direction: 'right'
    })
    const data = response.data
    if (data.mutualMatch) {
      mutualListeners.forEach(cb => {
        try {
          cb({ lawyerId, matchData: data.matchData })
        } catch (cbError) {
          console.error('Error in mutual match listener callback:', cbError)
        }
      })
    }
    return data
  } catch (error) {
    console.error(`Error swiping right on lawyer ${lawyerId}:`, error)
    throw new Error('Failed to swipe right')
  }
}

export function onMutualMatch(callback) {
  if (typeof callback === 'function') {
    mutualListeners.add(callback)
  }
}

export function offMutualMatch(callback) {
  mutualListeners.delete(callback)
}