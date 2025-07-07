"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Car,
  CheckCircle,
  DollarSign,
  Download,
  MapPin,
  Play,
  User,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Info,
  Upload,
  X,
} from "lucide-react"
import { imageUrlToBase64 } from "@/lib/utils"

// --- Schema & helpers -------------------------------------------------
const operationCanonical = (o: string) => {
  const op = o.toLowerCase()
  if (op.includes("replace")) return "Replace"
  if (op.includes("r&i") || op.includes("install")) return "R&I"
  if (op.includes("repaint") || op.includes("paint")) return "Repaint"
  return "Repair"
}

const confidenceCanonical = (c: string) =>
  /requires/i.test(c) ? "Requires Investigation" : /review/i.test(c) ? "Review Suggested" : "System Confident"

// Damage item type
type DamageItem = {
  id: string
  item: string
  description: string
  operation: "Repair" | "Replace" | "R&I" | "Repaint"
  laborHours: number
  laborRate: number
  partsEstimate: number
  total: number
  confidence: "System Confident" | "Review Suggested" | "Requires Investigation"
  source: string
  manuallyEdited?: boolean
}

// Media item type
type MediaItem = {
  type: "image" | "video"
  name: string
  url: string
  timestamp: string
  duration?: string
  file?: File
}

// ----------------------------------------------------------------------

// Extended mock data for detailed claim view
const getClaimDetails = (claim: any) => ({
  ...claim,
  policyHolder: {
    name: claim.customerName,
    policyNumber: "POL-2024-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
    phone: "(555) 123-4567",
    email: claim.customerName.toLowerCase().replace(" ", ".") + "@email.com",
    address: "123 Main Street, Anytown, ST 12345",
    dateOfBirth: "1985-03-15",
    licenseNumber: "DL123456789",
  },
  vehicle:
    claim.id === "CLM-2025-004"
      ? {
          year: 2021,
          make: "Mazda",
          model: "CX-30",
          vin: "JM3DKFB77M0123456",
          licensePlate: "ABC-1234",
          color: "Silver",
          mileage: "28,450",
        }
      : {
          year: 2020,
          make: "Toyota",
          model: "Camry",
          vin: "1HGBH41JXMN109186",
          licensePlate: "ABC-1234",
          color: "Silver",
          mileage: "45,230",
        },
  accident: {
    date: claim.dateSubmitted,
    time: "2:30 PM",
    location: "Highway 101, Mile Marker 45",
    weather: "Clear",
    roadConditions: "Dry",
    policeReport: "RPT-2024-001234",
    description: claim.description,
    otherParties: [
      {
        name: "Robert Wilson",
        insurance: "State Farm",
        vehicle: "2019 Honda Accord",
        licensePlate: "XYZ-9876",
      },
    ],
  },
  media:
    claim.id === "CLM-2025-004"
      ? [
          {
            type: "image",
            name: "image_1.jpg",
            url: "/images/image_1.jpeg",
            timestamp: "2024-01-12 15:20",
          },
        ]
      : [
          {
            type: "image",
            name: "front_damage.jpg",
            url: "/placeholder.svg?height=200&width=300",
            timestamp: "2024-01-15 14:35",
          },
          {
            type: "image",
            name: "rear_damage.jpg",
            url: "/placeholder.svg?height=200&width=300",
            timestamp: "2024-01-15 14:36",
          },
          {
            type: "image",
            name: "side_view.jpg",
            url: "/placeholder.svg?height=200&width=300",
            timestamp: "2024-01-15 14:37",
          },
          {
            type: "video",
            name: "accident_scene.mp4",
            url: "/placeholder.svg?height=200&width=300",
            timestamp: "2024-01-15 14:40",
            duration: "0:45",
          },
        ],
  damages: claim.id === "CLM-2025-004"
    ? []
    :[
    {
      id: "1",
      item: "Front Bumper",
      description: "Cracked and dented, needs replacement",
      laborHours: 3,
      laborRate: 85,
      partsEstimate: 450,
      total: 705,
      operation: "Replace" as const,
      confidence: "System Confident" as const,
      source: "Mitchell Collision Repair Manual, Section 12.3 - Front End Components",
    },
    {
      id: "2",
      item: "Headlight Assembly (Right)",
      description: "Broken lens and housing",
      laborHours: 1.5,
      laborRate: 85,
      partsEstimate: 280,
      total: 407.5,
      operation: "Replace" as const,
      confidence: "System Confident" as const,
      source: "OEM Parts Database - Mazda CX-30 2021 Headlight Assembly P/N: KD53-51-041",
    },
    {
      id: "3",
      item: "Hood",
      description: "Minor dents, paintwork required",
      laborHours: 4,
      laborRate: 85,
      partsEstimate: 0,
      total: 340,
      operation: "Repair" as const,
      confidence: "Review Suggested" as const,
      source: "I-CAR Collision Repair Procedures - Hood Dent Repair Guidelines",
    },
    {
      id: "4",
      item: "Paint Work",
      description: "Touch-up and blending for affected areas",
      laborHours: 6,
      laborRate: 85,
      partsEstimate: 150,
      total: 660,
      operation: "Repaint" as const,
      confidence: "System Confident" as const,
      source: "PPG Refinish Manual - Multi-Stage Paint System Application",
    },
  ],
})

