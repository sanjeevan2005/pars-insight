import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { MapPin, TrendingUp, Package, AlertTriangle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock data for analytics
const routingData = [
  { name: 'New York', shipments: 1240, damaged: 45 },
  { name: 'Los Angeles', shipments: 980, damaged: 23 },
  { name: 'Chicago', shipments: 856, damaged: 67 },
  { name: 'Houston', shipments: 743, damaged: 34 },
  { name: 'Phoenix', shipments: 621, damaged: 28 },
  { name: 'Philadelphia', shipments: 578, damaged: 41 }
];

const countryData = [
  { name: 'United States', value: 85, color: 'hsl(var(--primary))' },
  { name: 'Canada', value: 8, color: 'hsl(var(--secondary))' },
  { name: 'Mexico', value: 4, color: 'hsl(var(--accent))' },
  { name: 'Others', value: 3, color: 'hsl(var(--muted-foreground))' }
];

const uploadTrendData = [
  { date: '2024-01-01', uploads: 120, success: 114 },
  { date: '2024-01-02', uploads: 135, success: 128 },
  { date: '2024-01-03', uploads: 98, success: 89 },
  { date: '2024-01-04', uploads: 167, success: 159 },
  { date: '2024-01-05', uploads: 143, success: 138 },
  { date: '2024-01-06', uploads: 189, success: 178 },
  { date: '2024-01-07', uploads: 156, success: 147 }
];

const statusData = [
  { status: 'Success', count: 1156, percentage: 94.2 },
  { status: 'Failed', count: 43, percentage: 3.5 },
  { status: 'Pending', count: 28, percentage: 2.3 }
];

const Analytics = () => {
  const successRate = 94.2;
  const totalShipments = 1227;
  const peakDate = "January 6, 2024";
  const mostAffectedCountry = "United States";

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive insights into shipping document processing</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="w-4 h-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{successRate}%</div>
              <p className="text-xs text-muted-foreground">Of all uploads processed successfully</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
              <Package className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalShipments.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Documents processed this week</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Peak Upload Date</CardTitle>
              <BarChart className="w-4 h-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{peakDate}</div>
              <p className="text-xs text-muted-foreground">Highest processing volume</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Affected</CardTitle>
              <AlertTriangle className="w-4 h-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{mostAffectedCountry}</div>
              <p className="text-xs text-muted-foreground">Highest damaged label rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Shipment Routing Hotspots
              </CardTitle>
              <CardDescription>Top cities by shipping volume and damage rates</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={routingData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Bar dataKey="shipments" fill="hsl(var(--primary))" radius={4} />
                  <Bar dataKey="damaged" fill="hsl(var(--destructive))" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Shipment Origin Distribution</CardTitle>
              <CardDescription>Countries with the highest shipping volumes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={countryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {countryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                    formatter={(value: number) => [`${value}%`, 'Percentage']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {countryData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}: {item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-soft">
            <CardHeader>
              <CardTitle>Upload Trends</CardTitle>
              <CardDescription>Daily upload volume and success rates over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={uploadTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="uploads" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Total Uploads"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="success" 
                    stroke="hsl(var(--success))" 
                    strokeWidth={2}
                    name="Successful"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Processing Status</CardTitle>
              <CardDescription>Current upload processing breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusData.map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant={
                        item.status === 'Success' ? 'default' :
                        item.status === 'Failed' ? 'destructive' : 'secondary'
                      }>
                        {item.status}
                      </Badge>
                      <span className="text-sm font-medium">{item.count}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-subtle rounded-lg">
                <h4 className="font-medium mb-2">Success Rate Trend</h4>
                <div className="text-2xl font-bold text-success mb-1">{successRate}%</div>
                <p className="text-xs text-muted-foreground">
                  +2.3% from last week
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Embedded Analytics Note */}
        <Card className="shadow-soft border-dashed border-2">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Looker Studio Integration</h3>
            <p className="text-muted-foreground mb-4">
              In production, this section would contain an embedded Looker Studio dashboard
              with real-time analytics and advanced visualizations.
            </p>
            <Badge variant="outline">Coming Soon</Badge>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Analytics;