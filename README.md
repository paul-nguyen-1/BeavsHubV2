# BeavsHub

## Overview

BeavsHub is a modern web application designed to provide an interactive experience for OSU students in viewing courses and planning their degree.

## Features

- **Course Explorer**: A dynamic, interactive platform for exploring courses.
<!-- - **Resume Builder**: Tools to craft, refine, and export professional resumes.
- **Community Features**: Commenting and collaborative tools on course posts.
- **Interactive Visuals**: Graphs, flowcharts, and side panels to enhance data representation. -->

## Technologies

### Frontend

- **TypeScript**: Strongly typed programming language for enhanced developer experience.
- **React (w/ Vite)**: Lightning-fast development and build tool for modern web applications.
- **Mantine**: Highly customizable component library.
- **Tailwind CSS**: Utility-first CSS framework for responsive and modern design.
- **Framer Motion**: Powerful animation library for React.
- **React Flow**: A library for building node-based graphs and diagrams.
- **TanStack Query**: Advanced state management and server-state synchronization.

### Backend

- **NestJS (Node.js)**: A progressive Node.js framework for building efficient, reliable, and scalable server-side applications.
- **MongoDB**: Document-based NoSQL database for flexible and efficient data storage.

### Authentication
- **AWS Cognito**: Used for user authentication, ensuring a secure and scalable way to manage user sign-ups, log-ins, and access control.
- **JWT (JSON Web Tokens)**: Secure and stateless authentication mechanism.

### Testing and CI/CD

- **Jest**: Unit testing framework for ensuring code reliability and correctness.
- **Playwright**: End-to-end testing framework for reliable UI testing.
- **GitHub Actions**: CI/CD pipeline for automated testing and deployment.

## Hosting

- **Vercel**: Deployment platform optimized for Vite and NestJS applications.
- **MongoDB Compass**: GUI for MongoDB database management.

## Development Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/paul-nguyen-1/BeavsHubV2.git
   cd BeavsHub
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Run the backend server:

   ```bash
   npm run start:backend
   ```

5. Test the application:
   ```bash
   npm run test
   ```

## License

This project is licensed under the MIT License. 🚀
