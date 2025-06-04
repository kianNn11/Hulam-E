# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

# Dark Mode Implementation

## Features Added

### Dark Mode Toggle
- **Location**: Dark mode toggle button is available in all navigation bars (Guest, User, and Admin)
- **Position**: Next to logout button in User and Admin navbars, next to login button in Guest navbar
- **Icons**: Sun icon for switching to light mode, Moon icon for switching to dark mode
- **Persistence**: Theme preference is saved in localStorage and persists across sessions
- **System Preference**: Automatically detects user's system dark mode preference on first visit

### Implementation Details

#### ThemeContext
- Created `src/Context/ThemeContext.jsx` for global theme state management
- Provides `isDarkMode` state and `toggleTheme` function
- Automatically loads saved theme preference from localStorage
- Detects system color scheme preference using `prefers-color-scheme` media query

#### CSS Variables
- Implemented comprehensive CSS variable system in `src/index.css`
- Light and dark theme color schemes defined with `data-theme` attribute
- Smooth transitions between themes (0.3s ease)
- Variables include:
  - `--bg-primary` and `--bg-secondary` for backgrounds
  - `--text-primary` and `--text-secondary` for text colors
  - `--accent-color` and `--accent-hover` for interactive elements
  - `--border-color`, `--shadow`, `--modal-bg`, `--navbar-bg`, etc.

#### Components Updated
- All navigation components (UserNavbar, GuestNavbar, AdminNavbar)
- Footer component
- Login form
- App.css for global styles
- Modal components for dark mode compatibility

### Usage
1. Click the sun/moon icon in any navbar to toggle between light and dark modes
2. Theme preference is automatically saved and restored on next visit
3. Respects system dark mode preference if no manual selection has been made

### Technical Notes
- No database functionality required - uses localStorage for persistence
- Maintains all existing layouts and functionality
- Uses CSS custom properties for consistent theming
- Responsive design preserved across all screen sizes
- Smooth transitions provide polished user experience

## Getting Started

```bash
npm start
```

The dark mode toggle will be available immediately in the navigation bar.
