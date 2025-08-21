# GEMINI.md

## Project Overview

This project is a "Vampire Survivors" like game built with React, TypeScript, and Vite. The goal is to create a game where the player controls a character that automatically shoots at enemies, collects experience points, and levels up. The project is in its initial phase, with the basic Vite + React template set up. The `spec.md` file outlines the intended game mechanics and a target architecture.

## Building and Running

The project uses `npm` for package management. The following scripts are available in `package.json`:

*   **Installation:**
    ```bash
    npm install
    ```

*   **Development Server:**
    ```bash
    npm run dev
    ```

*   **Building for Production:**
    ```bash
    npm run build
    ```

*   **Linting:**
    ```bash
    npm run lint
    ```

*   **Previewing the Production Build:**
    ```bash
    npm run preview
    ```

## Development Conventions

*   **Language:** TypeScript
*   **Framework:** React
*   **Build Tool:** Vite
*   **Module System:** ES Modules (`"type": "module"` in `package.json`)
*   **Directory Structure:** The source code is located in the `src` directory. The `spec.md` file suggests the following structure, which has not been implemented yet:
    ```
    src/
    ├── components/
    │   ├── Game.tsx         # Main game component
    │   ├── Player.tsx       # Player
    │   ├── Enemy.tsx        # Enemy
    │   ├── Bullet.tsx       # Bullet
    │   └── Experience.tsx   # Experience orb
    ├── hooks/
    │   ├── useGameLoop.ts   # Game loop
    │   └── useKeyboard.ts   # Keyboard input
    ├── types/
    │   └── game.ts          # Type definitions
    └── utils/
        ├── physics.ts       # Physics calculations
        └── spawner.ts       # Enemy spawning logic
    ```
