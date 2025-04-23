# AskMe Buddy - AI-Powered Q&A for Kids

An engaging AI-powered Q&A website designed especially for 5-year-olds, featuring voice input, text-to-speech, and image responses.

## Features

- 🎤 Voice input for easy question asking
- 🔊 High-quality text-to-speech responses using OpenAI's audio generation
- 🖼️ Visual responses with AI-generated images
- 🧸 Friendly mascot character interface
- ⚙️ Parent settings for customizing the experience
- 🧩 Question suggestions to help children explore

## Getting Started

### Prerequisites

- Node.js (v18+)
- An OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/askme-buddy.git
   cd askme-buddy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5000`

## CI/CD Setup

This project uses GitHub Actions for continuous integration and deployment.

### Available Workflows

- **Build**: Builds the application and verifies it compiles correctly
- **Test**: Runs the linter and unit tests
- **Integration Tests**: Runs end-to-end tests simulating user interactions
- **Deploy**: Deploys the application to staging or production environments
- **Security Audit**: Checks dependencies for vulnerabilities (runs weekly)
- **Code Quality**: Analyzes code with ESLint and checks TypeScript types
- **Stale Issues**: Automatically marks and closes stale issues and PRs

### Setting up GitHub Secrets

For the CI/CD workflows to function correctly, you need to add the following secrets to your GitHub repository:

1. Go to your GitHub repository → Settings → Secrets and variables → Actions
2. Add these repository secrets:
   - `OPENAI_API_KEY`: Your OpenAI API key (required)
   - `SNYK_TOKEN`: Your Snyk token for security scanning (optional)

### Running Tests Locally

```bash
# Run unit tests
npm run test

# Run the linter
npm run lint

# Run integration tests
npm run test:integration
```

### Manual Deployments

You can manually trigger deployments using the GitHub Actions interface:

1. Go to the Actions tab in your repository
2. Select the "Deploy" workflow
3. Click "Run workflow"
4. Choose the target environment (staging or production)
5. Click "Run workflow"

## Project Structure

- `client/`: Frontend React application
- `server/`: Backend Express server
- `shared/`: Shared types and utilities
- `.github/workflows/`: CI/CD configuration

## License

This project is licensed under the MIT License - see the LICENSE file for details.