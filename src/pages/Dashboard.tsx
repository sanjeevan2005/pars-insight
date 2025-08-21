import { useState } from "react";
import { Package, Upload, Clock, CheckCircle, XCircle, Filter, Download } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data for demonstration
const mockData = [
  {
    id: 1,
    filename: "shipping_label_001.jpg",
    uploadedAt: "2024-01-15 10:30",
    extractStatus: "Success",
    documentType: "SHIPPING_LABEL",
    isShippingLabel: true,
    trackingNumber: "1Z999AA1234567890",
    originAddress: {
      name: "John Smith",
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zip: "10001",
      country: "US"
    },
    destinationAddress: {
      name: "Jane Doe",
      street: "456 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      zip: "90210",
      country: "US"
    },
    message: "N/A"
  },
  {
    id: 2,
    filename: "document_002.pdf",
    uploadedAt: "2024-01-15 09:15",
    extractStatus: "Failed",
    documentType: "OTHER",
    isShippingLabel: false,
    trackingNumber: null,
    originAddress: null,
    destinationAddress: null,
    message: "Document is not a shipping label"
  },
  {
    id: 3,
    filename: "shipping_label_003.png",
    uploadedAt: "2024-01-15 08:45",
    extractStatus: "Pending",
    documentType: "SHIPPING_LABEL",
    isShippingLabel: true,
    trackingNumber: "1Z999AA1234567891",
    originAddress: {
      name: "Mike Johnson",
      street: "789 Pine St",
      city: "Chicago",
      state: "IL",
      zip: "60601",
      country: "US"
    },
    destinationAddress: {
      name: "Sarah Wilson",
      street: "321 Elm Dr",
      city: "Miami",
      state: "FL",
      zip: "33101",
      country: "US"
    },
    message: "N/A"
  }
];

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredData = mockData.filter(item => {
    const matchesSearch = item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.trackingNumber && item.trackingNumber.includes(searchTerm));
    const matchesStatus = statusFilter === "all" || item.extractStatus.toLowerCase() === statusFilter;
    const matchesType = typeFilter === "all" || item.documentType.toLowerCase() === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="w-3 h-3 mr-1" />Success</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const stats = [
    {
      title: "Total Uploads",
      value: "1,234",
      icon: Upload,
      description: "Documents processed",
      color: "primary"
    },
    {
      title: "Success Rate",
      value: "94.2%",
      icon: CheckCircle,
      description: "Successful extractions",
      color: "success"
    },
    {
      title: "Pending",
      value: "23",
      icon: Clock,
      description: "Awaiting processing",
      color: "warning"
    },
    {
      title: "Shipping Labels",
      value: "1,156",
      icon: Package,
      description: "Valid labels found",
      color: "secondary"
    }
  ];

  return (
    <Layout userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Package Dashboard</h1>
            <p className="text-muted-foreground">Monitor and manage all uploaded shipping documents</p>
          </div>
          <Button className="primary-gradient shadow-medium">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="shadow-soft hover:shadow-medium transition-smooth">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    stat.color === 'primary' ? 'primary-gradient' :
                    stat.color === 'success' ? 'bg-success' :
                    stat.color === 'warning' ? 'bg-warning' :
                    'secondary-gradient'
                  }`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters and Search */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Documents
            </CardTitle>
            <CardDescription>Search and filter uploaded documents</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by filename or tracking number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="shipping_label">Shipping Labels</SelectItem>
                <SelectItem value="other">Other Documents</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Upload Records</CardTitle>
            <CardDescription>
              {filteredData.length} of {mockData.length} documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Filename</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Tracking Number</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.filename}</TableCell>
                      <TableCell>{item.uploadedAt}</TableCell>
                      <TableCell>{getStatusBadge(item.extractStatus)}</TableCell>
                      <TableCell>
                        <Badge variant={item.isShippingLabel ? "default" : "outline"}>
                          {item.documentType.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {item.trackingNumber || "N/A"}
                      </TableCell>
                      <TableCell>
                        {item.originAddress && item.destinationAddress ? (
                          <div className="text-sm">
                            <div>{item.originAddress.city}, {item.originAddress.state}</div>
                            <div className="text-muted-foreground">↓</div>
                            <div>{item.destinationAddress.city}, {item.destinationAddress.state}</div>
                          </div>
                        ) : "N/A"}
                      </TableCell>
                      <TableCell>
                        <span className={item.message === "N/A" ? "text-muted-foreground" : "text-destructive"}>
                          {item.message}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;