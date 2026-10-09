 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User,
  Briefcase,

  Clock,

  Camera,
  Upload,
  Save,
  Edit,
  Plus,
  Trash2,

  Award,




} from "lucide-react"






























export default function ProfileServices({ professional, onUpdate }) {
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({})
  const [newSkill, setNewSkill] = useState("")
  const [newCertification, setNewCertification] = useState("")
  const [portfolioFiles, setPortfolioFiles] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (professional) {
      setFormData({
        ...professional,
        skills: professional.skills || [],
        certifications: professional.certifications || [],
        portfolio: professional.portfolio || []
      })
    }
  }, [professional])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()]
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: _optionalChain([prev, 'access', _2 => _2.skills, 'optionalAccess', _3 => _3.filter, 'call', _4 => _4((_, i) => i !== index)]) || []
    }))
  }

  const addCertification = () => {
    if (newCertification.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...(prev.certifications || []), newCertification.trim()]
      }))
      setNewCertification("")
    }
  }

  const removeCertification = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: _optionalChain([prev, 'access', _5 => _5.certifications, 'optionalAccess', _6 => _6.filter, 'call', _7 => _7((_, i) => i !== index)]) || []
    }))
  }

  const handlePortfolioUpload = (event) => {
    const files = Array.from(event.target.files || [])
    setPortfolioFiles(prev => [...prev, ...files])
  }

  const removePortfolioFile = (index) => {
    setPortfolioFiles(prev => prev.filter((_, i) => i !== index))
  }

  const saveProfile = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      // Create FormData for file uploads
      const formDataToSend = new FormData()
      
      // Add text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'portfolio' && value !== undefined) {
          if (Array.isArray(value)) {
            formDataToSend.append(key, JSON.stringify(value))
          } else {
            formDataToSend.append(key, value.toString())
          }
        }
      })

      // Add portfolio files
      portfolioFiles.forEach((file, index) => {
        formDataToSend.append(`portfolio_${index}`, file)
      })

      const response = await fetch("/api/professional/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      if (response.ok) {
        setEditMode(false)
        onUpdate()
        setPortfolioFiles([])
      }
    } catch (error) {
      console.error("Error saving profile:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!professional) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile & Services Management
              </CardTitle>
              <CardDescription>
                Manage your professional profile and service offerings
              </CardDescription>
            </div>
            <Button
              onClick={() => editMode ? saveProfile() : setEditMode(true)}
              disabled={loading}
              className={editMode ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {editMode ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Saving..." : "Save Changes"}
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={formData.profileImage} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                    {_optionalChain([formData, 'access', _8 => _8.name, 'optionalAccess', _9 => _9.charAt, 'call', _10 => _10(0)]) || 'P'}
                  </AvatarFallback>
                </Avatar>
                {editMode && (
                  <div>
                    <Button variant="outline" className="mb-2">
                      <Camera className="w-4 h-4 mr-2" />
                      Change Photo
                    </Button>
                    <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
                  </div>
                )}
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={!editMode}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName || ""}
                    onChange={(e) => handleInputChange("businessName", e.target.value)}
                    disabled={!editMode}
                    placeholder="Your business or company name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={!editMode}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={!editMode}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profession">Profession</Label>
                  <Select 
                    value={formData.profession || ""} 
                    onValueChange={(value) => handleInputChange("profession", value)}
                    disabled={!editMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select profession" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plumber">Plumber</SelectItem>
                      <SelectItem value="electrician">Electrician</SelectItem>
                      <SelectItem value="carpenter">Carpenter</SelectItem>
                      <SelectItem value="painter">Painter</SelectItem>
                      <SelectItem value="cleaner">Cleaner</SelectItem>
                      <SelectItem value="mechanic">Mechanic</SelectItem>
                      <SelectItem value="gardener">Gardener</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Experience</Label>
                  <Select 
                    value={formData.experience || ""} 
                    onValueChange={(value) => handleInputChange("experience", value)}
                    disabled={!editMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1 years">0-1 years</SelectItem>
                      <SelectItem value="1-3 years">1-3 years</SelectItem>
                      <SelectItem value="3-5 years">3-5 years</SelectItem>
                      <SelectItem value="5-10 years">5-10 years</SelectItem>
                      <SelectItem value="10+ years">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city || ""}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    disabled={!editMode}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state || ""}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    disabled={!editMode}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Professional Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  disabled={!editMode}
                  placeholder="Describe your services, experience, and what makes you unique..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Service Details & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate (₹)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={formData.hourlyRate || ""}
                    onChange={(e) => handleInputChange("hourlyRate", parseInt(e.target.value))}
                    disabled={!editMode}
                    placeholder="500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fixedRate">Fixed Service Rate (₹)</Label>
                  <Input
                    id="fixedRate"
                    type="number"
                    value={formData.fixedRate || ""}
                    onChange={(e) => handleInputChange("fixedRate", parseInt(e.target.value))}
                    disabled={!editMode}
                    placeholder="1500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  value={formData.specialization || ""}
                  onChange={(e) => handleInputChange("specialization", e.target.value)}
                  disabled={!editMode}
                  placeholder="e.g., Kitchen plumbing, Electrical wiring, Furniture repair"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceAreas">Service Areas</Label>
                <Input
                  id="serviceAreas"
                  value={formData.serviceAreas || ""}
                  onChange={(e) => handleInputChange("serviceAreas", e.target.value)}
                  disabled={!editMode}
                  placeholder="e.g., Mumbai Central, Bandra, Andheri"
                />
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <Label>Skills & Expertise</Label>
                <div className="flex flex-wrap gap-2">
                  {_optionalChain([formData, 'access', _11 => _11.skills, 'optionalAccess', _12 => _12.map, 'call', _13 => _13((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      {editMode && (
                        <button
                          onClick={() => removeSkill(index)}
                          className="ml-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  ))])}
                </div>
                {editMode && (
                  <div className="flex gap-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill"
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <Button onClick={addSkill} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Certifications */}
              <div className="space-y-4">
                <Label>Certifications & Licenses</Label>
                <div className="space-y-2">
                  {_optionalChain([formData, 'access', _14 => _14.certifications, 'optionalAccess', _15 => _15.map, 'call', _16 => _16((cert, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-blue-600" />
                        <span>{cert}</span>
                      </div>
                      {editMode && (
                        <button
                          onClick={() => removeCertification(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))])}
                </div>
                {editMode && (
                  <div className="flex gap-2">
                    <Input
                      value={newCertification}
                      onChange={(e) => setNewCertification(e.target.value)}
                      placeholder="Add certification or license"
                      onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                    />
                    <Button onClick={addCertification} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Portfolio & Work Samples
              </CardTitle>
              <CardDescription>
                Showcase your best work to attract more customers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Existing Portfolio */}
              {formData.portfolio && formData.portfolio.length > 0 && (
                <div className="space-y-4">
                  <Label>Current Portfolio</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {formData.portfolio.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Portfolio ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        {editMode && (
                          <button className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload New Images */}
              {editMode && (
                <div className="space-y-4">
                  <Label>Add New Images</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePortfolioUpload}
                      className="hidden"
                      id="portfolio-upload"
                    />
                    <label htmlFor="portfolio-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Click to upload images or drag and drop</p>
                      <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 5MB each</p>
                    </label>
                  </div>

                  {/* Preview New Files */}
                  {portfolioFiles.length > 0 && (
                    <div className="space-y-2">
                      <Label>New Images to Upload</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {portfolioFiles.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`New ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removePortfolioFile(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Availability Tab */}
        <TabsContent value="availability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Availability & Working Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="workingHours">Working Hours</Label>
                <Input
                  id="workingHours"
                  value={formData.workingHours || ""}
                  onChange={(e) => handleInputChange("workingHours", e.target.value)}
                  disabled={!editMode}
                  placeholder="e.g., Mon-Sat 9AM-6PM, Sunday 10AM-4PM"
                />
              </div>

              {/* Quick Working Hours Templates */}
              {editMode && (
                <div className="space-y-4">
                  <Label>Quick Templates</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleInputChange("workingHours", "Mon-Fri 9AM-6PM")}
                    >
                      Weekdays Only
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleInputChange("workingHours", "Mon-Sat 9AM-6PM")}
                    >
                      Monday to Saturday
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleInputChange("workingHours", "Mon-Sun 8AM-8PM")}
                    >
                      7 Days a Week
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleInputChange("workingHours", "24/7 Emergency Service")}
                    >
                      24/7 Emergency
                    </Button>
                  </div>
                </div>
              )}

              {/* Response Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Average Response Time</Label>
                  <Select disabled={!editMode}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select response time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Within 1 hour</SelectItem>
                      <SelectItem value="same-day">Same day</SelectItem>
                      <SelectItem value="next-day">Next day</SelectItem>
                      <SelectItem value="2-3-days">2-3 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Emergency Services</Label>
                  <Select disabled={!editMode}>
                    <SelectTrigger>
                      <SelectValue placeholder="Emergency availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Available 24/7</SelectItem>
                      <SelectItem value="limited">Limited hours</SelectItem>
                      <SelectItem value="no">Not available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
