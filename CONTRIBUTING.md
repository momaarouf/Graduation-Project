# Contributing to SafariHub

First off, thank you for considering contributing to SafariHub! It's people like you that make SafariHub such a great platform.

## 🤝 How Can I Contribute?

### Reporting Bugs
This section guides you through submitting a bug report for SafariHub.
*   **Ensure the bug was not already reported** by searching on GitHub under Issues.
*   If you're unable to find an open issue addressing the problem, open a new one. Be sure to include a title and clear description, as much relevant information as possible, and a code sample or an executable test case demonstrating the expected behavior that is not occurring.

### Suggesting Enhancements
This section guides you through submitting an enhancement suggestion, including completely new features and minor improvements to existing functionality.
*   Open a new issue with a clear title and description.
*   Explain why this enhancement would be useful to most SafariHub users. You may also want to point out the other projects that solved it better and which could serve as inspiration.

### Your First Code Contribution
Unsure where to begin contributing? You can start by looking through `help-wanted` issues. 

## 📝 Pull Request Process

1.  Ensure any install or build dependencies are removed before the end of the layer when doing a build.
2.  Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations and container parameters.
3.  Increase the version numbers in any examples files and the README.md to the new version that this Pull Request would represent.
4.  You may merge the Pull Request in once you have the sign-off of two other developers, or if you do not have permission to do that, you may request the second reviewer to merge it for you.

## 📐 Coding Standards

### Backend (Java/Spring Boot)
*   Use standard Java naming conventions (CamelCase for classes, camelCase for methods/variables).
*   Controllers should only handle HTTP concerns and delegate business logic to Services.
*   Entities should not be exposed directly to the controllers; use DTOs (Data Transfer Objects).
*   All dates and times MUST be handled in UTC using the custom `TimeService`. See `docs/TIME_MANAGEMENT.md`.
*   Never hard-delete records; implement soft-deletes. See `docs/Soft-Delete.md`.

### Frontend (Next.js/React/TypeScript)
*   Use functional components with Hooks.
*   Strict TypeScript typing is required.
*   Follow the established folder structure (`app/` for routes, `src/components/` for UI, `src/lib/` for logic).
*   Styling is done via Tailwind CSS v4. Stick to the design system tokens defined in the global CSS.
*   Use `framer-motion` for complex animations, but keep them subtle and performant.

## 🔒 Security Guidelines

*   Never commit secrets, API keys, or database credentials. Use `.env.local` for local development.
*   Ensure all new API endpoints are properly secured with the appropriate role-based access control annotations (`@PreAuthorize` in Spring).
*   Be mindful of Jackson serialization issues regarding roles (e.g., `"Admin"` vs `"ADMIN"`).

Thank you for contributing!
