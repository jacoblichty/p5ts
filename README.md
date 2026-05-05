# P5.js React TypeScript Sketches

A build harness for creating interactive p5.js sketches using React, TypeScript, and Vite.

## Features

- ⚡ **Fast Development** - Powered by Vite for instant hot reload
- 📝 **TypeScript** - Full type safety for your creative coding
- ⚛️ **React Integration** - Seamless integration of p5.js with React components
- 🎨 **Creative Coding** - Focus on your art, not the tooling

## Project Structure

```
src/
├── components/
│   └── P5Wrapper.tsx       # Reusable p5.js React wrapper
├── sketches/
│   └── squareSketch.ts     # Example: Simple square sketch
├── App.tsx                 # Main app component
├── App.css                 # App styles
├── main.tsx               # React entry point
└── index.css              # Global styles
```

## Quick Start

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Start development server**:

   ```bash
   npm run dev
   ```

3. **Open your browser** to `http://localhost:3000`

## Creating New Sketches

1. Create a new sketch file in `src/sketches/`:

```typescript
// src/sketches/mySketch.ts
import p5Types from "p5";

export const mySketch = {
  setup: (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(400, 400).parent(canvasParentRef);
  },

  draw: (p5: p5Types) => {
    p5.background(220);
    // Your creative code here!
  },
};
```

2. Import and use it in `App.tsx`:

```typescript
import { mySketch } from './sketches/mySketch'

// In your component:
<P5Wrapper
  setup={mySketch.setup}
  draw={mySketch.draw}
/>
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## Dependencies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **p5.js** - Creative coding library
- **react-p5** - React wrapper for p5.js

## Tips

- Each sketch is a separate module for better organization
- The `P5Wrapper` component handles the p5.js/React integration
- TypeScript provides excellent autocomplete and error checking
- Use the browser dev tools to debug your sketches
- Hot reload works with both React components and p5.js sketches

## Example Sketches

The project includes a simple square sketch to get you started. Check out:

- `src/sketches/squareSketch.ts` - Basic shapes and colors

Happy creative coding! 🎨
