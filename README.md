# immigrant-database-platform

A full-stack backend platform built with **Django + MySQL** for managing, filtering, and analyzing digitized historical immigrant records.  

This project demonstrates **software engineering principles**: scalable database design, data pipelines, custom admin tools, and API-ready infrastructure.

---

## Features
- **Data Import & Cleaning**
  - Automated ingestion from Excel spreadsheets
  - Robust date parsing (`safe_date`) and normalization
  - Handles null/unknown values gracefully

- **Relational Database Models**
  - Core `Passenger` model with relations:
    - `LaborerInfo`
    - `MerchantInfo`
    - `TransitInfo`
    - `WifeChildInfo`
    - `ExemptInfo`
  - Ensures **one-to-one mappings** and normalized schema

- **Custom Django Admin**
  - **Checkbox Filters** for multi-category selection
  - **Age Group Filter** calculated dynamically at arrival date (Child / Adult / Elder / Unknown)
  - Inline editing for all related subcategories
  - Search and filter by name, ship, port, destination, class, and demographics

- **Software Engineering Highlights**
  - Modular design (`admin_filters.py`, `scripts/`, `templates/`)
  - Reusable filter base class with custom HTML template
  - Extensible for REST API endpoints
  - Ready for containerization (Docker)

---

## Tech Stack
- **Backend Framework:** Django 5.x
- **Database:** MySQL / SQLite (for development)
- **Data Processing:** Python, Pandas
- **Admin UI:** Django Admin with custom templates
- **Deployment Ready:** Docker, pip/venv

---

## 📂 Project Structure
records/
├── admin.py # Admin configuration
├── admin_filters.py # Custom checkbox & age filters
├── models.py # Passenger & related info models
├── scripts/ # Data import pipeline (Excel → DB)
└── templates/admin/ # Custom checkbox_filter.html
