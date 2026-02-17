import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface AdvisorySearchProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export function AdvisorySearch({ onSearch, placeholder = 'Search advisories...' }: AdvisorySearchProps) {
  const [query, setQuery] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    onSearch(value)
  }

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
      <Input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-10 bg-gray-900/50 border-gray-800 focus:border-teal-500 text-white placeholder:text-gray-500"
      />
    </div>
  )
}
