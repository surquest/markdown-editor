# Markdown Editor

A powerful, dual-pane Markdown editor built with Next.js, React, Milkdown, and Monaco Editor. This application allows users to edit raw Markdown with a smooth code editor experience while simultaneously previewing or interacting with the rendered content in a WYSIWYG rich text editor.

## ✨ Features

*   **Dual-Pane Interface**: Edit seamlessly using either the Monaco Code Editor (raw markdown) or the Milkdown Editor (rich WYSIWYG editing).
*   **Live Synchronization**: Changes in either pane instantly reflect in the other with debounced updates to ensure smooth typing.
*   **Custom Markdown Extensions**: Extended Markdown syntax to support custom React components using Unified, Remark, and Rehype:
    *   **Accordions**: Collapsible content sections.
    *   **Iframes**: Embedded external web pages or applications.
    *   **Carousels**: Image and content sliders.
    *   **Cards Collection**: Grouped, clickable cards containing titles, thumbnails, descriptions, and links.
*   **Static Export Ready**: Configured for easy deployment to GitHub Pages.

## 🚀 Tech Stack

*   **Framework**: [Next.js](https://nextjs.org/) (App Router, Static Export configured)
*   **UI Library**: [Material UI (MUI)](https://mui.com/)
*   **Code Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/) (`@monaco-editor/react`)
*   **Rich Text Editor**: [Milkdown](https://milkdown.dev/)
*   **Markdown Processing**: [Unified](https://unifiedjs.com/) (Remark & Rehype ecosystems)

## 🛠️ Getting Started

### Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed.

### Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:surquest/markdown-editor.git
   cd markdown-editor
   ```

2. Install the dependencies:
   ```bash
   npm install
   # Depending on your current structure, you might need to run this inside the 'src' directory
   ```

### Running in Development

Start the local development server:
```bash
npm run dev
# or cd src && npm run dev
```

The editor will be available at [http://localhost:3000](http://localhost:3000).

## 📦 Deployment (GitHub Pages)

This project is configured for static exports (`output: "export"` in `next.config.ts`), making it perfect and ready for GitHub Pages hosting.

1. Ensure your `basePath` is correctly set in `next.config.ts` if deploying to a subdirectory (e.g., `/markdown-editor`).
2. Run the build script:
   ```bash
   npm run build
   ```
3. The static files will be generated in the `out` directory. You can host this directory or use a GitHub Actions Next.js template to automate deployment.

## 📝 License

Distributed under the MIT License.