# Image Similarity Detection

A modern React application for detecting and comparing similar images using visual features extraction.

![image](https://github.com/user-attachments/assets/0a9675f4-ac74-4ab0-bca8-dd95c7bca6de)


## Features

- 🌓 Elegant light/dark mode with smooth transitions
- 📷 Intuitive drag-and-drop image upload interface
- 🔍 Advanced image similarity search
- 📊 Visual progress tracking during image processing
- 🖼️ Interactive gallery view of similar images with similarity scores
- 📋 Complete CRUD operations for image feature management
- 🔄 Real-time processing status updates with cancel capability
- 📱 Responsive design for all device sizes

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Technologies](#technologies)
- [Contributing](#contributing)
- [License](#license)

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/similarity-detection.git
   cd similarity-detection
   ```

2. Install the dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## Usage

### Image Upload and Search

1. Navigate to the "Select Image" tab in the sidebar
2. Either drag and drop a JPEG image onto the upload zone or click "Select Image" to browse your files
3. Click "Search" to start the image processing and similarity search
4. View the results in the gallery that appears below the upload area
5. You can cancel a search in progress by clicking "Cancel"

### Feature Management

1. Navigate to the "Details" tab in the sidebar
2. Use the CRUD interface to:
   - Create new image feature entries
   - Read existing image features
   - Update image features
   - Delete image features

### Theme Switching

- Toggle between light and dark mode using the theme switcher at the bottom of the sidebar
- Your preference will be saved and remembered between sessions

## API Endpoints

The application connects to a backend service with the following endpoints:

### Image Processing

- `POST http://127.0.0.1:5001/relay_image`
  - Uploads an image and retrieves similar images
  - Accepts a base64-encoded image and number of results to return

- `POST http://127.0.0.1:5001/cancel_request/:requestId`
  - Cancels an ongoing image processing request

- `GET http://127.0.0.1:5001/request_status/recent`
  - Gets status information about recent requests

- `POST http://127.0.0.1:5001/cleanup_requests`
  - Cleans up old or stalled requests

### Feature Management

- `POST http://localhost:5001/image_features`
  - Creates a new image feature entry

- `GET http://localhost:5001/image_features/:id`
  - Retrieves features for a specific image

- `PUT http://localhost:5001/image_features/:id`
  - Updates an image feature entry

- `DELETE http://localhost:5001/image_features/:id`
  - Deletes an image feature entry

## Project Structure

```
similarity-detection/
├── public/                 # Static files
├── src/
│   ├── animations/         # Lottie animation files
│   ├── assets/             # Images and other assets
│   ├── components/         # React components
│   │   ├── DetailWindow/   # Feature management interface
│   │   ├── SelectImageWindow/ # Image upload and search interface
│   │   ├── Sidebar/        # Navigation sidebar
│   │   ├── ThemeToggle/    # Theme switching component
│   │   └── UploadZone/     # Drag and drop upload area
│   ├── Utils/              # Utility functions and components
│   │   ├── Create/         # Create feature component
│   │   ├── Delete/         # Delete feature component
│   │   ├── Read/           # Read feature component
│   │   ├── Response/       # API response display component
│   │   ├── Update/         # Update feature component
│   │   ├── ImageUtils.ts   # Image processing utilities
│   │   └── ProcessBase64.js # Base64 image processing
│   ├── App.tsx              # Main application component
│   ├── App.css             # Global styles
│   └── index.js            # Application entry point
├── .github/                # GitHub workflows
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## Deployment

This project is configured for easy deployment to Vercel using GitHub Actions.

1. Fork this repository
2. Set up a Vercel account and link your repository
3. Add your `VERCEL_TOKEN` to your GitHub repository secrets
4. Push to the main branch to trigger an automatic deployment

## Technologies

- **Frontend Framework**: React 19
- **Language**: JavaScript/TypeScript
- **UI/UX**:
  - Framer Motion for animations
  - Lottie for complex animations
  - React Toastify for notifications
- **State Management**: React Hooks
- **API Handling**: Fetch API
- **Build Tool**: Create React App
- **Deployment**: Vercel with GitHub Actions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
