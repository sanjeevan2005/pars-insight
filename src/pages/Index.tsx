import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, ArrowRight, Shield, BarChart3, Upload as UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to dashboard if user is already authenticated
    // In a real app, you'd check authentication state here
    // navigate("/dashboard");
  }, [navigate]);

  const features = [
    {
      icon: UploadIcon,
      title: "Smart Document Upload",
      description: "Upload shipping labels and documents with AI-powered OCR extraction"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Real-time insights into shipping routes, success rates, and performance metrics"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "JWT authentication with role-based access control and admin approval"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-subtle">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 logistics-gradient rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">PARS</h1>
              <p className="text-xs text-muted-foreground">Package Analysis & Routing</p>
            </div>
          </div>
          
          <Button onClick={() => navigate("/login")} className="primary-gradient">
            Sign In
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="w-20 h-20 logistics-gradient rounded-2xl flex items-center justify-center mx-auto shadow-strong">
            <Package className="w-10 h-10 text-white" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
              Package Analysis &<br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Routing System
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Streamline your logistics operations with AI-powered document processing, 
              real-time analytics, and intelligent routing optimization for shipping labels.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate("/login")} 
              size="lg" 
              className="primary-gradient shadow-medium text-lg px-8"
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button 
              onClick={() => navigate("/analytics")} 
              variant="outline" 
              size="lg" 
              className="text-lg px-8"
            >
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Everything you need for logistics management
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Built specifically for logistics companies like UPS, with enterprise-grade 
            security and AI-powered document processing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="shadow-soft hover:shadow-medium transition-smooth border-0">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 logistics-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-16">
        <Card className="logistics-gradient shadow-strong border-0">
          <CardContent className="p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to optimize your logistics?
            </h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto text-lg">
              Join leading logistics companies using PARS to streamline their 
              package processing and routing operations.
            </p>
            <Button 
              onClick={() => navigate("/login")} 
              size="lg" 
              variant="secondary"
              className="text-lg px-8 shadow-medium"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-border">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 logistics-gradient rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-foreground">PARS</span>
          </div>
          
          <p className="text-sm text-muted-foreground text-center">
            © 2024 PARS - Package Analysis and Routing System. Built for logistics excellence.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
