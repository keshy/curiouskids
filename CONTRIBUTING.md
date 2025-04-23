# Contributing to AskMe Buddy

Thank you for considering contributing to AskMe Buddy! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to uphold our Code of Conduct. Please be respectful and considerate of others when contributing.

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report for AskMe Buddy. Following these guidelines helps maintainers understand your report, reproduce the behavior, and find related reports.

- **Use the GitHub issue tracker** - The [GitHub issue tracker](https://github.com/your-username/askme-buddy/issues) is the recommended channel for bug reports.
- **Check if the bug has already been reported** - Search the issue tracker to see if someone else has reported the same bug.
- **Use the bug report template** - Please use the provided bug report template when creating an issue.
- **Include screenshots and detailed steps to reproduce** - If possible, include screenshots and detailed steps to reproduce the bug.

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for AskMe Buddy, including completely new features and minor improvements to existing functionality.

- **Use the GitHub issue tracker** - The [GitHub issue tracker](https://github.com/your-username/askme-buddy/issues) is the recommended channel for enhancement suggestions.
- **Use the feature request template** - Please use the provided feature request template when creating an issue.
- **Include as many details as possible** - Fill in the feature request template with as many details as possible.

### Pull Requests

- **Fill in the required pull request template** - Please use the provided pull request template when creating a pull request.
- **Do not include issue numbers in the PR title** - Include them in the description instead.
- **Include screenshots and animated GIFs in your pull request whenever possible** - This helps others understand your changes.
- **Follow the coding style** - Ensure your code follows the coding style used in the project.
- **Document new code** - Document new code with comments as needed.
- **End all files with a newline** - This is a good practice across many programming languages.

## Development Workflow

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your feature or bugfix (`git checkout -b feature/your-feature-name` or `git checkout -b fix/your-bugfix-name`)
4. Make your changes
5. Run tests to make sure everything still works
6. Commit your changes with a clear commit message
7. Push to your fork
8. Submit a pull request

### Setting Up Development Environment

1. Ensure you have Node.js (v18+) installed
2. Clone your fork: `git clone https://github.com/your-username/askme-buddy.git`
3. Navigate to the project directory: `cd askme-buddy`
4. Install dependencies: `npm install`
5. Create a `.env` file with your OpenAI API key: `OPENAI_API_KEY=your_api_key_here`
6. Start the development server: `npm run dev`

### Running Tests

To run the tests locally:

```bash
# Run unit tests
npm run test

# Run the linter
npm run lint

# Run integration tests
npm run test:integration
```

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or fewer
* Reference issues and pull requests liberally after the first line

### JavaScript Styleguide

* Use 2 spaces for indentation
* Use semicolons
* Use single quotes for strings
* Use template literals for string interpolation
* Use camelCase for variables and functions
* Use PascalCase for class names and React components
* Use destructuring where possible

### CSS/Tailwind Styleguide

* Prefer Tailwind utility classes over custom CSS
* When writing custom CSS, use kebab-case for class names
* Group related styles together

### React Component Styleguide

* Use functional components with hooks instead of class components
* Keep components small and focused on a single responsibility
* Use proper prop validation with TypeScript types
* Avoid deeply nested component hierarchies

## Additional Notes

### Issue and Pull Request Labels

This project uses the following labels to track issues and pull requests:

* `bug` - Issues that are bugs
* `enhancement` - Issues that are feature requests
* `documentation` - Issues related to documentation
* `good first issue` - Good for newcomers
* `help wanted` - Extra attention is needed
* `question` - Further information is requested

## Thank You!

Thank you for taking the time to contribute to AskMe Buddy! Your contributions make this project better for everyone.