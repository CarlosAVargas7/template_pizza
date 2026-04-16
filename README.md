# Video (youtube)

[![Preview del Video](https://img.youtube.com/vi/o2DYeJHu9zw/0.jpg)](https://www.youtube.com/watch?v=o2DYeJHu9zw)

# Pizza Antioquia - E-commerce Platform

A modern, full-stack e-commerce platform for Pizza Antioquia, showcasing advanced frontend development skills with React, Next.js, and TypeScript.

## **Tech Stack & Skills Demonstrated**

### **Frontend Core**

- **Next.js 14** - App Router, Server Components, Suspense
- **React 18** - Hooks, Context API, Advanced State Management
- **TypeScript** - Type-safe development, interfaces, generics
- **Tailwind CSS** - Responsive design, mobile-first approach
- **Framer Motion** - Complex animations, micro-interactions

### **E-commerce Features**

- **Real-time Order Management** - Firebase integration
- **Payment Gateway** - Wompi API integration (COP currency)
- **Admin Dashboard** - Role-based access control (General Manager, Branch Manager, Employee)
- **Inventory System** - Dynamic menu management, stock control
- **Order Tracking** - Real-time status updates

### **Advanced Development Skills**

- **Performance Optimization** - Lazy loading, image optimization
- **SEO Implementation** - Schema.org, meta tags, sitemap, robots.txt
- **Progressive Web App** - Service worker, offline capabilities
- **Form Validation** - Complex validation with error handling
- **API Integration** - RESTful APIs, webhooks, real-time data

### **UI/UX Expertise**

- **Responsive Design** - Mobile-first, tablet, desktop optimization
- **Accessibility** - WCAG compliance, semantic HTML, ARIA labels
- **Modern UI Patterns** - Modals, dropdowns, filters, pagination
- **Component Architecture** - Reusable, composable components

### **Development Workflow**

- **Git Version Control** - Branching strategies, commit hygiene
- **Code Organization** - Modular architecture, separation of concerns
- **Error Handling** - Graceful degradation, user feedback
- **Testing Ready** - Component structure designed for testability

## **Project Architecture**

```
src/
app/
  - (auth)/           # Authentication routes
  - admin/           # Admin dashboard with role-based access
  - api/             # API routes
  - blog/            # Content management
  - globals.css      # Global styles
  - layout.tsx       # Root layout
  - page.tsx         # Homepage
  - productos/       # Product pages
components/
  - ui/              # Reusable UI components
  - forms/           # Form components
  - layout/          # Layout components
lib/
  - firebase/        # Firebase configuration
  - menuData.ts      # Menu management
  - store.ts         # State management
types/
  - admin.ts         # Admin types
  - marketing.ts     # Marketing types
```

## **Key Features Implemented**

### **Customer Experience**

- Browse pizzas by category
- Custom pizza builder
- Real-time order tracking
- Mobile-optimized ordering
- Social sharing features

### **Admin Management**

- Multi-branch management
- Role-based permissions
- Real-time order monitoring
- Inventory management
- Sales analytics
- Marketing campaigns

### **Technical Highlights**

- **Type Safety**: Full TypeScript implementation
- **Performance**: 95+ Lighthouse scores
- **SEO**: Structured data, meta optimization
- **Security**: Input validation, XSS prevention
- **Scalability**: Modular, maintainable codebase

## **Getting Started**

### **Prerequisites**

- Node.js 18+
- npm/yarn/bun
- Firebase project

### **Installation**

```bash
# Clone the repository
git clone https://github.com/CarlosAVargas7/template_pizza
cd template_pizza

# Install dependencies
pnpm install  # or npm install, bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase config

# Run development server
pnpm dev  # or npm run dev, bun run dev
```

### **Environment Variables**

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=your_wompi_key
```

## **Local Development**

### **Build for Production**

```bash
# Build the application
pnpm build

# Start production server locally
pnpm start
```

## **Why This Project?**

This e-commerce platform demonstrates **enterprise-level frontend development skills**:

1. **Complex State Management** - Real-time order tracking, multi-user admin
2. **Modern Architecture** - Next.js 14, TypeScript, component-driven design
3. **Real-world Integration** - Payment gateways, Firebase, external APIs
4. **Performance Focus** - Optimized for production, SEO-ready
5. **Scalable Codebase** - Maintainable, testable, extensible architecture
