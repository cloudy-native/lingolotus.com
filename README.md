<p align="center">
  <img src="https://img.shields.io/badge/Gatsby-663399?style=for-the-badge&logo=gatsby&logoColor=white" alt="Gatsby" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Chakra_UI-319795?style=for-the-badge&logo=chakra-ui&logoColor=white" alt="Chakra UI" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
</p>

<h1 align="center">
  🌸 Lingo Lotus
</h1>

<p align="center">
  <strong>A comprehensive language learning platform built with modern web technologies</strong>
</p>

<p align="center">
  Master new languages through interactive flashcards, immersive reading experiences, and intelligent study features.
</p>

## ✨ Features

### 📚 **Comprehensive Learning Tools**
- **Interactive Flashcards** - Spaced repetition with customizable difficulty levels
- **Reading Practice** - Curated texts with translations and pronunciation guides
- **Speech Synthesis** - Built-in text-to-speech for pronunciation practice
- **Progress Tracking** - Study scoring and performance analytics
- **Multi-language Support** - Currently focused on Thai for English speakers

### 🎨 **Modern UI/UX**
- **Dark/Light Mode** - System-aware theme switching
- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **Multiple Themes** - Choose from various color schemes (Ocean Breeze, Sunset Vibes, Zen Garden, etc.)
- **Accessibility First** - WCAG compliant with keyboard navigation and screen reader support

### 🚀 **Performance & Developer Experience**
- **Blazing Fast** - Gatsby-powered static site generation
- **Type Safe** - Full TypeScript integration
- **Modern Stack** - React 18, Chakra UI, Framer Motion animations
- **SEO Optimized** - Built-in meta tags, sitemaps, and structured data

## 🏗️ Project Structure

```
lingolotus.com/
├── data/                          # Static content and data
│   ├── books/                     # Reading content (stories, articles)
│   │   ├── stories/              # Individual story files
│   │   └── *.json                # Book metadata
│   ├── flash-cards/              # Flashcard collections and decks
│   │   ├── collections/          # Collection metadata
│   │   └── decks/                # Individual flashcard decks
│   └── languages/                # Language configuration
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── speech/              # Text-to-speech components
│   │   └── study/               # Study interface components
│   ├── hooks/                   # Custom React hooks
│   │   ├── useScoring.ts        # Study progress tracking
│   │   └── useSpeechSynthesis.ts # Speech synthesis logic
│   ├── pages/                   # Gatsby pages (home, about, 404)
│   ├── templates/               # Page templates for dynamic content
│   │   ├── deck-detail.tsx      # Flashcard deck pages
│   │   ├── deck-study.tsx       # Study session interface
│   │   ├── reading-list.tsx     # Reading content browser
│   │   └── book-detail.tsx      # Individual reading pages
│   ├── theme/                   # Chakra UI theme configuration
│   │   └── colors-*.ts          # Color scheme definitions
│   ├── types/                   # TypeScript type definitions
│   └── utils/                   # Utility functions
├── static/images/               # Static assets
├── gatsby-*.{js,ts}             # Gatsby configuration
└── package.json                 # Dependencies and scripts
```

## 🛠️ Technology Stack

### **Frontend Framework**
- **Gatsby** - React-based static site generator
- **React 18** - Modern React with concurrent features
- **TypeScript** - Type-safe JavaScript development

### **UI & Styling**
- **Chakra UI** - Accessible component library
- **Framer Motion** - Animation library
- **Emotion** - CSS-in-JS styling

### **Language Learning Features**
- **Web Speech API** - Text-to-speech synthesis
- **Lucide React** - Modern icon library
- **Recharts** - Data visualization for progress tracking

### **Content Management**
- **Markdown** - Content authoring with Gatsby Remark
- **JSON** - Structured data for flashcards and books
- **Gatsby Image** - Optimized image handling

### **Development Tools**
- **Biome** - Fast linter and formatter
- **ESLint** - Code quality enforcement
- **Prettier** - Code formatting (migrating to Biome)

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+
- **pnpm** (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/cloudy-native/lingolotus.com.git
   cd lingolotus.com
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Start development server**
   ```bash
   pnpm run develop
   # or
   npm run develop
   ```

4. **Open your browser**
   Navigate to `http://localhost:8000`

### Available Scripts

```bash
# Development
pnpm run develop    # Start development server
pnpm run build      # Build for production
pnpm run serve      # Serve production build locally

# Code Quality
pnpm run typecheck  # TypeScript type checking
pnpm run format     # Check code formatting
pnpm run format:fix # Auto-fix formatting issues
pnpm run lint       # Check code quality
pnpm run lint:fix   # Auto-fix linting issues

# Deployment
pnpm run deploy     # Deploy to AWS S3
pnpm run clean      # Clean Gatsby cache
```

## 📖 Content Management

### Adding Flashcards

1. Create deck files in `data/flash-cards/decks/`
2. Add collection metadata in `data/flash-cards/collections/`
3. Include translations, phonetic guides, and difficulty levels

### Adding Reading Content

1. Create story files in `data/books/stories/`
2. Add book metadata in `data/books/`
3. Include translations and comprehension exercises

### Language Support

- **Thai (ไทย)** - Primary language with full support
- **English** - Interface and translation language
- **Extensible** - Framework supports additional languages

## 🎨 Customization

### Themes
Choose from pre-built themes or create custom ones:

```typescript
// src/theme/index.ts
import { oceanBreezeTheme } from './colors-ocean-breeze'
// Available: matcha-latte, ocean-breeze, sunset-vibes, zen-garden, vibrant-lotus
```

### Language Learning Features

- **Speech Synthesis** - Configurable voices and rates
- **Study Modes** - Target language → source language or vice versa
- **Progress Tracking** - Session-based scoring and analytics
- **Difficulty Levels** - Easy, Medium, Hard with adaptive learning

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Areas for Contribution
- **Content Creation** - Add more flashcards and reading materials
- **Language Support** - Extend platform to new languages
- **Feature Development** - Study algorithms, progress tracking, gamification
- **UI/UX Improvements** - Enhanced accessibility, new themes, mobile optimization

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Thai Language Community** - For inspiration and content contributions
- **Open Source Community** - Gatsby, Chakra UI, and countless other tools
- **Language Learners Worldwide** - For their dedication and feedback

---

<p align="center">
  Made with ❤️ for language learners everywhere
</p>

<p align="center">
  <a href="https://lingolotus.com">🌐 Live Site</a> •
  <a href="https://github.com/cloudy-native/lingolotus.com">📖 Source Code</a> •
  <a href="https://lingolotus.com/about">ℹ️ About</a>
</p>
