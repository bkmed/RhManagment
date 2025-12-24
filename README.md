# Rh Management 

A comprehensive HR management solution built with React Native Web for cross-platform compatibility across web, iOS, and Android.

## Features

- **Authentication & Authorization**: Secure login with role-based access control (Admin, Advisor, Employee)
- **Employee Management**: Complete employee profile management with profile editing and photo upload
- **Leave Management**: Request, approve, and track employee leave
- **Payroll System**: Generate and distribute payslips
- **Notifications**: Real-time notifications for important events
- **Calendar**: Visual representation of team availability and events with integrated request system
- **Admin Dashboard**: Comprehensive overview for management with direct links to all modules
- **Responsive Design**: Works on web, tablets, and mobile devices
- **SEO Optimized**: Enhanced search engine visibility and social media sharing
- **PWA Support**: Progressive Web App capabilities for mobile web users
- **Smartbanner Integration**: Promote native app installations
- **Multi-language Support**: Interface available in English, French, and Arabic
- **Illness Management**: Track and manage employee sick leaves and medical certificates
- **Permission System**: Fine-grained permission management for user roles

## Tech Stack

- **Frontend**: React Native Web
- **Navigation**: React Navigation
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **State Management**: Redux with Redux Toolkit
- **Internationalization**: i18next for multi-language support
- **Bundling**: Webpack with optimization plugins
- **Testing**: Jest, Cypress (web), Detox (mobile)
- **CI/CD**: Bitbucket Pipelines
- **PWA**: Service workers and Web App Manifest

## Project Structure

\`\`\`
Rh-management/
├── packages/                # Monorepo structure
│   ├── app/                 # Main application entry point
│   ├── auth/                # Authentication module
│   ├── core/                # Shared UI components and utilities
│   ├── employees/           # Employee management module
│   ├── leave/               # Leave management module
│   ├── payroll/             # Payroll and payslip module
│   ├── notifications/       # Notifications system
│   ├── calendar/            # Calendar and scheduling module
│   ├── admin/               # Admin management interfaces
│   └── illness/             # Illness tracking and management
├── app/                     # Next.js app directory
├── public/                  # Static assets and PWA files
│   ├── icons/               # App icons for various platforms
│   ├── manifest.json        # PWA manifest
│   ├── robots.txt           # Search engine instructions
│   └── sitemap.xml          # Site structure for search engines
├── e2e/                     # End-to-end tests with Detox
├── cypress/                 # Cypress tests for web
├── __tests__/               # Unit and integration tests
├── bitbucket-pipelines.yml  # CI/CD configuration
└── webpack.config.js        # Webpack configuration with optimizations
\`\`\`

## Recent Enhancements

- **Enhanced Admin Dashboard**: Now includes direct links to manage leave, illness, payroll, and system settings
- **Interactive Calendar**: Added buttons to request leave, authorization, or report illness directly from the calendar view
- **Profile Management**: New comprehensive profile edit page with photo upload functionality
- **SEO Optimization**: Added meta tags, structured data, and sitemaps for better search engine visibility
- **Mobile App Promotion**: Integrated smart banners for iOS and Android app installations
- **Performance Improvements**: Optimized webpack configuration for faster loading times
- **PWA Support**: Added web app manifest and service worker for offline capabilities
- **Illness Request System**: Integrated with calendar for tracking and requesting sick leave

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- React Native development environment setup for mobile development
- Firebase account

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://bitbucket.org/your-org/Rh-management.git
   cd Rh-management
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Configure Firebase:
   - Create a Firebase project
   - Enable Authentication, Firestore, and Storage
   - Update the Firebase configuration in `packages/auth/src/firebase-config.ts`

4. Start the development server:
   \`\`\`bash
   # For web
   npm start
   
   # For iOS
   npm run start:ios
   
   # For Android
   npm run start:android
   \`\`\`

## Development

### Code Style

This project uses ESLint and Prettier for code formatting and linting:

\`\`\`bash
# Run linter
npm run lint

# Format code
npm run format
\`\`\`

### Testing

\`\`\`bash
# Run unit tests
npm test

# Run Cypress tests (web)
npm run cypress:open

# Run Detox tests (mobile)
npm run e2e:test
\`\`\`

### Building for Production

\`\`\`bash
# Build web version
npm run build

# Build iOS app
cd ios && pod install && cd ..
npm run build:ios

# Build Android app
npm run build:android
\`\`\`

## Deployment

The project is configured with Bitbucket Pipelines for CI/CD. See `bitbucket-pipelines.yml` for details.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
\`\`\`

Let's summarize all the changes we've made to the Rh management :

1. **Enhanced Admin Dashboard** (packages/admin/src/components/admin-dashboard.tsx):
   - Added links to manage leave, illness, payroll, and system settings modules
   - Reorganized the quick actions grid for better visibility
   - Improved layout to accommodate more administrative functions

2. **Interactive Calendar** (packages/calendar/src/components/calendar-view.tsx):
   - Added buttons for requesting leave, authorization, or reporting illness directly from the calendar view
   - Created an integrated request form that works with the date context
   - Improved event display and interaction capabilities

3. **Profile Management** (packages/employees/src/components/edit-profile.tsx):
   - Created a comprehensive profile editing page
   - Added photo upload functionality
   - Implemented form validation and error handling
   - Integrated with employee profile view

4. **Request Leave Modal** (packages/leave/src/components/request-leave-modal.tsx):
   - Created a reusable modal for requesting different types of leave
   - Implemented date selection and reason entry
   - Integrated with the calendar system
   - Added support for leave, authorization, and illness requests

5. **SEO Optimization**:
   - Updated HTML head with meta tags for better SEO (packages/app/public/index.html)
   - Added Open Graph and Twitter card tags for social media sharing
   - Created robots.txt and sitemap.xml files
   - Added structured data using JSON-LD for better search engine indexing

6. **Mobile App Promotion**:
   - Added smartbanner meta tags for both iOS and Android
   - Configured appropriate app IDs and promotional text

7. **Performance Improvements**:
   - Updated webpack.config.js with optimization plugins
   - Implemented code splitting and compression
   - Added cache optimization techniques

8. **PWA Support**:
   - Created manifest.json for Progressive Web App capabilities
   - Configured icons for various device sizes

All these changes work together to significantly enhance the Rh management functionality, usability, and discoverability. The system now offers a more integrated experience for users across roles (employee, advisor, admin) and provides better tools for managing Rh processes.
