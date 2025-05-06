# AskMe Buddy Architecture

## 1. Overview

AskMe Buddy is an AI-powered Q&A application designed specifically for young children (around 5 years old). It features voice input capabilities, text-to-speech responses, and AI-generated image responses to create an engaging and educational experience.

The application follows a modern web architecture with a clear separation between frontend and backend services. It's built as a full-stack JavaScript/TypeScript application with React on the frontend and Express.js on the backend, utilizing OpenAI's API for AI capabilities.

## 2. System Architecture

The system follows a client-server architecture with the following key components:

### 2.1 Frontend

- Built with React and TypeScript
- Uses Vite as the build tool and development server
- Implements a component-based UI architecture with Tailwind CSS and shadcn/ui components
- Includes mobile-responsive design
- Uses React Query for data fetching and state management
- Uses Wouter for client-side routing

### 2.2 Backend

- Built with Express.js and TypeScript
- Provides RESTful API endpoints for the frontend
- Integrates with OpenAI for generating answers, images, and audio responses
- Handles audio storage and retrieval
- Manages user sessions with express-session
- Processes user questions and generates appropriate AI responses

### 2.3 Database

- Uses Neon PostgreSQL (serverless Postgres)
- Schema managed with Drizzle ORM for type-safe database access
- Includes tables for users, questions, badges, and achievements

### 2.4 Authentication

- Firebase Authentication for handling user sign-in
- Supports Google OAuth for authenticated users
- Includes guest authentication mode for anonymous usage
- Session management using express-session with MemoryStore

## 3. Key Components

### 3.1 Client Components

#### Core UI Components

- `AskMeBuddy`: Main component that orchestrates the Q&A interface
- `MascotCharacter`: Animated character interface for kid-friendly interaction
- `QuestionInput`: Handles text and voice input for questions
- `ResponseDisplay`: Renders AI-generated answers with text, images, and audio
- `QuestionSuggestions`: Shows recommended follow-up questions
- `BadgeDisplay`: Shows earned badges and achievements
- `EarnedBadgesDisplay`: Component for displaying user badges and achievements

#### Pages

- `Home`: Main Q&A interface
- `History`: Shows previous questions and answers
- `Profile`: User profile with badges and progress
- `Settings`: User preferences and content filter settings
- `Login`: Authentication page with Google and guest options

### 3.2 Server Components

#### API Routes

- `/api/ask`: Endpoint for processing user questions
- `/api/audio/:filename`: Serves audio responses
- `/api/questions/*`: Endpoints for fetching question history
- `/api/badges`: Endpoints for retrieving user badges

#### Services

- `openai.ts`: Handles communication with OpenAI APIs
- `audio-service.ts`: Manages audio file generation and storage
- `badge-controller.ts`: Handles badge awards and progression
- `storage.ts`: Interface for database interactions

### 3.3 Database Schema

The application uses several key tables:

- `users`: Stores user information including Firebase authentication details
- `questions`: Records questions asked, answers given, and related media URLs
- `badges`: Stores achievement badges that users can earn
- `achievements`: Tracks user progress toward various achievements

## 4. Data Flow

1. **Question Submission Process**:
   - User submits a question via text or voice input
   - Frontend sends the question to the backend `/api/ask` endpoint
   - Backend processes the question with OpenAI
   - OpenAI generates a text response, and optionally image and audio responses
   - Backend stores the Q&A in the database and checks for badge awards
   - Response is sent back to the frontend for display
   - Frontend renders the answer with text, optional image, and audio playback

2. **Authentication Flow**:
   - User authenticates via Google OAuth or as a guest
   - For Google auth, Firebase Authentication handles the process
   - Backend verifies and associates the user with a database record
   - Session is established and maintained via cookies

3. **Badge and Achievement System**:
   - Backend tracks user activity and questions
   - After answering questions, badge criteria are checked
   - When criteria are met, badges are awarded and stored in the database
   - Frontend displays badge notifications and updates the user's profile

## 5. External Dependencies

### 5.1 External APIs

- **OpenAI API**: Used for generating answers (GPT-4o), images, and text-to-speech audio
- **Firebase Authentication**: Handles user authentication and Google OAuth

### 5.2 Key Libraries and Frameworks

- **Frontend**:
  - React: UI library
  - Tailwind CSS: Styling
  - shadcn/ui: UI component library
  - React Query: Data fetching and state management
  - Wouter: Client-side routing
  - Firebase Auth: Authentication client

- **Backend**:
  - Express.js: Web server framework
  - Drizzle ORM: Database ORM
  - OpenAI Node SDK: API client for OpenAI
  - express-session: Session management

### 5.3 Development Tools

- Vite: Build tool and development server
- TypeScript: Type checking
- ESBuild: Production builds
- Jest: Testing framework

## 6. Deployment Strategy

The application is configured for deployment on Replit, a cloud-based development environment. The deployment process includes:

- **Build Process**:
  - Frontend assets built with Vite
  - Backend bundled with ESBuild
  - Output combined into a single deployable package

- **Runtime Environment**:
  - Node.js for server execution
  - Serving static assets from the built frontend
  - Environment variables for API keys and configuration

- **Scaling Strategy**:
  - Configured for autoscaling via Replit's deployment system
  - Stateless design allows for horizontal scaling

- **Database**:
  - Uses Neon Database (serverless PostgreSQL)
  - Connection pooling for efficient database access

The application uses separate configurations for development and production environments, with appropriate middleware and error handling for each context.