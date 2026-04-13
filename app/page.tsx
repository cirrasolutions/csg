import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Truck, 
  MapPin, 
  Shield, 
  BarChart3, 
  Package, 
  Clock, 
  CheckCircle2,
  ArrowRight,
  Smartphone
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Truck className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">LogiTrack</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </a>
              <a href="#integration" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Integration
              </a>
            </nav>
            
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/sign-up">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Smartphone className="h-4 w-4" />
            Now available on Android
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground max-w-4xl mx-auto leading-tight text-balance">
            Logistics Management for the Modern Enterprise
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Track consignments in real-time, manage your fleet, and integrate seamlessly with NetSuite. Built for logistics companies that demand reliability.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="px-8">
              <Link href="/auth/sign-up">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8">
              <Link href="#features">
                Learn More
              </Link>
            </Button>
          </div>
          
          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '99.9%', label: 'Uptime' },
              { value: '50K+', label: 'Shipments Tracked' },
              { value: '2FA', label: 'Security' },
              { value: '24/7', label: 'Support' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl md:text-4xl font-bold text-foreground">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Everything You Need to Manage Logistics
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              From GPS tracking to NetSuite integration, LogiTrack provides all the tools your logistics operation needs.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: MapPin,
                title: 'Real-Time GPS Tracking',
                description: 'Track your fleet and consignments in real-time with accurate GPS positioning.',
              },
              {
                icon: Package,
                title: 'Consignment Management',
                description: 'Manage incoming and outgoing shipments with detailed tracking and status updates.',
              },
              {
                icon: Truck,
                title: 'Fleet Management',
                description: 'Keep track of your trucks, drivers, and vehicle maintenance schedules.',
              },
              {
                icon: Shield,
                title: 'Two-Factor Authentication',
                description: 'Protect your data with enterprise-grade security including 2FA for all users.',
              },
              {
                icon: BarChart3,
                title: 'Analytics & Reports',
                description: 'Get insights into your operations with comprehensive dashboards and reports.',
              },
              {
                icon: Clock,
                title: 'Delivery Notifications',
                description: 'Keep customers informed with automated delivery updates and ETA notifications.',
              },
            ].map((feature) => (
              <Card key={feature.title} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started with LogiTrack in minutes. Simple setup, powerful features.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: 'Create Your Account',
                description: 'Sign up as a system user or customer. Set up two-factor authentication for enhanced security.',
              },
              {
                step: '02',
                title: 'Add Your Fleet & Consignments',
                description: 'Register your trucks and start creating consignments. Track everything from a single dashboard.',
              },
              {
                step: '03',
                title: 'Track & Deliver',
                description: 'Monitor shipments in real-time, receive updates, and keep your customers informed.',
              },
            ].map((item, index) => (
              <div key={item.step} className="relative">
                <div className="text-6xl font-bold text-primary/10 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8 h-0.5 bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section id="integration" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Seamless NetSuite Integration
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                As a NetSuite consultant, you know the importance of integrated systems. LogiTrack connects directly with NetSuite to sync consignments, customers, and inventory in real-time.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  'Bi-directional sync with NetSuite',
                  'Custom record types for logistics',
                  'Webhook support for real-time updates',
                  'REST API for custom integrations',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8" size="lg">
                <Link href="/auth/sign-up">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="bg-card rounded-2xl p-8 shadow-lg border">
              <pre className="text-sm overflow-x-auto">
                <code className="text-muted-foreground">{`// Sync consignment to NetSuite
const result = await syncConsignmentToNetSuite({
  tracking_number: "LT1234567890",
  status: "in_transit",
  sender_name: "Acme Corp",
  receiver_name: "Global Shipping",
  parcels_count: 5,
  expected_delivery: "2024-01-15"
});

// Result: { success: true, netsuiteId: "12345" }`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-2xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
              Ready to Transform Your Logistics?
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              Join thousands of logistics companies using LogiTrack to streamline their operations.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" variant="secondary" className="px-8">
                <Link href="/auth/sign-up">
                  Start Free Trial
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="px-8 bg-transparent text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10">
                <Link href="/auth/login">
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Truck className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold">LogiTrack</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built for logistics companies. Powered by Next.js and Supabase.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
