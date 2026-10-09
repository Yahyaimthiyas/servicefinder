 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ShoppingCart,
  Package,

  Search,

  Star,
  MapPin,
  Clock,
  Truck,
  Plus,
  Heart,
  Share2,
  MessageSquare,





} from "lucide-react"

























export default function Marketplace() {
  const [items, setItems] = useState([])
  const [myListings, setMyListings] = useState([])
  const [cart, setCart] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [conditionFilter, setConditionFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)

  useEffect(() => {
    fetchMarketplaceItems()
    fetchMyListings()
  }, [])

  const fetchMarketplaceItems = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/professional/marketplace", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setItems(data.items || [])
      } else if (response.status === 401) {
        console.error("Unauthorized to fetch marketplace items:", response.statusText)
        // Clear token and redirect to login page
        localStorage.removeItem("token")
        window.location.href = "/login"
      } else {
        console.error("Failed to fetch marketplace items:", response.statusText)
        // Keep empty array - no mock data
        setItems([])
      }
    } catch (error) {
      console.error("Error fetching marketplace items:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyListings = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/professional/marketplace/my-listings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setMyListings(data.listings || [])
      } else {
        console.error("Failed to fetch user listings:", response.statusText)
        // Keep empty array - no mock data
        setMyListings([])
      }
    } catch (error) {
      console.error("Error fetching my listings:", error)
    }
  }

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.item._id === item._id)
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.item._id === item._id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ))
    } else {
      setCart([...cart, { item, quantity: 1 }])
    }
  }

  const removeFromCart = (itemId) => {
    setCart(cart.filter(cartItem => cartItem.item._id !== itemId))
  }

  const getTotalCartValue = () => {
    return cart.reduce((total, cartItem) => total + (cartItem.item.price * cartItem.quantity), 0)
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
    const matchesCondition = conditionFilter === "all" || item.condition === conditionFilter
    
    return matchesSearch && matchesCategory && matchesCondition
  })

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'new': return 'bg-green-100 text-green-800'
      case 'used': return 'bg-blue-100 text-blue-800'
      case 'refurbished': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading marketplace...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-orange-600 to-red-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Professional Marketplace</h2>
              <p className="text-orange-100 mb-4">
                Buy and sell tools, materials, and equipment with fellow professionals
              </p>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <Package className="w-3 h-3 mr-1" />
                  {items.length} Items Available
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  {cart.length} in Cart
                </Badge>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-16 h-16 text-white/80" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Items</TabsTrigger>
          <TabsTrigger value="my-listings">My Listings</TabsTrigger>
          <TabsTrigger value="cart">Cart ({cart.length})</TabsTrigger>
        </TabsList>

        {/* Browse Items Tab */}
        <TabsContent value="browse" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search tools, materials, equipment..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="tools">Tools</SelectItem>
                    <SelectItem value="materials">Materials</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="safety">Safety Gear</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={conditionFilter} onValueChange={setConditionFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Conditions</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                    <SelectItem value="refurbished">Refurbished</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item._id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {/* Item Image */}
                  <div className="relative h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-400" />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button variant="ghost" size="sm" className="bg-white/80">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="bg-white/80">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Badge className={`absolute top-2 left-2 ${getConditionColor(item.condition)}`}>
                      {item.condition}
                    </Badge>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-green-600">₹{item.price.toLocaleString()}</div>
                      <Badge variant="outline">{item.category}</Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">{item.sellerName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{item.sellerName}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span>{item.sellerRating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{item.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(item.postedDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="flex-1" onClick={() => setSelectedItem(item)}>
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{_optionalChain([selectedItem, 'optionalAccess', _ => _.title])}</DialogTitle>
                          </DialogHeader>
                          {selectedItem && (
                            <div className="space-y-4">
                              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Package className="w-24 h-24 text-gray-400" />
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Details</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span>Price:</span>
                                      <span className="font-bold text-green-600">₹{selectedItem.price.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Condition:</span>
                                      <Badge className={getConditionColor(selectedItem.condition)}>
                                        {selectedItem.condition}
                                      </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Category:</span>
                                      <span>{selectedItem.category}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Location:</span>
                                      <span>{selectedItem.location}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-semibold mb-2">Seller Info</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                      <Avatar className="w-8 h-8">
                                        <AvatarFallback>{selectedItem.sellerName.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium">{selectedItem.sellerName}</p>
                                        <div className="flex items-center gap-1">
                                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                          <span>{selectedItem.sellerRating} rating</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-2">Description</h4>
                                <p className="text-sm text-gray-700">{selectedItem.description}</p>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button onClick={() => addToCart(selectedItem)} className="flex-1">
                                  <ShoppingCart className="w-4 h-4 mr-2" />
                                  Add to Cart
                                </Button>
                                <Button variant="outline">
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  Contact Seller
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button onClick={() => addToCart(item)}>
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* My Listings Tab */}
        <TabsContent value="my-listings" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Listings</CardTitle>
                  <CardDescription>Manage your marketplace listings</CardDescription>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {myListings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>You haven't listed any items yet</p>
                  <Button className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Listing
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myListings.map((item) => (
                    <div key={item._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{item.title}</h4>
                          <p className="text-sm text-gray-600">₹{item.price.toLocaleString()}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{item.views} views</span>
                            <span>•</span>
                            <span>{item.likes} likes</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cart Tab */}
        <TabsContent value="cart" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shopping Cart</CardTitle>
              <CardDescription>Review your selected items</CardDescription>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((cartItem) => (
                    <div key={cartItem.item._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{cartItem.item.title}</h4>
                          <p className="text-sm text-gray-600">₹{cartItem.item.price.toLocaleString()} each</p>
                          <p className="text-xs text-gray-500">Quantity: {cartItem.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{(cartItem.item.price * cartItem.quantity).toLocaleString()}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => removeFromCart(cartItem.item._id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Total: ₹{getTotalCartValue().toLocaleString()}</span>
                      <Button size="lg">
                        <Truck className="w-4 h-4 mr-2" />
                        Proceed to Checkout
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
