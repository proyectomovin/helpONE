
---
name: Feature Adder
type: knowledge
version: 1.0.0
agent: CodeActAgent
triggers: []
---

# Feature Adder Microagent

## Purpose
This microagent is designed to help add features to the helpONE open source software. It provides guidance on the project structure, coding standards, and feature implementation processes.

## Project Structure Overview
The helpONE project follows this structure:
- `src/` - Main source code directory
- `public/` - Static assets (CSS, JS, images)
- `plugins/` - Plugin system for extendability
- `test/` - Test files
- `kubernetes/` - Kubernetes deployment configurations

## Feature Implementation Guidelines

### 1. Understanding Requirements
Before implementing a feature:
- Clearly define the feature scope and requirements
- Identify which components will be affected
- Check existing issues and PRs for similar work

### 2. Code Organization
- Place backend code in `src/controllers/`, `src/models/`, or `src/routes/`
- Place frontend code in `public/js/` and `public/css/`
- Add new views in `src/views/`
- Create tests in `test/` directory

### 3. Coding Standards
- Follow existing code style and patterns
- Use async/await for database operations
- Add appropriate error handling
- Include JSDoc comments for new functions
- Write tests for new functionality

### 4. Database Changes
- For new models, create files in `src/models/`
- For schema changes, update migration scripts in `src/migration/`
- Update database indexes as needed

### 5. API Endpoints
- Add new routes in `src/routes/`
- Follow RESTful conventions
- Include proper authentication/authorization
- Validate input data

### 6. Testing
- Write unit tests for new functionality
- Add integration tests for API endpoints
- Test with different user roles/permissions

## Common Feature Types

### Adding a New Module
1. Create controller in `src/controllers/`
2. Create model in `src/models/` (if needed)
3. Add routes in `src/routes/`
4. Create views in `src/views/`
5. Add client-side code in `public/js/`

### Extending Existing Functionality
1. Identify the component to extend
2. Add new methods or modify existing ones
3. Update related tests
4. Document changes in code comments

## Implementation Process
1. Create a new branch with descriptive name
2. Implement feature following guidelines above
3. Write tests and ensure they pass
4. Update documentation if needed
5. Create pull request with detailed description
