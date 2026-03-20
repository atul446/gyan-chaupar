# Master Design & Logic Prompt: The Heavenly Realm of Gyan Chaupar

## Core Identity
**Gyan Chaupar (The Game of Knowledge)** is not a mere pastime, but a **spiritual simulator** and historical artifact modeled after an ancient Jain/Hindu manuscript. The game represents the soul's journey through various karmic states toward the ultimate liberation: **Moksha**.

---

## 🎨 Visual Aesthetic: "The Nano Banana Masterpiece"
The game must appear as a **museum-grade artifact**, a weathered manuscript floating over a celestial dark void.

- **The Canvas**: High-fidelity, aged parchment with realistic paper grain and **deckled (torn) edges** (clipping path).
- **The Header (Heavenly Realm)**: A majestic arched panel featuring specialized hand-painted iconography:
    - A central **meditating Ascetic** figure.
    - Flanking deity placeholders (**Ganesha** for wisdom, **Lakshmi** for prosperity).
    - Celestial Sun/Moon symbols for temporal balance.
- **The Color Palette**: Natural mineral pigments only.
    - **Sacral Crimson (#6B0001)** for the grid and primary emphasis.
    - **Antique Gold (#D4AF37)** for paths of ascension (ladders).
    - **Charcoal Ink (#111111)** for anatomical outlines and snakes.
    - **Glowing Turquoise (#66C6C6)** for snake spine luminesence.
    - **Aged Vellum (#F5E6BE)** for the surface.
- **The Interaction Design**:
    - **Stone Seal Controls**: The 'Roll' button must look like a heavy, hand-carved archeological seal that physically depresses into the page.
    - **Zero Modernity**: Strictly no rounded corners, no material shadows, and no generic digital fonts. Use 'Noto Serif' and 'Newsreader' for a scholarly, antique tone.

---

## ⚙️ Game Logic & Mechanics
The game follows the traditional 10x10 "Game of Snakes and Ladders" but centers on **Moral Causality**.

### 1. The Grid (S-Pattern)
- A **10x10 checkerboard** of Crimson and Cream cells.
- Cells follow an **S-pattern (Boustrophedon)**: Row 1 moves left-to-right, Row 2 moves right-to-left, and so on.
- **Annotation**: Every cell features an antique Sanskrit label (`सत्य` for truth/ladder, `मोह` for delusion/snake, `धर्म` for neutral duty).

### 2. The Players (Seekers)
- Support for **2 to 4 Seekers**.
- Avatars are simple, elegant tokens that offset when sharing a cell, appearing to rest on the paper.

### 3. Movement (Rolling the Cowries)
- Players roll a set of **Cowrie shells (1-6)**.
- Movement is slow and intentional, with the Seeker stepping from level to level to emphasize the spiritual progression.

### 4. Karmic Transitions (Snakes & Ladders)
- **Ladders (Virtues)**: Radiant, golden arched curves that elevate the soul from a base vice/state to a higher virtue.
    - *Logic*: Entry at the base (e.g., Cell 28: Charity) leads instantly to the head (e.g., Cell 55).
- **Snakes (Vices)**: Realistic charcoal serpents with glowing turquoise dot patterns that represent the downward pull of attachment and anger.
    - *Logic*: Entry at the head (e.g., Cell 98: Desire) leads back toward the earthly plane (e.g., Cell 79).

---

## 🔚 The Ultimate Goal: Moksha
- The game concludes when a Seeker reaches **Cell 100 (Vaikuntha/Liberation)**.
- Reaching this state should feel like a monumental spiritual achievement, with the UI reflecting the soul's transition from the board into the celestial background.

---

## 🛠️ Implementation Technology
- **Core Structure**: Semantic HTML5.
- **Styling**: Vanilla CSS for parchment effects + Tailwind CSS for layout and utilities.
- **Rendering**: SVG Overlays for the illustrative snakes and ladders to maintain high-fidelity crispness and painterly weight.
- **Logic**: Vanilla JavaScript for the recursive grid generation, seeker state persistence, and karmic jump animations.
