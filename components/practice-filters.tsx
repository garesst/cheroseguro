'use client'

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { getPracticeCategories, getFeaturedPracticeCategories, type Practice, type PracticeCategory } from "@/lib/directus"

interface PracticeFiltersProps {
  practices: Practice[]
  onFilterChange: (filtered: Practice[]) => void
}

export function PracticeFilters({ 
  practices, 
  onFilterChange 
}: PracticeFiltersProps) {
  const [categories, setCategories] = useState<PracticeCategory[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("")
  const [loading, setLoading] = useState(true)

  // Load practice categories from Directus
  useEffect(() => {
    async function loadCategories() {
      try {
        const [allCategories, featuredCategories] = await Promise.all([
          getPracticeCategories(),
          getFeaturedPracticeCategories()
        ])
        
        // Prioritize featured categories first, then add non-featured ones
        const sortedCategories = [
          ...featuredCategories,
          ...allCategories.filter(cat => !featuredCategories.some(featured => featured.id === cat.id))
        ]
        
        setCategories(sortedCategories)
      } catch (error) {
        console.error('Error loading practice categories:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  // Filter practices based on selected criteria
  useEffect(() => {
    let filtered = practices

    // Filter by categories (many-to-many relationship)
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(practice => 
        practice.practice_categories?.some(cat => 
          selectedCategories.includes(cat.id)
        )
      )
    }

    // Filter by difficulty
    if (selectedDifficulty) {
      filtered = filtered.filter(practice => 
        practice.difficulty === selectedDifficulty
      )
    }

    onFilterChange(filtered)
  }, [selectedCategories, selectedDifficulty, practices, onFilterChange])

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const toggleDifficulty = (difficulty: string) => {
    setSelectedDifficulty(prev => prev === difficulty ? "" : difficulty)
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedDifficulty("")
  }

  const hasActiveFilters = selectedCategories.length > 0 || selectedDifficulty

  if (loading) {
    return (
      <div className="space-y-6 p-4 bg-white rounded-lg border">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-8 bg-gray-200 rounded w-20"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg border">
      {/* Practice Categories */}
      <div>
        <h3 className="font-medium mb-3 flex items-center gap-2">
          🎯 Categories
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {categories.slice(0, 6).map(category => (
            <Button
              key={category.id}
              variant={selectedCategories.includes(category.id) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleCategory(category.id)}
              className="justify-start text-left h-auto p-3"
              style={{
                backgroundColor: selectedCategories.includes(category.id) 
                  ? category.color 
                  : 'transparent',
                borderColor: `${category.color}40`,
                color: selectedCategories.includes(category.id) 
                  ? 'white' 
                  : category.color
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{category.icon}</span>
                <div>
                  <div className="text-xs font-medium">{category.name}</div>
                  {category.is_featured && (
                    <div className="text-xs opacity-75">Featured</div>
                  )}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Difficulty Filter */}
      <div>
        <h3 className="font-medium mb-3 flex items-center gap-2">
          ⚡ Difficulty
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { level: "beginner", emoji: "🟢", label: "Beginner" },
            { level: "intermediate", emoji: "🟡", label: "Intermediate" }, 
            { level: "advanced", emoji: "🔴", label: "Advanced" }
          ].map(({ level, emoji, label }) => (
            <Button
              key={level}
              variant={selectedDifficulty === level ? "default" : "outline"}
              size="sm"
              onClick={() => toggleDifficulty(level)}
              className="flex items-center gap-1"
            >
              <span>{emoji}</span>
              <span className="text-xs">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <>
          <Separator />
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm">Active Filters</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="text-xs h-6 px-2"
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map(catId => {
                const category = categories.find(c => c.id === catId)
                return category ? (
                  <Badge 
                    key={catId}
                    variant="secondary"
                    className="cursor-pointer text-xs flex items-center gap-1"
                    onClick={() => toggleCategory(catId)}
                    style={{ 
                      backgroundColor: `${category.color}15`, 
                      color: category.color,
                      borderColor: `${category.color}30`
                    }}
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                    <span>×</span>
                  </Badge>
                ) : null
              })}
              {selectedDifficulty && (
                <Badge 
                  variant="secondary"
                  className="cursor-pointer text-xs flex items-center gap-1"
                  onClick={() => setSelectedDifficulty("")}
                >
                  <span>⚡</span>
                  <span className="capitalize">{selectedDifficulty}</span>
                  <span>×</span>
                </Badge>
              )}
            </div>
          </div>
        </>
      )}

      {/* Filter Stats */}
      <div className="text-xs text-muted-foreground pt-2 border-t">
        Showing {practices.length} practice{practices.length !== 1 ? 's' : ''}
        {hasActiveFilters && (
          <span> (filtered from total)</span>
        )}
      </div>
    </div>
  )
}