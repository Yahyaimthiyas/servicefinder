import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, XCircle, Star } from "lucide-react"

export function ServiceManagement() {
  const services = [
    {
      id: 1,
      category: "Plumbing",
      professional: "John Smith",
      title: "Emergency Plumbing Repair",
      price: "$75/hour",
      status: "Active",
      rating: 4.9,
      bookings: 23,
    },
    {
      id: 2,
      category: "Cleaning",
      professional: "Maria Garcia",
      title: "Deep House Cleaning",
      price: "$120/session",
      status: "Pending Review",
      rating: 4.7,
      bookings: 15,
    },
    {
      id: 3,
      category: "Electrical",
      professional: "David Wilson",
      title: "Electrical Installation",
      price: "$90/hour",
      status: "Suspended",
      rating: 3.2,
      bookings: 8,
    },
  ]

  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
      case "Pending Review":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending Review</Badge>
      case "Suspended":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Suspended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Professional</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>
                  <p className="font-medium">{service.title}</p>
                </TableCell>
                <TableCell>{service.professional}</TableCell>
                <TableCell>
                  <Badge variant="outline">{service.category}</Badge>
                </TableCell>
                <TableCell>{service.price}</TableCell>
                <TableCell>{getStatusBadge(service.status)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {service.rating}
                  </div>
                </TableCell>
                <TableCell>{service.bookings}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <Button size="sm" variant="outline">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline">
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
