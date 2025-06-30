import React, { useState, useRef, useCallback } from 'react'
import apiClient from './apiclient'

export function useCaseIntakeAiLawyerRanker() {
  const [rankedLawyerIds, setRankedLawyerIds] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const requestIdRef = useRef(0)

  const analyzeCase = useCallback(async (caseData) => {
    if (!caseData || typeof caseData !== 'object') {
      const err = new Error('No valid case data provided for analysis.')
      setError(err)
      setRankedLawyerIds([])
      throw err
    }

    setLoading(true)
    setError(null)
    setRankedLawyerIds([])
    requestIdRef.current += 1
    const currentRequestId = requestIdRef.current

    try {
      const response = await apiClient.post('/ai/analyze', caseData)
      const data = response?.data
      if (!data || !Array.isArray(data.rankedLawyerIds)) {
        throw new Error('Unexpected response format from AI analysis.')
      }
      if (currentRequestId === requestIdRef.current) {
        setRankedLawyerIds(data.rankedLawyerIds)
      }
      return data.rankedLawyerIds
    } catch (err) {
      if (currentRequestId === requestIdRef.current) {
        setError(err)
        setRankedLawyerIds([])
      }
      throw err
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false)
      }
    }
  }, [])

  return { analyzeCase, rankedLawyerIds, loading, error }
}

export default useCaseIntakeAiLawyerRanker