# UML Diagrams

This directory contains UML diagrams for the Trinity Development Web application.

## Diagrams

### 1. Class Diagram (`class-diagram.puml`)
Shows the complete data model including:
- Django models (User, Customer, Category, Product, Invoice, InvoiceItem)
- Attributes and data types
- Relationships and cardinalities
- Key methods and properties

### 2. Activity Diagrams

#### Invoice Creation (`activity-invoice-creation.puml`)
Workflow for creating customer invoices:
- Product selection and validation
- Stock checking
- Invoice generation
- Payment processing
- Database transactions

#### Product Synchronization (`activity-product-sync.puml`)
Integration with Open Food Facts API:
- Barcode scanning
- API querying
- Data parsing and mapping
- Product creation/update
- Sync management

#### User Authentication (`activity-authentication.puml`)
Authentication and authorization flow:
- Login process
- JWT token generation
- Token refresh mechanism
- Role-based access control
- Session management

#### Report Generation (`activity-reports.puml`)
KPI and analytics workflow:
- Data aggregation
- Metric calculation
- Visualization preparation
- Export functionality

## Viewing the Diagrams

### Option 1: Online Viewer
1. Go to [PlantUML Online Server](http://www.plantuml.com/plantuml/uml/)
2. Copy the content of any .puml file
3. Paste it into the editor
4. The diagram will render automatically

### Option 2: VS Code Extension
1. Install the "PlantUML" extension by jebbs
2. Open any .puml file
3. Press `Alt+D` (or `Option+D` on macOS) to preview
4. Or right-click and select "Preview Current Diagram"

### Option 3: Command Line
```bash
# Install PlantUML (requires Java)
# macOS
brew install plantuml

# Ubuntu/Debian
sudo apt-get install plantuml

# Windows (using Chocolatey)
choco install plantuml

# Generate PNG images
plantuml *.puml

# Generate SVG (scalable)
plantuml -tsvg *.puml

# Generate PDF
plantuml -tpdf *.puml
```

### Option 4: Docker
```bash
# Generate all diagrams as PNG
docker run -v $(pwd):/data plantuml/plantuml *.puml

# Generate as SVG
docker run -v $(pwd):/data plantuml/plantuml -tsvg *.puml
```

## File Format

All diagrams use PlantUML syntax (.puml files). PlantUML is a text-based diagramming tool that allows:
- Version control friendly (plain text)
- Easy collaboration
- Automatic layout
- Multiple export formats (PNG, SVG, PDF)

## Integration with Documentation

These diagrams are referenced in the main `TECHNICAL_DOCUMENTATION.md` file and provide visual representation of:
- System architecture
- Data structures
- Business processes
- User workflows

## Updating Diagrams

When the application structure changes:
1. Edit the corresponding .puml file
2. Regenerate images if needed
3. Update references in documentation
4. Commit both source (.puml) and generated images

## Resources

- [PlantUML Official Documentation](https://plantuml.com/)
- [PlantUML Class Diagram Guide](https://plantuml.com/class-diagram)
- [PlantUML Activity Diagram Guide](https://plantuml.com/activity-diagram-beta)
- [Real World PlantUML Examples](https://real-world-plantuml.com/)
