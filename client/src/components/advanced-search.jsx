import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Star, Filter } from "lucide-react"















export function AdvancedSearch({ onSearch }) {
  const [filters, setFilters] = useState({
    query: "",
    location: "",
    category: "",
    priceRange: [0, 200],
    rating: 0,
    availability: "",
    verified: false,
  })

  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSearch = () => {
    onSearch(filters)
  }

  const categories = [
    "Plumbing",
    "Electrical",
    "Cleaning",
    "Landscaping",
    "Painting",
    "Carpentry",
    "HVAC",
    "Roofing",
    "Flooring",
    "Moving",
  ]

  return (
    <Card className="w-full bg-white border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Search className="h-5 w-5 text-blue-600" />
          Find the Perfect Professional
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="query" className="text-gray-700">
              What do you need?
            </Label>
            <Input
              id="query"
              placeholder="e.g., Fix leaky faucet"
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              className="bg-white border-gray-300"
            />
          </div>
          <div>
            <Label htmlFor="location" className="text-gray-700">
              Location
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="location"
                placeholder="Enter city or zip code"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="pl-10 bg-white border-gray-300"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="category" className="text-gray-700">
              Category
            </Label>
            <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
              <SelectTrigger className="bg-white border-gray-300">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                <SelectItem value="" className="hover:bg-gray-50">
                  All categories
                </SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category} className="hover:bg-gray-50">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showAdvanced ? "Hide" : "Show"} Advanced Filters
          </Button>
          <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Search className="h-4 w-4 mr-2" />
            Search Professionals
          </Button>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
            <div>
              <Label className="text-gray-700">Price Range (per hour)</Label>
              <div className="px-3 py-4">
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => setFilters({ ...filters, priceRange: value  })}
                  max={200}
                  min={0}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>${filters.priceRange[0]}</span>
                  <span>${filters.priceRange[1]}+</span>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-gray-700">Minimum Rating</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    variant={filters.rating >= rating ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilters({ ...filters, rating })}
                    className="flex items-center gap-1"
                  >
                    <Star className="h-3 w-3" />
                    {rating}+
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-gray-700">Availability</Label>
              <Select
                value={filters.availability}
                onValueChange={(value) => setFilters({ ...filters, availability: value })}
              >
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue placeholder="Any time" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="" className="hover:bg-gray-50">
                    Any time
                  </SelectItem>
                  <SelectItem value="today" className="hover:bg-gray-50">
                    Available today
                  </SelectItem>
                  <SelectItem value="week" className="hover:bg-gray-50">
                    This week
                  </SelectItem>
                  <SelectItem value="weekend" className="hover:bg-gray-50">
                    Weekends
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="verified"
                type="checkbox"
                checked={filters.verified}
                onChange={(e) => setFilters({ ...filters, verified: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
              />
              <Label htmlFor="verified" className="text-gray-700">
                Verified professionals only
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                  Recommended
                </Badge>
              </Label>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
