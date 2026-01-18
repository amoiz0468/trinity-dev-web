# 🛒 TRINITY - DEV WEB

A comprehensive grocery chain management system with a Django REST API backend and React frontend.

## 📋 Project Overview

Trinity is a full-stack web application designed for grocery chain back office operations. It enables store managers to:

- **Track Products**: Efficiently manage product inventory with stock levels
- **Manage Customers**: Handle customer information and purchase history
- **Process Invoices**: Create and manage sales transactions
- **Visualize KPIs**: Monitor key performance indicators through interactive dashboards
- **Integrate with Open Food Facts**: Automatically fetch product information

## 📦 Project Deliverables

This project includes all required deliverables:

1. ✅ **Source Code** - Complete backend and frontend implementation
2. ✅ **Technical Documentation** - See [TECHNICAL_DOCUMENTATION.md](TECHNICAL_DOCUMENTATION.md)
   - Architecture and components
   - Technology choices with justifications
   - Data flow descriptions
3. ✅ **UML Diagrams** - See [docs/uml/](docs/uml/)
   - Class diagram showing data structures and relationships
   - Activity diagrams for key workflows
4. ✅ **Unit Tests Report** - Visible in CI/CD pipeline
   - Automated test execution
   - Coverage reports
   - Downloadable artifacts

📄 **Full deliverables checklist**: [DELIVERABLES.md](DELIVERABLES.md)

## 🏗️ Architecture

### Technology Stack

**Backend:**
- Django 4.2.7
- Django REST Framework 3.14.0
- JWT Authentication (djangorestframework-simplejwt)
- SQLite (development) / PostgreSQL (production ready)
- Python 3.13

**Frontend:**
- React 18.2.0
- TypeScript
- Material-UI (MUI) 5
- React Query for data management
- Recharts for data visualization
- Vite for build tooling

### Project Structure

```
trinity-dev-web/
├── backend/                    # Django REST API
│   ├── trinity_backend/       # Main Django project
│   ├── users/                 # Customer management app
│   ├── products/              # Product inventory app
│   ├── invoices/              # Invoice processing app
│   ├── reports/               # Analytics and KPIs app
│   ├── core/                  # Shared utilities
│   ├── requirements.txt       # Python dependencies
│   └── manage.py
│
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service layer
│   │   ├── types/            # TypeScript definitions
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Python 3.13+
- Node.js 18+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

5. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

6. **Create superuser:**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start development server:**
   ```bash
   python manage.py runserver
   ```

The API will be available at `http://localhost:8000/api/`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

## 📚 API Documentation

### Authentication

All API endpoints require JWT authentication. Obtain tokens via:

```
POST /api/auth/token/
{
  "username": "your_username",
  "password": "your_password"
}
```

Include the access token in subsequent requests:
```
Authorization: Bearer <access_token>
```

### API Endpoints Summary

- **Users**: `/api/users/` - CRUD operations for customers
- **Products**: `/api/products/` - Product inventory management
- **Invoices**: `/api/invoices/` - Invoice processing
- **Reports**: `/api/reports/` - Analytics and KPIs

Interactive API Documentation: `http://localhost:8000/api/docs/`

## 🔑 Key Features

### 1. Product Management (CRUD + Open Food Facts)
### 2. Customer Management with Purchase History
### 3. Invoice Processing with Multiple Payment Methods
### 4. Reporting & Analytics (8 KPIs)
### 5. JWT-based Security

## 🧪 Testing

### Running Tests Locally

```bash
cd backend
pytest
```

This generates:
- `test-report.html` - Detailed test execution report
- `htmlcov/index.html` - Interactive coverage report
- `coverage.xml` - Machine-readable coverage data

### CI/CD Test Reports

Tests run automatically on every push to `dev_depl` branch:

1. Navigate to **GitHub Actions** tab
2. Select the latest workflow run
3. Scroll to **"Artifacts"** section
4. Download **"test-results"** artifact
5. Extract and open HTML reports in browser

**Coverage Target:** 70%+ code coverage

📚 **Detailed testing guide**: [docs/TESTING.md](docs/TESTING.md)

## 📐 UML Diagrams

The project includes comprehensive UML diagrams:

- **Class Diagram** - Complete data model with relationships
- **Activity Diagrams**:
  - Invoice Creation Workflow
  - Product Synchronization with Open Food Facts
  - User Authentication Flow
  - Report Generation Process

📐 **View diagrams**: [docs/uml/](docs/uml/) | [How to render](docs/uml/README.md)

## � Documentation

- **[TECHNICAL_DOCUMENTATION.md](TECHNICAL_DOCUMENTATION.md)** - Complete technical documentation
  - System architecture
  - Components and modules
  - Technology choices and justifications
  - Data flows and business processes
  - Security implementation
  - Performance considerations

- **[DELIVERABLES.md](DELIVERABLES.md)** - Project deliverables checklist

- **[docs/TESTING.md](docs/TESTING.md)** - Testing guide and coverage reports

- **[docs/uml/](docs/uml/)** - UML diagrams (PlantUML format)

## �📄 License

Trinity Dev Web Project - Educational/Commercial Use

---

**Built for efficient grocery chain management**
