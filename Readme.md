# 🚀 LogiChain - Enterprise Supply Chain Management System

<div align="center">

<img width="746" height="346" alt="image" src="https://github.com/user-attachments/assets/7ce81352-91b3-4450-9e76-965f9572a4c7" />

**Real-Time Warehouse & Shipment Orchestration Platform**

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.0+-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.0+-blue.svg)](https://reactjs.org/)
[![.NET](https://img.shields.io/badge/.NET-7.0-purple.svg)](https://dotnet.microsoft.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Features](#-features) • [Architecture](#-architecture) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [API Docs](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Environment Configuration](#-environment-configuration)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Security](#-security)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**LogiChain** is an enterprise-grade, full-stack logistics and supply chain management platform designed to provide **real-time visibility** across warehouse inventory, shipment tracking, and order management. 

Built with a **microservices architecture**, LogiChain eliminates supply chain opacity by centralizing authentication, inventory management, shipment tracking, analytics, and distributed logging into a single, scalable system.

### Why LogiChain?

- ✅ **Real-time tracking** of inventory and shipments
- ✅ **Role-based access control** for 5 different user roles
- ✅ **Microservices architecture** for scalability
- ✅ **Distributed logging** with .NET microservice
- ✅ **Production-ready** security and authentication
- ✅ **Modern UI/UX** with React and Tailwind CSS
- ✅ **OAuth 2.0** integration (Google, GitHub)

---

## ✨ Features

### 🏢 **Multi-Role Support**

- **Admin** - Full system control, user management, analytics
- **Product Manager** - Product catalog and pricing management
- **Warehouse Manager** - Inventory and warehouse operations
- **Customer Support** - Order and return management
- **Customer** - Order placement and tracking

### 📦 **Core Capabilities**

| Feature | Description |
|---------|-------------|
| **Inventory Management** | Real-time stock tracking across multiple warehouses |
| **Order Processing** | End-to-end order lifecycle management |
| **Shipment Tracking** | Live shipment status updates with carrier integration |
| **Product Catalog** | Comprehensive product management system |
| **Returns Management** | Streamlined return and refund processing |
| **Analytics Dashboard** | Real-time KPIs and business insights |
| **Notification System** | Multi-channel alerts (Email) via Resend API |
| **Audit Logging** | Centralized logging microservice (.NET) |

### 🔐 **Security Features**

- JWT-based stateless authentication
- OAuth 2.0 integration (Google, GitHub)
- Role-based access control (RBAC)
- Password reset with OTP verification
- Secure API endpoints with authorization
- Environment-based configuration management

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
│            (React SPA - Responsive & Mobile Ready)          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ├── HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   Spring Boot    │ │  ASP.NET Core    │ │   MySQL          │
│   Backend API    │ │  Logger Service  │ │   Database       │
│   (Port 8080)    │ │   (Port 5136)    │ │   (Port 3306)    │
└──────────────────┘ └──────────────────┘ └──────────────────┘
         │                    │                     │
         └────────────────────┴─────────────────────┘
                              │
                    Shared MySQL Instance
```

### Architecture Highlights

- **Microservices Design** - Separate services for business logic and logging
- **Polyglot Architecture** - Java Spring Boot + ASP.NET Core
- **RESTful APIs** - Standardized communication between services
- **Centralized Database** - MySQL with optimized schemas
- **Distributed Logging** - Dedicated .NET logging microservice

---

## 🛠️ Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Java** | 17+ | Core language |
| **Spring Boot** | 3.0+ | Application framework |
| **Spring Security** | 6.0+ | Authentication & Authorization |
| **Spring Data JPA** | 3.0+ | Database ORM |
| **Hibernate** | 6.0+ | JPA implementation |
| **Maven** | 3.8+ | Build tool |
| **JWT** | 0.11.5 | Token-based auth |
| **Lombok** | 1.18+ | Boilerplate reduction |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2+ | UI framework |
| **Vite** | 4.0+ | Build tool |
| **React Router** | 6.8+ | Client-side routing |
| **Axios** | 1.3+ | HTTP client |
| **Tailwind CSS** | 3.2+ | Styling framework |
| **Recharts** | 2.5+ | Data visualization |
| **Lucide React** | - | Icon library |
| **React Toastify** | - | Notifications |

### Logging Microservice

| Technology | Version | Purpose |
|------------|---------|---------|
| **ASP.NET Core** | 7.0+ | Framework |
| **C#** | 11.0+ | Language |
| **MySQL Connector** | 8.0+ | Database driver |

### Database

| Technology | Version | Purpose |
|------------|---------|---------|
| **MySQL** | 8.0+ | Primary database |
| **MySQL Workbench** | 8.0+ | Database management |

### DevOps & Tools

| Technology | Purpose |
|------------|---------|
| **Git** | Version control |
| **Docker** | Containerization |
| **Postman** | API testing |

---

## 📁 Project Structure

```
LogiChain/
│
├── Backend/                          # Spring Boot Backend
│   ├── src/main/java/
│   │   └── com/logichain/
│   │       ├── config/              # Security, CORS, JWT config
│   │       ├── controller/          # REST controllers
│   │       ├── dto/                 # Data Transfer Objects
│   │       ├── entities/            # JPA entities
│   │       ├── exception/           # Custom exceptions
│   │       ├── repository/          # JPA repositories
│   │       ├── security/            # JWT, filters, handlers
│   │       └── service/             # Business logic
│   ├── src/main/resources/
│   │   ├── application.properties   # Main configuration
│   │   └── application-env.properties # Environment config
│   └── pom.xml                      # Maven dependencies
│
├── Frontend/                         # React Frontend
│   ├── src/
│   │   ├── components/              # Reusable components
│   │   ├── pages/                   # Page components
│   │   │   ├── admin/               # Admin pages
│   │   │   ├── auth/                # Login, Register
│   │   │   ├── customer/            # Customer pages
│   │   │   ├── dashboards/          # Role dashboards
│   │   │   ├── productmanager/      # Product manager pages
│   │   │   ├── support/             # Support pages
│   │   │   └── warehouse/           # Warehouse pages
│   │   ├── services/                # API service layer
│   │   └── App.jsx                  # Main app component
│   ├── .env                         # Environment variables
│   └── package.json                 # Dependencies
│
└── Logger/                           # ASP.NET Logger Microservice
    ├── Controllers/                 # API controllers
    ├── Models/                      # Data models
    ├── Services/                    # Business logic
    └── Program.cs                   # Application entry point
```

---

## 🚀 Installation & Setup

### Prerequisites

Before you begin, ensure you have:

- ✅ **Java JDK 17+** - [Download](https://www.oracle.com/java/technologies/downloads/)
- ✅ **Node.js 18+** - [Download](https://nodejs.org/)
- ✅ **MySQL 8.0+** - [Download](https://dev.mysql.com/downloads/)
- ✅ **.NET SDK 7.0+** - [Download](https://dotnet.microsoft.com/download)
- ✅ **Maven 3.8+** - [Download](https://maven.apache.org/download.cgi)
- ✅ **Git** - [Download](https://git-scm.com/downloads)

### Clone the Repository

```bash
# Clone all repos
git clone https://github.com/YOUR_USERNAME/logichain-backend.git
git clone https://github.com/YOUR_USERNAME/logichain-frontend.git
git clone https://github.com/YOUR_USERNAME/logichain-logger.git
```

---

### Step 1: Database Setup

```bash
# Start MySQL server
mysql.server start  # Mac/Linux
# OR
net start MySQL80   # Windows

# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE logiii;
```

---

### Step 2: Backend Setup (Spring Boot)

```bash
cd logichain-backend

# Configure application-env.properties
# See Environment Configuration section below

# Build and run
mvn clean install
mvn spring-boot:run
```

**Backend runs at:** `http://localhost:8080`

---

### Step 3: Frontend Setup (React)

```bash
cd logichain-frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8080/" > .env

# Run development server
npm run dev
```

**Frontend runs at:** `http://localhost:5173`

---

### Step 4: Logger Setup (ASP.NET)

```bash
cd logichain-logger

# Restore dependencies
dotnet restore

# Run the service
dotnet run
```

**Logger runs at:** `http://localhost:5136`

---

## ⚙️ Environment Configuration

### Backend (`application-env.properties`)

```properties
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=logiii
DB_USERNAME=root
DB_PASSWORD=root123

# Server Configuration
SERVER_PORT=8080

# JWT Configuration
JWT_SECRET=617b7c292a0698a897e6ff73324285be2ca049857c8802e26a4cce2214d899c4
JWT_EXPIRATION_TIME=7200000

# Email Configuration (Resend)
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@logichain.com
RESEND_FROM_NAME=LogiChain

# Default Admin
DEFAULT_ADMIN_ENABLED=true
DEFAULT_ADMIN_EMAIL=admin@logichain.com
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=admin123

# CORS
ALLOWED_ORIGINS=http://localhost:5173

# Logger Service
LOGGER_URL=http://localhost:5136/logs
```

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:8080/
```

### Logger (`launchSettings.json`)

```json
{
  "profiles": {
    "http": {
      "environmentVariables": {
        "DB_HOST": "localhost",
        "DB_PORT": "3306",
        "DB_NAME": "logiii",
        "DB_USERNAME": "root",
        "DB_PASSWORD": "root123"
      },
      "applicationUrl": "http://localhost:5136"
    }
  }
}
```

---

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | User login | ❌ |
| POST | `/auth/forgot-password` | Request password reset | ❌ |
| POST | `/auth/verify-otp` | Verify OTP | ❌ |
| POST | `/auth/reset-password` | Reset password | ❌ |
| POST | `/auth/oauth2/google` | Google OAuth | ❌ |
| POST | `/auth/oauth2/github` | GitHub OAuth | ❌ |

### Product Management

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/products` | Get all products | Public |
| GET | `/products/{id}` | Get product by ID | Public |
| POST | `/products` | Create product | ADMIN, PRODUCT_MANAGER |
| PUT | `/products/{id}` | Update product | ADMIN, PRODUCT_MANAGER |
| DELETE | `/products/{id}` | Delete product | ADMIN, PRODUCT_MANAGER |

### Order Management

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/orders` | Get all orders | ADMIN, WAREHOUSE_MANAGER, CUSTOMER_SUPPORT |
| GET | `/orders/{id}` | Get order by ID | Authenticated |
| POST | `/orders` | Create order | CUSTOMER |
| PUT | `/orders/{id}` | Update order | ADMIN, WAREHOUSE_MANAGER |
| GET | `/orders/customer/{id}` | Get customer orders | CUSTOMER |

### User Management

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/users` | Get all users | ADMIN, CUSTOMER_SUPPORT |
| GET | `/users/{id}` | Get user by ID | ADMIN, CUSTOMER_SUPPORT |
| PUT | `/users/{id}` | Update user | ADMIN |
| DELETE | `/users/{id}` | Delete user | ADMIN |

---

## 🗄️ Database Schema

### Core Entities

```sql
-- Users Table
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'PRODUCT_MANAGER', 'WAREHOUSE_MANAGER', 
              'CUSTOMER_SUPPORT', 'CUSTOMER'),
    approval_status ENUM('PENDING', 'APPROVED', 'REJECTED'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    weight DOUBLE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id BIGINT NOT NULL,
    order_status ENUM('PENDING', 'CONFIRMED', 'SHIPPED', 
                      'DELIVERED', 'CANCELLED'),
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Application Logs (.NET Logger)
CREATE TABLE application_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    level VARCHAR(10) NOT NULL,
    message TEXT NOT NULL,
    source VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔒 Security

### Authentication Flow

1. User enters credentials
2. Backend validates credentials with BCrypt
3. JWT token generated (2-hour expiration)
4. Token sent to client
5. Client stores token in localStorage
6. Token included in Authorization header
7. Backend validates token on each request

### Security Features

- ✅ **Password Hashing** - BCrypt with salt
- ✅ **JWT Tokens** - Stateless authentication
- ✅ **CORS Protection** - Configured origins
- ✅ **SQL Injection Prevention** - Parameterized queries
- ✅ **Role-Based Access** - Fine-grained permissions
- ✅ **OAuth 2.0** - Google & GitHub integration

---

## 🚢 Deployment

### Production Deployment (Oracle Cloud)

See [SUPER_SIMPLE_DEPLOYMENT.md](SUPER_SIMPLE_DEPLOYMENT.md) for step-by-step guide.

**Features:**
- ✅ Single server deployment
- ✅ Systemd service management
- ✅ Auto-restart on failure
- ✅ $0 cost (Oracle Free Tier)

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Your Name**

- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Profile](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

Made with ❤️ for the supply chain industry

</div>
