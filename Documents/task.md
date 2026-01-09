# HR Management System - Comprehensive Enhancements

## Phase 1: Core Translations & Missing Keys ✅ COMPLETED
- [x] Add missing translation keys across all languages
  - [x] Add keys to English (en.json)
  - [x] Add keys to French (fr.json)
  - [x] Add keys to Arabic (ar.json)
  - [x] Add keys to German (de.json)
  - [x] Add keys to Spanish (es.json)
  - [x] Add keys to Hindi (hi.json)
  - [x] Add keys to Chinese (zh.json)
- [ ] Update professional naming for "param entreprise" in all languages (already using "Company Settings")
- [x] Update welcome message to professional version in all languages
- [x] Review and verify all translation keys consistency across languages

## Phase 2: Authentication &  Session Management
- [ ] Create sessionService for user connection management
- [ ] Track device connection status
- [ ] Auto-disconnect user if accessing pages while logged out
- [ ] Implement session validation on route changes

## Phase 3: Data Model Constraints
- [ ] Enforce one team per employee constraint in data model
- [ ] Enforce one company per employee constraint in data model
- [ ] Enforce one company per team constraint
- [ ] Update schema with new constraints
- [ ] Add email uniqueness validation
- [ ] Add birthDate field and remove age field

## Phase 4: Role-Based Access Control (RBAC)
- [ ] Create rbacService.ts with permission functions
- [ ] Implement page-level access control
- [ ] Filter global search by role
- [ ] Configure employee addition (Admin & RH only)
- [ ] Configure invoice access (Admin & RH only)
- [ ] Configure payroll access by role
- [ ] Configure pending approvals view by role

## Phase 5: Navigation & Menu Structure
- [ ] Remove "Mon équipe" from main menu
- [ ] Add team section to Profile screen
- [ ] Display "not assigned to company" message when needed
- [ ] Fix department/service navigation back button
- [ ] Add analytics to general section
- [ ] Make menu responsive
- [ ] Implement user menu rearrangement feature

## Phase 6: Analytics Pages Refactoring
- [ ] Create employee-specific analytics page
- [ ] Create role-based TeamAnalyticsScreen
- [ ] Filter analytics by user role

## Phase 7: Add Illness Screen Improvements
- [ ] Replace field labels with translations
- [ ] Auto-fill employee name for logged-in user
- [ ] Create RH/Admin version with employee dropdown
- [ ] Remove "local" field
- [ ] Update date fields with proper labels
- [ ] Display calculated days count
- [ ] Role-based planning visibility

## Phase 8: Add Leave Screen Improvements
- [ ] Add status field (default: pending, hidden for employees)
- [ ] Replace "Titre" with "Objet"
- [ ] Replace "Lieu de travail" with "Cause"
- [ ] Add web and mobile reminder on creation
- [ ] Fix save handler
- [ ] Add success/error messages

## Phase 9: Add Claim Screen Improvements
- [ ] Dynamic material dropdown based on selection
- [ ] Form validation
- [ ] Success/error messages

## Phase 10: Add Invoice Screen Improvements
- [ ] Add company dropdown
- [ ] Company-based filtering
- [ ] Fix theme issue
- [ ] RBAC check (RH and Admin only)

## Phase 11: Add Payroll Screen Improvements
- [ ] Validate working hours ≤ 168
- [ ] Add overtime hour cost field
- [ ] Calculate overtime in total
- [ ] Split ticket restaurant (count + cost)
- [ ] Split tickets cadeaux (count + cost)
- [ ] Remove unnecessary fields
- [ ] RBAC restrictions
- [ ] Company/team dropdowns for Admin
- [ ] Success/error messages

## Phase 12: Add Employee Screen Improvements
- [ ] Add alias field
- [ ] Replace age with birthDate
- [ ] Auto-calculate age from birthDate
- [ ] Replace "Lieu de travail" with jobTitle
- [ ] Email unique and required
- [ ] RBAC check (RH and Admin only)

## Phase 13: Personal Info Screen Improvements
- [ ] Update name fields structure
- [ ] Update birthDate field
- [ ] Auto-calculate age
- [ ] Update job title field

## Phase 14: Team Selection UI Enhancements
- [ ] Display selected employees count
- [ ] Red color if count > 10 or = 0
- [ ] Visual feedback for valid/invalid selections
- [ ] Filter employees already assigned to teams

## Phase 15: Pending Approvals Filtering
- [ ] Role-based filtering (Admin, RH, Chef d'équipe, Employee)
- [ ] Disable approve/reject for own requests

## Phase 16: Absence Management Features
- [ ] TeamAbsencesScreen (see all absences for same team)
- [ ] CompanyAbsencesScreen (see all absences for company)
- [ ] Role-based filtering

## Phase 17: Review Period Management
- [ ] ReviewPeriod data model
- [ ] ReviewPeriodScreen
- [ ] CRUD operations
- [ ] reviewPeriodsDb.ts

## Phase 18: Notification Management
- [ ] ManageNotificationsScreen
  - [ ] Send to team
  - [ ] Send to company
  - [ ] Send to all (Admin only)
- [ ] Notification broadcast functions
- [ ] Update welcome notification

## Phase 19: Menu Customization
- [ ] MenuCustomizationScreen
- [ ] Drag-and-drop interface
- [ ] menuPreferencesService
- [ ] Save per-user preferences

## Phase 20: Mock Data Generation
- [ ] Update seedDemoData function
- [ ] Create 2 companies
- [ ] Create 8 teams (4 per company)
- [ ] Create 90 users (1 Admin, 2 RH, 8 Chef d'équipe, 80 Employees)
- [ ] Assign teams to companies
- [ ] Assign employees to teams
- [ ] Generate sample data (leaves, payroll, illnesses, claims)

## Phase 21: Testing Infrastructure
- [ ] Configure Cypress
- [ ] Create Cypress test suites
- [ ] Configure Detox
- [ ] Create Detox test suites
- [ ] Create test results index.html template

## Phase 22: Deployment & Assets
- [ ] Fix GitHub Pages deployment (webpack config)
- [ ] Update splash screens (iOS, Android, Web)
- [ ] Update app icons (all platforms)

## Phase 23: Documentation
- [ ] Create pages-and-roles.md
- [ ] Create use-cases.md
- [ ] Create COMMERCIAL.md
- [ ] Update README.md

## Phase 24: Final Review & Polish
- [ ] Review all translation consistency
- [ ] Test all RBAC controls
- [ ] Verify all form validations
- [ ] Test responsive design
- [ ] End-to-end testing
- [ ] Fix remaining bugs

---

## Progress Summary
- ✅ Phase 1: Translations (100% complete)
- ⏳ Phases 2-24: Ready to start

**Next Steps**: Begin Phase 2 (Authentication & Session Management) or Phase 3 (Data Model Constraints) based on priority.
