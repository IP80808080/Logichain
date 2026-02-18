import { Link } from "react-router-dom";
import { Truck, Package, MapPin, Users, BarChart3, Shield } from "lucide-react";

function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navbar with glassmorphism */}
      <nav className="nav-glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-purple-600" />
              <span className="ml-2 text-2xl font-bold gradient-text">
                LogiChain
              </span>
            </div>
            <div className="flex gap-4">
              <Link to="/login" className="btn-glass text-gray-700">
                Login
              </Link>
              <Link to="/register" className="btn-glass-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 animate-float">
            Real-Time Shipment Tracking &<br />
            Inventory Management
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Complete visibility across your entire supply chain. Track
            shipments, manage inventory, and streamline warehouse operations in
            one powerful platform.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register" className="btn-glass-primary text-lg">
              Start Free Trial
            </Link>
            <Link to="/login" className="btn-glass text-lg text-gray-700">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 gradient-text">
          Key Features
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass-card glass-card-hover p-6">
            <MapPin className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900">
              Real-Time Tracking
            </h3>
            <p className="text-gray-700">
              Track shipments from warehouse to customer with live updates and
              location tracking.
            </p>
          </div>

          <div className="glass-card glass-card-hover p-6">
            <Package className="h-12 w-12 text-pink-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900">
              Inventory Management
            </h3>
            <p className="text-gray-700">
              Manage stock levels, warehouse operations, and get low-stock
              alerts automatically.
            </p>
          </div>

          <div className="glass-card glass-card-hover p-6">
            <BarChart3 className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900">
              Analytics & Reports
            </h3>
            <p className="text-gray-700">
              Get insights into orders, shipments, and inventory with powerful
              analytics.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 gradient-text">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="glass-card w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold gradient-text">1</span>
              </div>
              <h3 className="font-semibold mb-2 text-gray-900">Create Order</h3>
              <p className="text-gray-700 text-sm">
                Customer places order through the system
              </p>
            </div>

            <div className="text-center">
              <div className="glass-card w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold gradient-text">2</span>
              </div>
              <h3 className="font-semibold mb-2 text-gray-900">
                Warehouse Process
              </h3>
              <p className="text-gray-700 text-sm">
                Warehouse picks, packs and ships items
              </p>
            </div>

            <div className="text-center">
              <div className="glass-card w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold gradient-text">3</span>
              </div>
              <h3 className="font-semibold mb-2 text-gray-900">
                Track Shipment
              </h3>
              <p className="text-gray-700 text-sm">
                Real-time tracking updates at every step
              </p>
            </div>

            <div className="text-center">
              <div className="glass-card w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold gradient-text">4</span>
              </div>
              <h3 className="font-semibold mb-2 text-gray-900">Delivered</h3>
              <p className="text-gray-700 text-sm">
                Customer receives order with confirmation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Access */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 gradient-text">
          Built for Every Role
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card glass-card-hover p-6">
            <Shield className="h-10 w-10 text-purple-600 mb-3" />
            <h3 className="font-bold mb-2 text-gray-900">Admin</h3>
            <p className="text-sm text-gray-700">
              Full system control, user management, analytics
            </p>
          </div>

          <div className="glass-card glass-card-hover p-6">
            <Package className="h-10 w-10 text-green-600 mb-3" />
            <h3 className="font-bold mb-2 text-gray-900">Warehouse Manager</h3>
            <p className="text-sm text-gray-700">
              Inventory, shipments, warehouse operations
            </p>
          </div>

          <div className="glass-card glass-card-hover p-6">
            <Users className="h-10 w-10 text-blue-600 mb-3" />
            <h3 className="font-bold mb-2 text-gray-900">Customer Support</h3>
            <p className="text-sm text-gray-700">
              Order management, returns, customer queries
            </p>
          </div>

          <div className="glass-card glass-card-hover p-6">
            <Truck className="h-10 w-10 text-orange-600 mb-3" />
            <h3 className="font-bold mb-2 text-gray-900">Customer</h3>
            <p className="text-sm text-gray-700">
              Track orders, manage returns, view history
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-20"></div>
        <div className="max-w-4xl mx-auto text-center px-4 relative">
          <div className="glass-card p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Supply Chain?
            </h2>
            <p className="text-gray-700 mb-8 text-lg">
              Join hundreds of businesses managing their logistics with
              LogiChain
            </p>
            <Link
              to="/register"
              className="btn-glass-primary text-lg inline-block"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass-card rounded-none border-0 border-t py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-700">
            &copy; 2026 LogiChain. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
