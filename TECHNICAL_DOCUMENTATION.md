# Trinity Dev Web - Technical Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [UML Diagrams](#uml-diagrams)
3. [Database Schema](#database-schema)
4. [API Design](#api-design)
5. [Security Implementation](#security-implementation)
6. [Data Flow](#data-flow)
7. [Technology Choices](#technology-choices)

## Architecture Overview

### System Architecture

The Trinity system follows a **Model-View-Presenter (MVP)** architectural pattern with clear separation of concerns:

```
┌─────────────┐         ┌──────────────┐        ┌─────────────┐
│   React     │  HTTP   │    Django    │  ORM   │   SQLite/   │
│  Frontend   │ ◄─────► │  REST API    │ ◄────► │  PostgreSQL │
│  (View)     │  JSON   │ (Presenter)  │        │   (Model)   │
└─────────────┘         └──────────────┘        └─────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │ Open Food    │
                        │ Facts API    │
                        └──────────────┘
```

### Backend Modules

**Core Apps:**
1. **users** - Customer/User management
2. **products** - Inventory and product catalog
3. **invoices** - Transaction processing
4. **reports** - Analytics and KPIs
5. **core** - Shared utilities and base classes

### Frontend Structure

**Component Hierarchy:**
```
App (Router)
├── Layout (Navigation)
│   ├── Dashboard
│   ├── Products
│   ├── Customers
│   ├── Invoices
│   └── Reports
└── Login (Authentication)
```

## UML Diagrams

### Class Diagram

The class diagram illustrates the complete data model of the Trinity system, showing all entities, their attributes, and relationships.

![Class Diagram](docs/uml/class-diagram.puml)

**Key Entities:**
- **User**: Django's built-in authentication model
- **Customer**: Extended user profile with billing information
- **Category**: Product categorization
- **Product**: Inventory items with nutritional data from Open Food Facts
- **Invoice**: Customer purchase records
- **InvoiceItem**: Individual line items within invoices

**Key Relationships:**
1. User ↔ Customer (1:0..1) - Optional user authentication
2. Customer → Invoice (1:N) - Customer purchase history
3. Category → Product (1:N) - Product categorization
4. Product → InvoiceItem (1:N) - Product sales tracking
5. Invoice → InvoiceItem (1:N) - Invoice line items

### Activity Diagrams

#### 1. Invoice Creation Workflow
![Invoice Creation](docs/uml/activity-invoice-creation.puml)

This diagram shows the complete process of creating an invoice, including:
- User interaction on frontend
- Backend validation and processing
- Database transaction handling
- Stock management updates
- Error handling scenarios

#### 2. Product Synchronization with Open Food Facts
![Product Sync](docs/uml/activity-product-sync.puml)

This diagram illustrates:
- Barcode scanning and validation
- API integration with Open Food Facts
- Product data parsing and mapping
- Create/Update logic for products
- Sync frequency management

#### 3. User Authentication Flow
![Authentication](docs/uml/activity-authentication.puml)

This diagram covers:
- JWT token-based authentication
- Login process and token generation
- Token refresh mechanism
- Role-based routing (Manager vs Customer)
- Session management

#### 4. KPI Report Generation
![Reports](docs/uml/activity-reports.puml)

This diagram demonstrates:
- Report data aggregation
- Multiple metric calculations (revenue, products, customers)
- Data visualization preparation
- Export functionality

**Rendering UML Diagrams:**

The UML diagrams are written in PlantUML format (.puml files) located in `docs/uml/`. To view them:

1. **Online**: Use [PlantUML Online Server](http://www.plantuml.com/plantuml/uml/)
2. **VS Code**: Install the "PlantUML" extension
3. **Command Line**: 
   ```bash
   # Install PlantUML
   brew install plantuml  # macOS
   sudo apt-get install plantuml  # Ubuntu/Debian
   
   # Generate PNG images
   plantuml docs/uml/*.puml
   ```

## Database Schema

### Entity Relationship Diagram

```
┌──────────────┐          ┌──────────────┐
│   Customer   │          │   Product    │
├──────────────┤          ├──────────────┤
│ id (PK)      │          │ id (PK)      │
│ first_name   │          │ name         │
│ last_name    │          │ brand        │
│ email        │          │ price        │
│ phone_number │          │ category_id  │
│ address      │          │ quantity     │
│ city         │          │ barcode      │
│ country      │          │ ...          │
└──────┬───────┘          └──────┬───────┘
       │                         │
       │ 1:N                     │ 1:N
       ▼                         ▼
┌──────────────┐          ┌──────────────┐
│   Invoice    │───N:N───►│ InvoiceItem  │
├──────────────┤          ├──────────────┤
│ id (PK)      │          │ id (PK)      │
│ customer_id  │          │ invoice_id   │
│ invoice_no   │          │ product_id   │
│ status       │          │ quantity     │
│ total_amount │          │ unit_price   │
│ tax_amount   │          │ total_price  │
└──────────────┘          └──────────────┘

┌──────────────┐
│   Category   │
├──────────────┤
│ id (PK)      │
│ name         │
│ description  │
└──────────────┘
       │ 1:N
       └──────────► Product
```

### Key Relationships

1. **Customer → Invoice** (One-to-Many)
   - A customer can have multiple invoices
   - Each invoice belongs to one customer

2. **Product → InvoiceItem** (One-to-Many)
   - A product can appear in multiple invoice items
   - Snapshot pattern preserves product details at sale time

3. **Invoice → InvoiceItem** (One-to-Many)
   - An invoice contains multiple line items
   - Cascade delete for data integrity

4. **Category → Product** (One-to-Many)
   - Products organized by category
   - SET_NULL on category deletion

## API Design

### RESTful Principles

All endpoints follow REST conventions:
- **GET** - Retrieve resources
- **POST** - Create new resources
- **PUT** - Update existing resources
- **DELETE** - Remove resources

### Authentication Flow

```
1. Client sends credentials
   POST /api/auth/token/
   { username, password }

2. Server validates and returns JWT tokens
   { access, refresh }

3. Client stores tokens (localStorage)

4. Client includes token in requests
   Authorization: Bearer <access_token>

5. Token expires → Use refresh token
   POST /api/auth/token/refresh/
   { refresh }
```

### Response Format

Success (200/201):
```json
{
  "id": 1,
  "name": "Product Name",
  "field": "value"
}
```

Error (400/401/404/500):
```json
{
  "error": "Error message",
  "detail": "Detailed explanation"
}
```

### Pagination

List endpoints return paginated results:
```json
{
  "count": 100,
  "next": "http://api/products/?page=2",
  "previous": null,
  "results": [...]
}
```

## Security Implementation

### 1. Authentication & Authorization

**JWT Token System:**
- Access token: 60 minutes (configurable)
- Refresh token: 24 hours (configurable)
- Automatic token rotation on refresh
- Token blacklisting after rotation

### 2. CSRF Protection

- Django's built-in CSRF middleware
- CSRF tokens for state-changing operations
- Cookie-based CSRF validation

### 3. XSS Prevention

- Django template auto-escaping
- Content Security Policy headers
- React's built-in XSS protection

### 4. SQL Injection Protection

- Django ORM parameterized queries
- No raw SQL without proper escaping
- Input validation on all endpoints

### 5. CORS Configuration

- Whitelist allowed origins
- Credentials support for cookies
- Preflight request handling

### 6. Password Security

- Django's password validation
- Minimum length requirements
- Common password checking
- Password hashing with PBKDF2

## Data Flow

### Product Sync with Open Food Facts

```
1. Manager initiates sync with barcode
   ↓
2. Backend queries Open Food Facts API
   GET https://world.openfoodfacts.org/api/v2/product/{barcode}
   ↓
3. API returns product data (or 404)
   ↓
4. Backend parses nutritional information
   ↓
5. Create/Update product in database
   ↓
6. Return product to frontend
```

### Invoice Creation Flow

```
1. Frontend sends invoice data
   POST /api/invoices/
   {
     customer: 1,
     items: [{product, quantity, unit_price}, ...],
     payment_method: "card"
   }
   ↓
2. Backend validates data
   - Customer exists?
   - Products exist?
   - Quantities valid?
   ↓
3. Create Invoice object
   ↓
4. Create InvoiceItem objects
   ↓
5. Calculate totals (subtotal, tax, total)
   ↓
6. Save to database (transaction)
   ↓
7. Return invoice with items
```

### KPI Report Generation

```
1. Frontend requests reports
   GET /api/reports/?days=30
   ↓
2. Backend queries database
   - Aggregate functions (SUM, COUNT, AVG)
   - Filter by date range
   - Group by product/customer/category
   ↓
3. Calculate metrics
   - Total revenue
   - Average order value
   - Top products/customers
   - Revenue trends
   ↓
4. Format and return JSON
```

## Technology Choices

### Backend: Django + DRF

**Justification:**
- **Rapid Development**: "Batteries included" framework
- **ORM**: Powerful database abstraction
- **DRF**: Excellent REST API support
- **Security**: Built-in protections
- **Scalability**: Proven for large applications
- **Community**: Large ecosystem of packages

### Frontend: React + TypeScript

**Justification:**
- **Component-Based**: Reusable UI components
- **Type Safety**: TypeScript catches errors early
- **Performance**: Virtual DOM for efficiency
- **Ecosystem**: Rich library ecosystem
- **Developer Experience**: Excellent tooling

### UI Framework: Material-UI

**Justification:**
- **Consistency**: Professional design system
- **Accessibility**: WCAG compliant components
- **Responsive**: Mobile-first design
- **Customizable**: Themeable
- **Well-Documented**: Comprehensive docs

### State Management: React Query

**Justification:**
- **Server State**: Designed for API data
- **Caching**: Automatic cache management
- **Background Updates**: Keep data fresh
- **Optimistic Updates**: Better UX
- **DevTools**: Excellent debugging

### Authentication: JWT

**Justification:**
- **Stateless**: No server-side sessions
- **Scalable**: Works across multiple servers
- **Mobile-Friendly**: Easy to use in apps
- **Standard**: Industry best practice
- **Secure**: Signed and optionally encrypted

### Database: SQLite (dev) / PostgreSQL (prod)

**Justification:**
- **SQLite**: Zero configuration for development
- **PostgreSQL**: Production-grade features
  - ACID compliance
  - JSON support
  - Full-text search
  - Excellent performance
  - Open source

## Performance Considerations

### Database Optimization

1. **Indexes**: Added on frequently queried fields
2. **Select Related**: Reduce N+1 queries
3. **Prefetch Related**: Optimize reverse lookups
4. **Pagination**: Limit result sets

### API Optimization

1. **Serializer Optimization**: Different serializers for list/detail
2. **Query Parameters**: Filter, search, ordering
3. **Response Compression**: Gzip enabled
4. **Caching**: Redis for production (optional)

### Frontend Optimization

1. **Code Splitting**: Lazy load components
2. **Query Caching**: React Query automatic
3. **Image Optimization**: WebP, lazy loading
4. **Bundle Size**: Tree shaking, minification

## Scalability Path

### Horizontal Scaling

1. Load balancer
2. Multiple application servers
3. Shared database (PostgreSQL)
4. Redis for sessions/cache
5. CDN for static files

### Vertical Scaling

1. Database connection pooling
2. Celery for async tasks
3. Database read replicas
4. Query optimization

## Deployment Considerations

### Backend Deployment

- **Platform**: Heroku, AWS, DigitalOcean
- **WSGI Server**: Gunicorn
- **Reverse Proxy**: Nginx
- **Environment Variables**: For configuration
- **Static Files**: Served via CDN
- **Media Files**: S3 or similar

### Frontend Deployment

- **Build**: `npm run build`
- **Hosting**: Netlify, Vercel, AWS S3
- **CDN**: CloudFlare
- **Environment**: Separate dev/staging/prod

## Future Roadmap

1. **Testing**: Expand to >50% coverage
2. **CI/CD**: Automated testing and deployment
3. **Monitoring**: Application performance monitoring
4. **Logging**: Centralized logging system
5. **Docker**: Containerization
6. **Kubernetes**: Orchestration for scale
7. **GraphQL**: Alternative API option
8. **WebSockets**: Real-time updates

## Testing & Quality Assurance

### Unit Testing

The project uses **pytest** with **pytest-django** for comprehensive testing:

**Test Coverage:**
- `users` app - Customer management and authentication
- `products` app - Product CRUD and Open Food Facts sync
- `invoices` app - Invoice processing and calculations
- `reports` app - KPI and analytics generation

**Running Tests:**
```bash
cd backend
pytest                    # Run all tests
pytest -v                 # Verbose output
pytest users/            # Test specific app
pytest --cov             # With coverage report
```

**Test Reports Generated:**
1. **HTML Test Report** (`test-report.html`) - Detailed test results
2. **HTML Coverage Report** (`htmlcov/index.html`) - Line-by-line coverage
3. **XML Coverage Report** (`coverage.xml`) - For CI/CD integration

### CI/CD Pipeline

**GitHub Actions Workflow** (`.github/workflows/ci-cd.yml`):

1. **Test Stage**:
   - Run pytest with coverage
   - Generate test reports
   - Upload artifacts (visible in Actions tab)
   - Display coverage summary

2. **Build & Deploy Stage**:
   - Build Docker images
   - Push to Docker Hub
   - Deploy to EC2 instance
   - Auto-restart services

**Viewing Test Reports in CI/CD:**
- Navigate to GitHub Actions → Latest workflow run
- Scroll to "Artifacts" section
- Download "test-results" artifact
- Extract and open `test-report.html` or `htmlcov/index.html`

**Pipeline Visibility:**
- ✅ Test pass/fail status shown in each commit
- 📊 Coverage percentage displayed in job summary
- 📄 Downloadable reports for detailed analysis
- 🔄 Automatic deployment on successful tests

For detailed testing documentation, see [docs/TESTING.md](docs/TESTING.md).

---

**Documentation Version:** 2.0  
**Last Updated:** January 2026  
**Maintained By:** Trinity Development Team

