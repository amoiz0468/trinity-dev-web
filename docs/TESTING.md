# Testing and Coverage Reports

This document explains how to run tests and generate coverage reports for the Trinity Development Web backend.

## Running Tests

### Basic Test Execution

```bash
# From the backend directory
cd backend

# Run all tests
pytest

# Run tests for a specific app
pytest users/
pytest products/
pytest invoices/

# Run a specific test file
pytest users/tests.py

# Run a specific test
pytest users/tests.py::TestCustomerAPI::test_create_customer
```

### Verbose Output

```bash
# Detailed test output
pytest -v

# Even more details
pytest -vv

# Show print statements
pytest -s
```

## Test Reports

The project generates three types of test reports automatically:

### 1. HTML Test Report (`test-report.html`)

Shows detailed test execution results:
- Test status (passed/failed/skipped)
- Execution time for each test
- Error messages and tracebacks
- Summary statistics

**Generated automatically during test runs**

```bash
pytest  # Generates test-report.html
```

Open in browser:
```bash
open test-report.html  # macOS
xdg-open test-report.html  # Linux
start test-report.html  # Windows
```

### 2. HTML Coverage Report (`htmlcov/index.html`)

Interactive coverage report showing:
- Overall coverage percentage
- Coverage per file/module
- Line-by-line coverage highlighting
- Missing lines in red

```bash
pytest  # Generates htmlcov/ directory

# Open coverage report
open htmlcov/index.html  # macOS
xdg-open htmlcov/index.html  # Linux
start htmlcov/index.html  # Windows
```

### 3. XML Coverage Report (`coverage.xml`)

Machine-readable coverage data for:
- CI/CD integration
- Code quality tools
- IDE integration

```bash
pytest  # Generates coverage.xml
```

## Coverage Targets

Current coverage includes:
- ✅ `users` app - Customer management
- ✅ `products` app - Product and inventory
- ✅ `invoices` app - Invoice processing
- ✅ `reports` app - Analytics and KPIs

### Coverage Goals

- **Minimum**: 70% coverage
- **Target**: 80% coverage
- **Ideal**: 90%+ coverage

### Checking Coverage

```bash
# Terminal summary
pytest --cov-report=term-missing

# Coverage percentage only
pytest --cov-report=term:skip-covered

# Fail if coverage below threshold
pytest --cov-fail-under=70
```

## CI/CD Integration

Tests and coverage reports are automatically generated in the CI/CD pipeline:

### GitHub Actions Workflow

```yaml
- name: Run backend tests
  run: pytest
  working-directory: backend

- name: Upload test results
  uses: actions/upload-artifact@v4
  with:
    name: test-results
    path: |
      backend/test-report.html
      backend/htmlcov/
      backend/coverage.xml
```

### Viewing Reports in CI/CD

1. **Go to GitHub Actions**: Navigate to your repository's Actions tab
2. **Select Workflow Run**: Click on the latest CI/CD run
3. **Download Artifacts**: Scroll to "Artifacts" section
4. **Download test-results**: Contains all reports
5. **Extract and Open**: Unzip and open HTML files in browser

### Coverage Summary in Pipeline

The pipeline displays coverage percentage in the job summary:
- 📊 Coverage percentage
- Link to detailed reports
- Pass/fail status

## Test Structure

### Test Organization

```
backend/
├── users/
│   └── tests.py          # Customer API tests
├── products/
│   └── tests.py          # Product API tests
├── invoices/
│   └── tests.py          # Invoice API tests (to be added)
├── reports/
│   └── tests.py          # Reports API tests (to be added)
└── conftest.py           # Shared fixtures
```

### Fixtures (conftest.py)

Shared test fixtures available:
- `api_client` - Unauthenticated client
- `authenticated_client` - Authenticated regular user
- `staff_client` - Authenticated staff user
- `user` - Test user instance
- `staff_user` - Test staff user instance
- `customer` - Test customer instance
- `category` - Test category instance
- `product` - Test product instance

## Writing Tests

### Test Template

```python
import pytest
from rest_framework import status

@pytest.mark.django_db
class TestMyAPI:
    def test_list_items(self, authenticated_client):
        """Test listing items"""
        response = authenticated_client.get('/api/items/')
        assert response.status_code == status.HTTP_200_OK
        
    def test_create_item(self, staff_client):
        """Test creating an item"""
        data = {'name': 'Test Item'}
        response = staff_client.post('/api/items/', data)
        assert response.status_code == status.HTTP_201_CREATED
```

### Best Practices

1. **Use Descriptive Names**: `test_create_customer_with_valid_data`
2. **One Assertion Per Test**: Focus on single behavior
3. **Use Fixtures**: Leverage shared test data
4. **Mark Database Tests**: Use `@pytest.mark.django_db`
5. **Test Edge Cases**: Empty data, invalid input, permissions
6. **Clean Test Data**: Use transactions (automatic rollback)

## Continuous Improvement

### Adding New Tests

1. Identify untested code areas
2. Write test cases
3. Run tests locally
4. Verify coverage increase
5. Commit and push (CI will run automatically)

### Monitoring Coverage

```bash
# See what's not covered
pytest --cov-report=term-missing

# Generate detailed report
pytest --cov-report=html
open htmlcov/index.html
```

### Current Test Status

✅ **Implemented**:
- User/Customer CRUD operations
- Authentication and permissions
- Product management
- Product model methods

🔄 **In Progress**:
- Invoice creation and management
- Report generation
- Edge cases and error handling

📋 **Planned**:
- Integration tests
- Performance tests
- End-to-end tests

## Troubleshooting

### Tests Not Running

```bash
# Verify pytest installation
pip install -r requirements.txt

# Check Django settings
export DJANGO_SETTINGS_MODULE=trinity_backend.settings

# Run with verbose output
pytest -v
```

### Coverage Not Generated

```bash
# Verify pytest-cov is installed
pip install pytest-cov

# Check pytest.ini configuration
cat pytest.ini
```

### Import Errors

```bash
# Ensure you're in the backend directory
cd backend

# Verify Python path
python -c "import sys; print(sys.path)"
```

## Resources

- [pytest Documentation](https://docs.pytest.org/)
- [pytest-django Documentation](https://pytest-django.readthedocs.io/)
- [pytest-cov Documentation](https://pytest-cov.readthedocs.io/)
- [Django Testing Guide](https://docs.djangoproject.com/en/4.2/topics/testing/)
