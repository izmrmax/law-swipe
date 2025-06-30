import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useSwipeable } from 'react-swipeable'
import matchService from './matchservice'
import ProfileCard from './profilecard'

const SwipeProfileCardStack = ({ profiles = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [swipeDirection, setSwipeDirection] = useState(null)
  const timeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setCurrentIndex(0)
    setSwipeDirection(null)
  }, [profiles])

  const handlers = useSwipeable({
    onSwiped: ({ dir }) => {
      if (swipeDirection !== null) return
      if (currentIndex >= profiles.length) return
      const currentProfile = profiles[currentIndex]
      if (dir === 'Right') {
        matchService.swipeRight(currentProfile.id)
        setSwipeDirection('right')
      } else if (dir === 'Left') {
        matchService.swipeLeft(currentProfile.id)
        setSwipeDirection('left')
      } else {
        return
      }
      timeoutRef.current = setTimeout(() => {
        setSwipeDirection(null)
        setCurrentIndex((i) => i + 1)
      }, 300)
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  })

  const cardsToRender = useMemo(() => {
    return profiles.slice(currentIndex, currentIndex + 2)
  }, [profiles, currentIndex])

  if (currentIndex >= profiles.length) {
    return null
  }

  return (
    <div
      {...handlers}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
      }}
    >
      {cardsToRender.map((profile, idx) => {
        const isTop = idx === 0
        const baseStyle = {
          position: 'absolute',
          width: '100%',
          height: '100%',
          willChange: 'transform',
        }
        let style = baseStyle
        if (isTop && swipeDirection) {
          const xOffset = swipeDirection === 'right' ? '100%' : '-100%'
          const rotation = swipeDirection === 'right' ? 20 : -20
          style = {
            ...baseStyle,
            transform: `translateX(${xOffset}) rotate(${rotation}deg)`,
            transition: 'transform 300ms ease',
          }
        }
        return (
          <ProfileCard
            key={profile.id}
            profile={profile}
            style={style}
          />
        )
      })}
    </div>
  )
}

export default SwipeProfileCardStack