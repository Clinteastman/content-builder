**Project Requirements:**
Develop a prompt engineering web application using the existing tech stack (verify against package.json) with these features:

**Core Functionality:**
1. **Template Management System**
   - Implement a store using Zustand or Redux Toolkit for template state
   - Create CRUD operations for templates with local storage persistence
   - Use JSON Schema validation for template imports (zod or yup)

2. **Dynamic Template Editor**
   - Integrate CodeMirror 6 (@uiw/react-codemirror) with custom syntax highlighting:
     - Highlight `{placeholder}` patterns in different color
     - Add linting for unmatched curly braces
   - Implement real-time template parsing using regex or parser combinators

3. **Input Field Management**
   - Create a custom hook `useTemplateInputs` that:
     - Parses placeholders from template content
     - Maintains input field state with debounced updates
     - Handles field validation and error states
   - Implement drag-and-drop sorting for input fields (react-dnd)

4. **Prompt Generation**
   - Develop a preview system with Mustache.js or custom parser
   - Add copy-to-clipboard functionality with feedback toast
   - Implement template versioning with diff comparison

**Technical Specifications:**
- **UI Framework**: React (check package.json for existing implementation)
- **State Management**: Zustand/Redux (match existing setup)
- **Styling**: Use existing CSS framework (Tailwind/MUI check package.json)
- **Build System**: Match existing Vite/CRA configuration

**Required Components:**
1. `<TemplateEditor />` with CodeMirror integration
2. `<InputFieldBuilder />` with drag-and-drop capabilities
3. `<PreviewPane />` with markdown support
4. `<ImportExportControls />` with file handling
   - Use `FileReader` API for JSON imports
   - Implement `Blob` for JSON exports

**Data Structure:**
```typescript
interface PromptTemplate {
  id: string;
  name: string;
  content: string;
  inputs: Array<{
    key: string;
    label: string;
    type: 'text' | 'number' | 'select';
    options?: string[];
    required: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
```

**Required Dependencies (verify against existing package.json):**
- Editor: @uiw/react-codemirror
- State: zustand or @reduxjs/toolkit
- Utilities: lodash, nanoid, zod
- UI: @mui/material or @heroicons/react

**Implementation Steps:**
1. Set up template store with middleware for localStorage sync
2. Create regex pattern for placeholder detection: /\{([^{}]+)\}/g
3. Implement debounced template parsing (300ms)
4. Add error boundaries and loading states
5. Configure CodeMirror extensions for syntax highlighting
6. Develop file handling logic with proper error reporting

**Best Practices:**
- Implement atomic component design
- Add Storybook stories for UI components (if configured)
- Include unit tests with Vitest/Jest for core logic
- Use TypeScript interfaces for all data structures
- Add keyboard navigation support
- Implement proper accessibility labels

**Testing Requirements:**
1. Verify template version conflict resolution
2. Test edge cases (nested placeholders, special characters)
3. Validate JSON import/export roundtripping
4. Verify responsive design breakpoints

**Example Command Sequence:**
```bash
# Install required dependencies (check against existing package.json)
npm install @uiw/react-codemirror nanoid zod use-debounce

# Run development server
npm run dev
```

**Code Quality Requirements:**
- Strict TypeScript typing
- ESLint/Prettier formatting matching existing config
- Meaningful commit messages following existing conventions
- Proper JSDoc documentation for complex functions
- Memoized React components where appropriate

Would you like me to generate specific implementation code for any of these components or provide more detailed technical specifications for a particular feature?