interface ClaimReviewPageProps {
  claim: any
}

export function ClaimReviewPage({ claim }: ClaimReviewPageProps) {
  const [claimDetails, setClaimDetails] = useState(() => getClaimDetails(claim))
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"add" | "edit">("add")
  const [editingDamage, setEditingDamage] = useState<DamageItem | null>(null)
  const [formData, setFormData] = useState<Partial<DamageItem>>({})
  const [isEstimatingCosts, setIsEstimatingCosts] = useState(false)
  const [showSourceField, setShowSourceField] = useState(false)
  const [hasAiEstimate, setHasAiEstimate] = useState(false)

  useEffect(() => {
    if (claim.status.toLowerCase() === "new") {
      handleReAnalyze()
    }
  }, [])

  const totalEstimate = claimDetails.damages.reduce((sum, damage) => sum + damage.total, 0)

  const handleReAnalyze = async () => {
    setIsAnalyzing(true)

    try {
      // Convert uploaded files to base64 for API call
      const photoFiles = []
      for (const file of claimDetails.media) {
        if (file.type.startsWith("image")) {
          try {
            const base64 = await imageUrlToBase64(file.url)
            photoFiles.push({
              name: file.name,
              type: file.type,
              data: base64,
            })
          } catch (error) {
            console.error("Error converting file to base64:", error)
          }
        }
      }

      const response = await fetch('/api/analyze-damages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle: claimDetails.vehicle,
          accident: claimDetails.accident,
          media: photoFiles,
        }),
      })

      if (!response.ok) throw new Error('Failed to analyze damages')
      const object = await response.json()

      setClaimDetails((prev) => ({
        ...prev,
        damages: object.damages.map((d, index) => ({
          id: String(Date.now() + index),
          ...d,
          operation: operationCanonical(d.operation),
          confidence: confidenceCanonical(d.confidence),
        })),
      }))
    } catch (error) {
      console.error('Error analyzing damages:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const calculateTotal = (laborHours: number, laborRate: number, partsEstimate: number) => {
    return laborHours * laborRate + partsEstimate
  }

  const openAddModal = () => {
    setModalMode("add")
    setFormData({
      item: "",
      description: "",
      operation: "Repair",
      laborHours: 0,
      laborRate: 85,
      partsEstimate: 0,
      total: 0,
      source: "",
    })
    setShowSourceField(false)
    setHasAiEstimate(false)
    setIsModalOpen(true)
  }

  const openEditModal = (damage: DamageItem) => {
    setModalMode("edit")
    setEditingDamage(damage)
    setFormData(damage)
    setShowSourceField(true) // Always show source field in edit mode
    setHasAiEstimate(false)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingDamage(null)
    setFormData({})
    setShowSourceField(false)
    setHasAiEstimate(false)
  }

  const updateFormData = (field: keyof DamageItem, value: any) => {
    const updatedForm = { ...formData, [field]: value }

    // Auto-calculate total when labor or parts change
    if (field === "laborHours" || field === "laborRate" || field === "partsEstimate") {
      updatedForm.total = calculateTotal(
        updatedForm.laborHours || 0,
        updatedForm.laborRate || 85,
        updatedForm.partsEstimate || 0,
      )

      // If user manually updates cost values after AI estimate, clear and hide source
      if (hasAiEstimate && modalMode === "add" && (field === "laborHours" || field === "partsEstimate")) {
        updatedForm.source = ""
        setShowSourceField(false)
        setHasAiEstimate(false)
      }
    }

    setFormData(updatedForm)
  }

  const handleSave = () => {
    if (!formData.item || !formData.description) return

    if (modalMode === "add") {
      const newDamage: DamageItem = {
        id: String(Date.now()),
        item: formData.item!,
        description: formData.description!,
        operation: formData.operation!,
        laborHours: formData.laborHours!,
        laborRate: formData.laborRate!,
        partsEstimate: formData.partsEstimate!,
        total: formData.total!,
        confidence: "System Confident",
        source: formData.source || "",
        manuallyEdited: true,
      }

      setClaimDetails((prev) => ({
        ...prev,
        damages: [...prev.damages, newDamage],
      }))
    } else {
      setClaimDetails((prev) => ({
        ...prev,
        damages: prev.damages.map((d) =>
          d.id === editingDamage?.id
            ? {
                ...d,
                ...formData,
                manuallyEdited: true,
              }
            : d,
        ),
      }))
    }

    closeModal()
  }

  const deleteDamage = (id: string) => {
    setClaimDetails((prev) => ({
      ...prev,
      damages: prev.damages.filter((d) => d.id !== id),
    }))
  }

  const handleEstimateCosts = async () => {
    if (!formData.item || !formData.description || !formData.operation) return

    setIsEstimatingCosts(true)

    try {
      const response = await fetch('/api/estimate-costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle: claimDetails.vehicle,
          repairItem: {
            item: formData.item,
            description: formData.description,
            operation: formData.operation,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to estimate costs')
      }

      const estimateData = await response.json()

      // Update form data with AI estimates
      const updatedForm = {
        ...formData,
        laborHours: estimateData.laborHours,
        partsEstimate: estimateData.partsEstimate,
        source: estimateData.source,
        total: calculateTotal(estimateData.laborHours, formData.laborRate || 85, estimateData.partsEstimate),
      }

      setFormData(updatedForm)
      setShowSourceField(true)
      setHasAiEstimate(true)
    } catch (error) {
      console.error("Error estimating costs:", error)
    } finally {
      setIsEstimatingCosts(false)
    }
  }

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const isVideo = file.type.startsWith("video/")
      const isImage = file.type.startsWith("image/")

      if (isImage || isVideo) {
        const url = URL.createObjectURL(file)
        const newMedia: MediaItem = {
          type: isVideo ? "video" : "image",
          name: file.name,
          url: url,
          timestamp: new Date().toLocaleString(),
          file: file,
          ...(isVideo && { duration: "Unknown" }),
        }

        setClaimDetails((prev) => ({
          ...prev,
          media: [...prev.media, newMedia],
        }))
      }
    })

    // Reset the input
    event.target.value = ""
  }

  const removeMedia = (index: number) => {
    setClaimDetails((prev) => {
      const newMedia = [...prev.media]
      const removedItem = newMedia[index]

      // Clean up object URL if it was created for uploaded file
      if (removedItem.file && removedItem.url.startsWith("blob:")) {
        URL.revokeObjectURL(removedItem.url)
      }

      newMedia.splice(index, 1)
      return {
        ...prev,
        media: newMedia,
      }
    })
  }

  return (
    <TooltipProvider>
      <div className="flex flex-1 flex-col gap-6 p-6 h-full overflow-y-auto">
        {/* Claim Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{claim.id}</h2>
            <p className="text-muted-foreground">Filed on {new Date(claim.dateSubmitted).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{claim.status}</Badge>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Submit for Approval
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="flex-1">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="policyholder">Policy Holder</TabsTrigger>
            <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="damages">Damages</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Accident Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Date & Time</Label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(claimDetails.accident.date).toLocaleDateString()} at {claimDetails.accident.time}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Location</Label>
                      <p className="text-sm text-muted-foreground">{claimDetails.accident.location}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Weather</Label>
                      <p className="text-sm text-muted-foreground">{claimDetails.accident.weather}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Police Report</Label>
                      <p className="text-sm text-muted-foreground">{claimDetails.accident.policeReport}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-muted-foreground mt-1">{claimDetails.accident.description}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Financial Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Total Estimate</Label>
                      <p className="text-2xl font-bold">${totalEstimate.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Deductible</Label>
                      <p className="text-2xl font-bold">$500</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Coverage Limit</Label>
                      <p className="text-sm text-muted-foreground">$50,000</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Policy Premium</Label>
                      <p className="text-sm text-muted-foreground">$1,200/year</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Other Parties Involved</CardTitle>
              </CardHeader>
              <CardContent>
                {claimDetails.accident.otherParties.map((party, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{party.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {party.vehicle} - {party.licensePlate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{party.insurance}</p>
                      <p className="text-sm text-muted-foreground">Insurance Provider</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policyholder" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Policy Holder Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Full Name</Label>
                      <p className="text-sm text-muted-foreground">{claimDetails.policyHolder.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Policy Number</Label>
                      <p className="text-sm text-muted-foreground">{claimDetails.policyHolder.policyNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Phone Number</Label>
                      <p className="text-sm text-muted-foreground">{claimDetails.policyHolder.phone}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email Address</Label>
                      <p className="text-sm text-muted-foreground">{claimDetails.policyHolder.email}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Address</Label>
                      <p className="text-sm text-muted-foreground">{claimDetails.policyHolder.address}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Date of Birth</Label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(claimDetails.policyHolder.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">License Number</Label>
                      <p className="text-sm text-muted-foreground">{claimDetails.policyHolder.licenseNumber}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vehicle" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Vehicle Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Year, Make, Model</Label>
                      <p className="text-sm text-muted-foreground">
                        {claimDetails.vehicle.year} {claimDetails.vehicle.make} {claimDetails.vehicle.model}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">VIN</Label>
                      <p className="text-sm text-muted-foreground">{claimDetails.vehicle.vin}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">License Plate</Label>
                      <p className="text-sm text-muted-foreground">{claimDetails.vehicle.licensePlate}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Color</Label>
                      <p className="text-sm text-muted-foreground">{claimDetails.vehicle.color}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Mileage</Label>
                      <p className="text-sm text-muted-foreground">{claimDetails.vehicle.mileage} miles</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Photos & Videos</CardTitle>
                    <CardDescription>Media files submitted by the policy holder and uploaded by agents</CardDescription>
                  </div>
                  <div>
                    <input
                      type="file"
                      id="media-upload"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleMediaUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => document.getElementById("media-upload")?.click()}
                      variant="outline"
                      size="sm"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Media
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {claimDetails.media.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 relative">
                      {item.file && (
                        <Button
                          onClick={() => removeMedia(index)}
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0 bg-white/80 hover:bg-white"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                      <div className="relative mb-3">
                        <img
                          src={item.url || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-32 object-cover rounded"
                        />
                        {item.type === "video" && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
                            <Play className="h-8 w-8 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                        {item.duration && <p className="text-xs text-muted-foreground">Duration: {item.duration}</p>}
                        {item.file && (
                          <Badge variant="secondary" className="text-xs">
                            Agent Upload
                          </Badge>
                        )}
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="damages" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Damage Assessment & Cost Estimates</CardTitle>
                    <CardDescription>Detailed breakdown of damages and repair costs</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={openAddModal} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                    <Button onClick={handleReAnalyze} disabled={isAnalyzing} variant="outline" size="sm">
                      <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? "animate-spin" : ""}`} />
                      {isAnalyzing ? "Analyzing..." : "Re-analyze"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Operation</TableHead>
                      <TableHead>Labor Hours</TableHead>
                      <TableHead>Labor Cost</TableHead>
                      <TableHead>Parts</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claimDetails.damages.map((damage) => (
                      <TableRow key={damage.id}>
                        <TableCell>
                          {!damage.manuallyEdited && (
                            <>
                              {damage.confidence === "Review Suggested" && (
                                <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-white">
                                  Review
                                </Badge>
                              )}
                              {damage.confidence === "Requires Investigation" && (
                                <Badge variant="destructive">Investigate</Badge>
                              )}
                            </>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{damage.item}</TableCell>
                        <TableCell className="max-w-xs whitespace-normal">
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground">{damage.description}</p>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help flex-shrink-0" />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <p className="text-xs">{damage.source}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{damage.operation}</Badge>
                        </TableCell>
                        <TableCell>{damage.laborHours}h</TableCell>
                        <TableCell>${(damage.laborHours * damage.laborRate).toFixed(2)}</TableCell>
                        <TableCell>${damage.partsEstimate.toFixed(2)}</TableCell>
                        <TableCell className="font-medium">${damage.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => openEditModal(damage)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => deleteDamage(damage.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Estimated Cost:</span>
                    <span className="text-xl font-bold">${totalEstimate.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        {/* Dialog for adding/editing damage items */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50">
            <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
              <h3 className="text-lg font-bold mb-4">
                {modalMode === "add" ? "Add New Damage Item" : "Edit Damage Item"}
              </h3>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="item" className="text-right">
                    Item
                  </Label>
                  <Input
                    id="item"
                    value={formData.item || ""}
                    onChange={(e) => updateFormData("item", e.target.value)}
                    className="col-span-3"
                    placeholder="e.g., Front Bumper"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => updateFormData("description", e.target.value)}
                    className="col-span-3"
                    placeholder="Detailed description of the damage"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="operation" className="text-right">
                    Operation
                  </Label>
                  <Select value={formData.operation} onValueChange={(value) => updateFormData("operation", value)}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Repair">Repair</SelectItem>
                      <SelectItem value="Replace">Replace</SelectItem>
                      <SelectItem value="R&I">R&I</SelectItem>
                      <SelectItem value="Repaint">Repaint</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Estimate Costs Button */}
                {(modalMode === "add" || (modalMode === "edit" && editingDamage?.manuallyEdited)) && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div></div>
                    <Button
                      onClick={handleEstimateCosts}
                      disabled={!formData.item || !formData.description || !formData.operation || isEstimatingCosts}
                      variant="outline"
                      className="col-span-3 bg-transparent"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isEstimatingCosts ? "animate-spin" : ""}`} />
                      {isEstimatingCosts ? "Estimating..." : "Estimate Costs"}
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="laborHours" className="text-right col-span-2">
                      Labor Hours
                    </Label>
                    <Input
                      id="laborHours"
                      type="number"
                      step="0.5"
                      value={formData.laborHours || ""}
                      onChange={(e) => updateFormData("laborHours", Number.parseFloat(e.target.value) || 0)}
                      className="col-span-2"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="laborRate" className="text-right col-span-2">
                      Labor Rate ($)
                    </Label>
                    <Input
                      id="laborRate"
                      type="number"
                      value={formData.laborRate || ""}
                      onChange={(e) => updateFormData("laborRate", Number.parseFloat(e.target.value) || 0)}
                      className="col-span-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="partsEstimate" className="text-right col-span-2">
                      Parts Cost ($)
                    </Label>
                    <Input
                      id="partsEstimate"
                      type="number"
                      step="0.01"
                      value={formData.partsEstimate || ""}
                      onChange={(e) => updateFormData("partsEstimate", Number.parseFloat(e.target.value) || 0)}
                      className="col-span-2"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right col-span-2 font-medium">Total Cost</Label>
                    <div className="col-span-2 px-3 py-2 bg-muted rounded-md">${(formData.total || 0).toFixed(2)}</div>
                  </div>
                </div>

                {/* Source field - conditional display */}
                {showSourceField && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="source" className="text-right">
                      Source
                    </Label>
                    <Input
                      id="source"
                      value={formData.source || ""}
                      onChange={(e) => updateFormData("source", e.target.value)}
                      className="col-span-3"
                      placeholder="e.g., Mitchell Manual Section 12.3"
                      readOnly={modalMode === "edit" && !editingDamage?.manuallyEdited}
                      disabled={modalMode === "edit" && !editingDamage?.manuallyEdited}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!formData.item || !formData.description}>
                  {modalMode === "add" ? "Add Item" : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
