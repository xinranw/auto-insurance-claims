"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Car,
  Eye,
  FileText,
  Home,
  MoreHorizontal,
  Search,
  Settings,
  Shield,
  Users,
  User,
  ChevronDown,
} from "lucide-react"
import { ClaimReviewPage } from "@/components/claim-review-page"

// Mock data for claims
const claims = [
  {
    id: "CLM-2025-004",
    customerName: "David Tester Thompson",
    dateSubmitted: "2025-07-05",
    claimType: "Collision",
    status: "New",
    estimatedAmount: "$2,800",
    description: "Minor fender bender in parking lot",
  },
  {
    id: "CLM-2025-001",
    customerName: "Sarah Johnson",
    dateSubmitted: "2025-01-15",
    claimType: "Collision",
    status: "Under review",
    estimatedAmount: "$8,500",
    description: "Rear-end collision on Highway 101",
  },
  {
    id: "CLM-2025-002",
    customerName: "Michael Chen",
    dateSubmitted: "2025-04-14",
    claimType: "Comprehensive",
    status: "New",
    estimatedAmount: "$3,200",
    description: "Hail damage to vehicle roof and hood",
  },
  {
    id: "CLM-2025-003",
    customerName: "Emily Rodriguez",
    dateSubmitted: "2025-04-28",
    claimType: "Liability",
    status: "Pending Approval",
    estimatedAmount: "$12,000",
    description: "Multi-vehicle accident with injury claims",
  },
  {
    id: "CLM-2025-005",
    customerName: "Lisa Wang",
    dateSubmitted: "2025-03-13",
    claimType: "Comprehensive",
    status: "Approved",
    estimatedAmount: "$5,500",
    description: "Vandalism - broken windows and scratched paint",
  },
]

const navigationItems = [
  {
    title: "Dashboard",
    icon: Home,
    url: "#",
    isActive: true,
  },
  {
    title: "Active Claims",
    icon: FileText,
    url: "#",
    badge: "12",
  },
  {
    title: "Customers",
    icon: Users,
    url: "#",
  },
  {
    title: "Reports",
    icon: Shield,
    url: "#",
  },
  {
    title: "Settings",
    icon: Settings,
    url: "#",
  },
]

function AppSidebar() {
  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">SecureAuto Insurance</span>
            <span className="truncate text-xs text-muted-foreground">Claims Portal</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4">
        <div className="space-y-1">
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Navigation
          </div>
          {navigationItems.map((item) => (
            <a
              key={item.title}
              href={item.url}
              className={`flex items-center gap-2 px-2 py-2 text-sm rounded-md transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                item.isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground"
              }`}
            >
              <item.icon className="size-4" />
              <span className="flex-1">{item.title}</span>
              {item.badge && (
                <Badge variant="secondary" className="text-xs">
                  {item.badge}
                </Badge>
              )}
            </a>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start">
              <User className="size-4 mr-2" />
              <span className="flex-1 text-left">Agent Portal</span>
              <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" className="w-56">
            <DropdownMenuLabel>John Smith</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "New":
      return "secondary"
    case "Under review":
      return "default"
    case "Pending Approval":
      return "outline"
    case "Approved":
      return "default"
    case "Rejected":
      return "destructive"
    default:
      return "outline"
  }
}

function DashboardContent({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  filteredClaims,
  onClaimClick,
}: {
  searchTerm: string
  setSearchTerm: (term: string) => void
  statusFilter: string
  setStatusFilter: (filter: string) => void
  filteredClaims: typeof claims
  onClaimClick: (claim: (typeof claims)[0]) => void
}) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-6 h-full overflow-y-auto">
      {/* Claims Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Claims</CardTitle>
              <CardDescription>Manage and review pending insurance claims</CardDescription>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search claims..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Under review">Under review</SelectItem>
                <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClaims.map((claim) => (
                <TableRow
                  key={claim.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onClaimClick(claim)}
                >
                  <TableCell className="font-medium">{claim.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{claim.customerName}</div>
                      <div className="text-sm text-muted-foreground">{claim.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      {claim.claimType}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(claim.status)}>{claim.status}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{claim.estimatedAmount}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onClaimClick(claim)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <FileText className="mr-2 h-4 w-4" />
                          Review Documents
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-green-600" onClick={(e) => e.stopPropagation()}>
                          Approve Claim
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={(e) => e.stopPropagation()}>
                          Deny Claim
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedClaim, setSelectedClaim] = useState<(typeof claims)[0] | null>(null)

  const filteredClaims = claims.filter((claim) => {
    const matchesSearch =
      claim.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || claim.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex h-screen w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6">
          <h1 className="text-lg font-semibold">
            {selectedClaim ? `Claim Review - ${selectedClaim.id}` : "Claims Dashboard"}
          </h1>
          {selectedClaim && (
            <Button variant="outline" size="sm" onClick={() => setSelectedClaim(null)} className="ml-auto">
              ← Back to Dashboard
            </Button>
          )}
        </header>

        <main className="flex-1 overflow-hidden">
          {selectedClaim ? (
            <ClaimReviewPage claim={selectedClaim} />
          ) : (
            <DashboardContent
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              filteredClaims={filteredClaims}
              onClaimClick={setSelectedClaim}
            />
          )}
        </main>
      </div>
    </div>
  )
}
