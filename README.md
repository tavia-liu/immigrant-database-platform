# immigrant-database-platform

A Django + MySQL backend for managing and analyzing historical immigrant records.  

This project demonstrates **software engineering principles**: scalable database design, data pipelines, custom admin tools, and API-ready infrastructure.

---

## Features

### Data Import & Cleaning
- Automated ingestion from Excel spreadsheets
- Robust date parsing (`safe_date`) and normalization
- Handles null/unknown values gracefully

### Relational Database Models
- Core **`Passenger`** model with linked one-to-one relations:
  - `LaborerInfo`
  - `MerchantInfo`
  - `TransitInfo`
  - `WifeChildInfo`
  - `ExemptInfo`
- Ensures **normalized schema** and referential integrity

### Custom Django Admin
- **Checkbox Filters** for multi-category selection
- **Age Group Filter** calculated dynamically at arrival date  
  *(Child / Adult / Elder / Unknown)*
- Inline editing for all related subcategories
- Search and filter by name, ship, port, destination, class, and demographics

---

## Engineering Focus
- Backend architecture & relational database design
- Data ingestion pipelines & cleaning with Pandas
- Admin interface customization (filters, templates, inline models)
- Extensible for REST API endpoints
- Containerization-ready (Docker)

---

## Tech Stack
- **Backend Framework:** Django 5.x
- **Database:** MySQL / SQLite (for development)
- **Data Processing:** Python, Pandas
- **Admin UI:** Django Admin with custom templates
- **Deployment:** Docker, pip/venv

---

## 📂 Project Structure
records/
├── admin.py # Admin configuration
├── admin_filters.py # Custom checkbox & age filters
├── models.py # Passenger & related info models
├── scripts/ # Data import pipeline (Excel → DB)
└── templates/admin/ # Custom checkbox_filter.html
