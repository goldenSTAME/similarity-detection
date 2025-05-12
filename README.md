# Image Similarity Detection

A modern React application for detecting and comparing similar images using visual features extraction.

![image](https://github.com/user-attachments/assets/0a9675f4-ac74-4ab0-bca8-dd95c7bca6de)

## 🌟 Features

- **🌓 Light/Dark Mode**: Context-aware theme switching with smooth transitions
- **📷 Smart Image Upload**: Intuitive drag-and-drop interface with multi-format support
- **✂️ Intelligent Image Splitting**: Automatically detects and separates multiple clothing items
- **🔍 Advanced Search**: Powerful similarity detection algorithm
- **🏷️ Detailed Attributes**: View comprehensive product information for each match
- **🖼️ Interactive Gallery**: Browse similar items with accurate similarity scores
- **🔄 Real-time Progress Tracking**: Visual feedback during image processing
- **📱 Responsive Design**: Optimized for all device sizes
- **🔐 User Authentication**: Secure login with role-based permissions
- **📚 Search History**: View and manage past searches with one-click access

## 📋 Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features Detailed](#features-detailed)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Technologies](#technologies)
- [Contributing](#contributing)
- [License](#license)

## 🚀 Installation

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

## 💡 Usage

### Image Upload and Similarity Search

1. Navigate to the "Select Image" tab in the sidebar
2. Either drag and drop a JPEG image onto the upload zone or click "Select Image" to browse your files
3. Choose to either:
   - Click "Search" to find similar items to the entire image
   - Click "Split and Search" to automatically detect separate clothing items and search for each

4. Watch the real-time progress tracker as your image is processed
5. View the matching results in the interactive gallery
6. Click any result to view detailed product information

### Split Image Mode

The "Split and Search" feature automatically:
1. Detects individual clothing items in a single photo
2. Separates them into segments
3. Initiates individual similarity searches for each segment
4. Displays results organized by segment

### History Management

1. Navigate to the "History" tab in the sidebar
2. Browse through your past searches with previews and similarity scores
3. Click on any historical search to expand and view the results
4. Delete individual history items or clear all history

### Admin Features

If you have administrator privileges:
1. Navigate to the "Administrator" tab in the sidebar
2. Upload and manage reference images in the database
3. View system logs and performance metrics
4. Access additional controls for database management

## 🎯 Features Detailed

### Theme Switching

- Toggle between light and dark mode using the theme switcher at the bottom of the sidebar
- System preference detection automatically applies your preferred theme
- Smooth transition animations between themes
- Theme preference is saved locally for future sessions

### Image Processing

- Supports JPEG images for maximum compatibility
- Base64 encoding for secure image transmission
- Real-time progress tracking with animated indicators
- Cancellable operations for better user control

### Similarity Detection

- Advanced computer vision algorithms detect visual features
- Machine learning model trained on fashion datasets
- Returns similarity scores as percentages
- Organizes results from highest to lowest match

### User Authentication

- Secure JWT-based authentication
- Role-based access control (User/Admin)
- Token refresh mechanism for extended sessions
- "Remember me" functionality for convenience

### Responsive UI/UX

- Fluid layouts that adapt to any screen size
- Optimized touch interactions for mobile devices
- Framer Motion animations for smooth transitions
- Intuitive interface with visual feedback

## 🔌 API Endpoints

The application connects to a backend service with the following endpoints:

### Image Processing

- `POST http://127.0.0.1:5001/relay_image`
  - Uploads an image and retrieves similar images
  - Accepts a base64-encoded image and number of results to return

- `POST http://127.0.0.1:5001/image/split`
  - Splits an image into multiple clothing segments
  - Returns base64-encoded segments

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

- `POST http://127.0.0.1:5001/image_detail`
  - Gets detailed information about a specific image

- `PUT http://localhost:5001/image_features/:id`
  - Updates an image feature entry

- `DELETE http://localhost:5001/image_features/:id`
  - Deletes an image feature entry

- `DELETE http://127.0.0.1:5001/splitted_images/:id`
  - Deletes a specific split image record

### Authentication

- `POST http://localhost:5001/api/auth/login`
  - Authenticates a user and returns tokens

- `POST http://localhost:5001/api/auth/register`
  - Creates a new user account

- `POST http://localhost:5001/api/auth/logout`
  - Invalidates user tokens

- `GET http://localhost:5001/api/auth/user`
  - Gets current user information

- `POST http://localhost:5001/api/auth/refresh`
  - Refreshes authentication tokens

## 📁 Project Structure

```
similarity-detection/
├── public/                 # Static files
├── src/
│   ├── animations/         # Lottie animation files
│   ├── assets/             # Images and other assets
│   ├── components/
│   │   ├── AdminPage/      # Admin interface
│   │   ├── Auth/           # Authentication components
│   │   ├── DetailWindow/   # Item details view
│   │   ├── HistoryWindow/  # Search history interface
│   │   ├── SelectImageWindow/ # Main search interface
│   │   ├── Sidebar/        # Navigation sidebar
│   │   ├── ThemeToggle/    # Theme switching component
│   │   └── UploadZone/     # Drag and drop upload area
│   ├── Utils/              # Utility functions
│   │   ├── AuthUtils.ts    # Authentication helpers
│   │   ├── HistoryUtil.ts  # History management
│   │   ├── ImageUtils.ts   # Image processing
│   │   └── Create/Delete/Read/Update # CRUD operations
│   ├── App.tsx             # Main application component
│   ├── App.css             # Global styles
│   └── index.js            # Application entry point
├── .github/                # GitHub workflows
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## 🚢 Deployment

This project is configured for easy deployment to Vercel using GitHub Actions.

1. Fork this repository
2. Set up a Vercel account and link your repository
3. Add your `VERCEL_TOKEN` to your GitHub repository secrets
4. Push to the main branch to trigger an automatic deployment

## 💻 Technologies

- **Frontend Framework**: React 19 with TypeScript
- **Animation & UI/UX**:
  - Framer Motion for smooth animations
  - Lottie for complex animated icons
  - React Toastify for notifications
- **State Management**: React Hooks with Context API
- **API Communication**: Fetch API with async/await
- **Authentication**: JWT with refresh tokens
- **Styling**: CSS modules with theme variables
- **Build Tool**: Create React App
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
