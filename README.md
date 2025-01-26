# React + TypeScript + Vite
## Template Builder Application
 
Dynamic template creation system with real-time preview capabilities, built with modern web technologies.

## Key Features
- Dynamic form field configuration
- Real-time template preview
- State management with Zustand
- UI component library
- Type-safe TypeScript implementation
- Dark mode support
- API configuration management
- Import/Export functionality
- Resizable interface
- Settings customization
- Model service integration

## Architecture Overview
### Technical Stack
- **Framework**: React 18
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Type Checking**: TypeScript 5+

### Core Components
1. **TemplateEditor** - Main configuration interface
2. **InputFieldBuilder** - Dynamic field creation system
3. **PreviewPane** - Real-time template visualization
4. **ThemeProvider** - Unified theming system with dark mode
5. **ApiConfigForm** - API endpoint configuration
6. **ResizableSidebar** - Adjustable layout system
7. **ImportExportControls** - Template data management

### State Management
Centralized store architecture using Zustand:
- Template configuration state
- Field definitions and validation rules
- UI theme settings
- API configurations
- Application settings
- Model configurations

## Development Practices
1. **Component Structure**:
   - Presentational components in `/components/ui`
   - Business logic components in `/components`
   - State management in `/store`
   - Custom hooks in `/hooks`
   - API services in `/lib`
   - Page components in `/pages`

2. **Type Definitions**:
   - Centralized types in `/types`
   - Strict TypeScript configuration
   - Component prop typing
   - API configuration types

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
