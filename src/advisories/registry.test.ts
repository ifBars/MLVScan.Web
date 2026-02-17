import { describe, it, expect } from 'vitest'
import {
  allAdvisories,
  getAdvisoryBySlug,
  getAdvisoriesByType,
  sortAdvisoriesByDate,
  advisoriesByYear,
  sortedYears,
  getTypeLabel,
} from './registry'
import type { AdvisoryType } from './types'

describe('Advisory Registry', () => {
  describe('allAdvisories', () => {
    it('should be an array', () => {
      expect(Array.isArray(allAdvisories)).toBe(true)
    })

    it('should have at least one example advisory', () => {
      expect(allAdvisories.length).toBeGreaterThanOrEqual(1)
    })

    it('should have valid metadata structure', () => {
      allAdvisories.forEach(advisory => {
        expect(advisory).toHaveProperty('id')
        expect(advisory).toHaveProperty('title')
        expect(advisory).toHaveProperty('slug')
        expect(advisory).toHaveProperty('type')
        expect(advisory).toHaveProperty('publishedDate')
        expect(advisory).toHaveProperty('description')
        expect(advisory).toHaveProperty('contentPath')
        expect(advisory).toHaveProperty('keywords')
      })
    })
  })

  describe('getAdvisoryBySlug', () => {
    it('should return advisory for valid slug', () => {
      const advisory = getAdvisoryBySlug('2026-02-false-positive-lethallizard-modmanager')
      expect(advisory).toBeDefined()
      expect(advisory?.title).toBe('False Positive: LethalLizard.ModManager Process.Start Usage')
    })

    it('should return undefined for invalid slug', () => {
      const advisory = getAdvisoryBySlug('non-existent-slug')
      expect(advisory).toBeUndefined()
    })
  })

  describe('getAdvisoriesByType', () => {
    it('should filter by type', () => {
      const falsePositiveAdvisories = getAdvisoriesByType('false-positive' as AdvisoryType)
      expect(falsePositiveAdvisories.length).toBeGreaterThanOrEqual(1)
      falsePositiveAdvisories.forEach(a => {
        expect(a.type).toBe('false-positive')
      })
    })

    it('should return empty array for types with no advisories', () => {
      const bypassAdvisories = getAdvisoriesByType('bypass-incident' as AdvisoryType)
      expect(bypassAdvisories).toEqual([])
    })
  })



  describe('sortAdvisoriesByDate', () => {
    it('should sort by date descending by default', () => {
      const sorted = sortAdvisoriesByDate()
      for (let i = 0; i < sorted.length - 1; i++) {
        const dateA = new Date(sorted[i].publishedDate).getTime()
        const dateB = new Date(sorted[i + 1].publishedDate).getTime()
        expect(dateA).toBeGreaterThanOrEqual(dateB)
      }
    })

    it('should sort by date ascending when specified', () => {
      const sorted = sortAdvisoriesByDate(false)
      for (let i = 0; i < sorted.length - 1; i++) {
        const dateA = new Date(sorted[i].publishedDate).getTime()
        const dateB = new Date(sorted[i + 1].publishedDate).getTime()
        expect(dateA).toBeLessThanOrEqual(dateB)
      }
    })
  })

  describe('advisoriesByYear', () => {
    it('should group advisories by year', () => {
      const grouped = advisoriesByYear()
      expect(Object.keys(grouped).length).toBeGreaterThanOrEqual(1)
      
      Object.entries(grouped).forEach(([year, advisories]) => {
        expect(Array.isArray(advisories)).toBe(true)
        advisories.forEach(a => {
          const advisoryYear = new Date(a.publishedDate).getFullYear()
          expect(advisoryYear).toBe(Number(year))
        })
      })
    })

    it('should sort advisories within each year by date descending', () => {
      const grouped = advisoriesByYear()
      Object.values(grouped).forEach(advisories => {
        for (let i = 0; i < advisories.length - 1; i++) {
          const dateA = new Date(advisories[i].publishedDate).getTime()
          const dateB = new Date(advisories[i + 1].publishedDate).getTime()
          expect(dateA).toBeGreaterThanOrEqual(dateB)
        }
      })
    })
  })

  describe('sortedYears', () => {
    it('should return years in descending order', () => {
      const years = sortedYears()
      for (let i = 0; i < years.length - 1; i++) {
        expect(years[i]).toBeGreaterThanOrEqual(years[i + 1])
      }
    })
  })

  describe('getTypeLabel', () => {
    it('should return human-readable labels', () => {
      expect(getTypeLabel('malware-analysis')).toBe('Malware Analysis')
      expect(getTypeLabel('bypass-incident')).toBe('Scanner Bypass')
      expect(getTypeLabel('false-positive')).toBe('False Positive')
      expect(getTypeLabel('security-update')).toBe('Security Update')
    })
  })
})
