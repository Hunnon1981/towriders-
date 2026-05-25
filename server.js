// ================================================
// TOW RIDERS BACKEND API
// Express Server with Stripe Checkout Integration
// ================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Initialize Express app
const app = express();

// Configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8000';

// ================================================
// MIDDLEWARE
// ================================================

// Enable CORS for frontend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Stripe webhook requires raw body - must be BEFORE express.json()
app.post('/api/stripe/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.log(`⚠️  Webhook signature verification failed.`, err.message);
    return res.sendStatus(400);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('✅ Payment successful:', session);
      
      // Fulfill the purchase...
      // Get booking data from metadata
      const bookingData = session.metadata;
      console.log('📦 Booking Data:', bookingData);
      
      // Here you would:
      // 1. Save booking to database
      // 2. Send confirmation email
      // 3. Send SMS notification
      // 4. Update booking status
      
      break;
    
    case 'payment_intent.payment_failed':
      const paymentIntent = event.data.object;
      console.log('❌ Payment failed:', paymentIntent);
      break;
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});

// Parse JSON request bodies (for all other routes)
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ================================================
// ROUTES
// ================================================

// Root endpoint - Health check
app.get('/', (req, res) => {
  res.send('Tow Riders Backend is LIVE');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Tow Riders Backend API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not configured'
  });
});

// ================================================
// STRIPE CHECKOUT API
// ================================================

// POST /api/stripe/create-checkout-session
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    const { bookingData } = req.body;
    
    // Validate booking data
    if (!bookingData || !bookingData.pricing || !bookingData.pricing.total) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking data'
      });
    }

    // Calculate amount in cents (Stripe requires smallest currency unit)
    const amountInCents = Math.round(bookingData.pricing.total * 100);

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: bookingData.serviceName || 'Towing Service',
              description: `From: ${bookingData.pickup || 'N/A'}\nTo: ${bookingData.dropoff || bookingData.pickup || 'N/A'}\nVehicle: ${bookingData.vehicleYear || ''} ${bookingData.vehicleMake || ''} ${bookingData.vehicleModel || ''}`.trim(),
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${FRONTEND_URL}/payment-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/payment-cancel.html`,
      customer_email: bookingData.email || undefined,
      metadata: {
        // Store booking data in Stripe metadata (limited to 500 chars per value)
        bookingId: `BK-${Date.now()}`,
        customerName: bookingData.customerName || '',
        phone: bookingData.phone || '',
        service: bookingData.serviceName || '',
        pickup: bookingData.pickup ? bookingData.pickup.substring(0, 500) : '',
        dropoff: bookingData.dropoff ? bookingData.dropoff.substring(0, 500) : '',
        vehicleInfo: `${bookingData.vehicleYear || ''} ${bookingData.vehicleMake || ''} ${bookingData.vehicleModel || ''}`.trim().substring(0, 500),
        distance: bookingData.distance || '',
        totalPrice: bookingData.pricing.total.toString()
      },
    });

    // Log checkout session creation
    console.log('💳 Stripe Checkout Session Created:');
    console.log(`   Session ID: ${session.id}`);
    console.log(`   Amount: $${(amountInCents / 100).toFixed(2)}`);
    console.log(`   Customer: ${bookingData.customerName}`);

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('❌ ERROR creating Stripe checkout session:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create checkout session'
    });
  }
});

// GET /api/stripe/session/:sessionId - Retrieve session details
app.get('/api/stripe/session/:sessionId', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    
    res.json({
      success: true,
      session: {
        id: session.id,
        payment_status: session.payment_status,
        customer_email: session.customer_email,
        amount_total: session.amount_total,
        metadata: session.metadata
      }
    });
  } catch (error) {
    console.error('❌ ERROR retrieving session:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ================================================
// BOOKING API
// ================================================

// POST /api/booking - Create new booking
app.post('/api/booking', (req, res) => {
  try {
    const bookingData = req.body;
    
    // Log booking data to console
    console.log('📦 NEW BOOKING RECEIVED:');
    console.log(JSON.stringify(bookingData, null, 2));
    
    // Validate basic required fields
    if (!bookingData.customerName || !bookingData.phone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: customerName and phone are required',
        data: null
      });
    }
    
    // Generate booking ID
    const bookingId = `BK-${Date.now()}`;
    
    // Send success response
    res.status(200).json({
      success: true,
      message: 'Booking received successfully',
      data: bookingData,
      bookingId: bookingId,
      timestamp: new Date().toISOString()
    });
    
    // Here you would:
    // 1. Save to database
    // 2. Send confirmation email
    // 3. Send SMS notification
    // 4. Notify dispatch
    
  } catch (error) {
    console.error('❌ ERROR processing booking:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/bookings - Get all bookings (placeholder for now)
app.get('/api/bookings', (req, res) => {
  res.json({
    success: true,
    message: 'Bookings endpoint - Database integration pending',
    data: [],
    count: 0
  });
});

// ================================================
// CONTACT API
// ================================================

// POST /api/contact - Handle contact form submissions
app.post('/api/contact', (req, res) => {
  try {
    const contactData = req.body;
    
    console.log('📧 CONTACT FORM RECEIVED:');
    console.log(JSON.stringify(contactData, null, 2));
    
    res.json({
      success: true,
      message: 'Contact form received successfully',
      data: contactData
    });
    
  } catch (error) {
    console.error('❌ ERROR processing contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// ================================================
// PARTNER API
// ================================================

// POST /api/partner - Handle partner applications
app.post('/api/partner', (req, res) => {
  try {
    const partnerData = req.body;
    
    console.log('🤝 PARTNER APPLICATION RECEIVED:');
    console.log(JSON.stringify(partnerData, null, 2));
    
    res.json({
      success: true,
      message: 'Partner application received successfully',
      data: partnerData,
      applicationId: `PA-${Date.now()}`
    });
    
  } catch (error) {
    console.error('❌ ERROR processing partner application:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// ================================================
// ERROR HANDLING
// ================================================

// 404 handler - Route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.url
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ GLOBAL ERROR:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: NODE_ENV === 'development' ? error.message : 'An error occurred'
  });
});

// ================================================
// START SERVER
// ================================================

app.listen(PORT, () => {
  console.log('\n🚀 TOW RIDERS BACKEND API');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Server running on port: ${PORT}`);
  console.log(`✅ Environment: ${NODE_ENV}`);
  console.log(`✅ API URL: http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`✅ Stripe: ${process.env.STRIPE_SECRET_KEY ? 'CONFIGURED ✓' : 'NOT CONFIGURED ✗'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📋 Available endpoints:');
  console.log('   GET  /');
  console.log('   GET  /health');
  console.log('   POST /api/booking');
  console.log('   GET  /api/bookings');
  console.log('   POST /api/contact');
  console.log('   POST /api/partner');
  console.log('   POST /api/stripe/create-checkout-session');
  console.log('   GET  /api/stripe/session/:sessionId');
  console.log('   POST /api/stripe/webhook');
  console.log('\n⏳ Waiting for requests...\n');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n👋 SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n👋 SIGINT signal received: closing HTTP server');
  process.exit(0);
});
