# Design System: The Sacred Digital Manuscript

## 1. Overview & Creative North Star

### Creative North Star: "The Digital Curator"
This design system is not a mere interface; it is a digital reliquary. It reimagines the screen as a living, breathing manuscript where the wisdom of the ages meets the fluid motion of the modern web. We move beyond the "app-like" experience by embracing the aesthetic of the *Sacred Digital Manuscript*—a space defined by depth, intentionality, and ritual.

**Breaking the Template:**
To achieve a high-end editorial feel, we reject the rigid, centered grid. We utilize **intentional asymmetry**, allowing content to breathe through staggered layouts and overlapping elements. Primary narratives are framed by "divine light" glows, while secondary information rests in the "void." We favor "The Golden Ratio" in our spacing, ensuring that every element feels placed by a hand rather than a machine.

---

## 2. Colors

Our palette is divided into the *Celestial Void* (backgrounds) and *Sacred Pigments* (accents). 

*   **Celestial Void (Primary & Backgrounds):** Deep indigo (`#111125`) and cosmic purples serve as our canvas. These are not flat blacks; they are infinite depths.
*   **Sacred Pigments (Accents):** Radiant Gold (`#e9c349`), Cinnabar Red (`#ffb4ac`), and Turmeric Yellow (`#fabd00`) are used sparingly to highlight path-critical information and spiritual milestones.

### The "No-Line" Rule
Standard 1px borders are strictly prohibited for sectioning. Boundaries between content blocks must be established through:
1.  **Background Color Shifts:** Using `surface-container-low` against a `surface` background.
2.  **Tonal Transitions:** Subtle radial gradients that fade from a container color into the background.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of stacked material. 
*   **Base:** `surface` (The infinite void).
*   **Section:** `surface-container-low` (Subtle atmospheric shift).
*   **Active Elements:** `surface-container-high` (Emerging from the void).

### The "Glass & Gradient" Rule
Floating elements (modals, tooltips) should utilize **Glassmorphism**. Apply semi-transparent surface colors with a `backdrop-blur` of 12px to 20px. Use signature gradients—transitioning from `primary` (`#e9c349`) to `primary-container` (`#423300`)—on interactive states to give them a "soul."

---

## 3. Typography

The typography strategy is a dialogue between the ancient and the modern.

*   **Display & Headlines (Noto Serif):** Used for titles and key spiritual concepts. The ornate, classical serifs evoke the authority of a physical manuscript. Use `display-lg` (3.5rem) for main headers to command immediate attention.
*   **Body & Titles (Manrope):** A clean, high-legibility sans-serif. This ensures that even complex philosophical texts remain accessible across all devices.
*   **Labels (Manrope):** Used for metadata and small captions.

**Editorial Hierarchy:**
We use high-contrast scales. A `display-lg` title may be followed immediately by a `body-md` description, creating a dramatic visual hierarchy that feels more like a boutique magazine than a standard dashboard.

---

## 4. Elevation & Depth

### The Layering Principle
Depth is achieved through "Tonal Layering." Instead of traditional drop shadows, we "stack" tokens. For example, a card (`surface-container-lowest`) placed upon a section (`surface-container-low`) creates a perceived lift through contrast alone.

### Ambient Shadows
Where floating effects are required (e.g., the "Roll Dice" action), use **Ambient Shadows**. These are extra-diffused (32px+ blur) and low-opacity (4%-8%). The shadow color must be a tinted variant of `on-surface` (`#e2e0fc`), creating a soft, magical glow rather than a muddy grey shadow.

### The "Ghost Border" Fallback
If a container requires a boundary for accessibility, use the **Ghost Border**: the `outline-variant` token at 15% opacity. It should be felt, not seen.

---

## 5. Components

### Floating Cards
Cards are the primary vessel for information. 
*   **Style:** No visible borders. Use `surface-container` background.
*   **Decoration:** Subtle mandala watermarks (`outline-variant` at 5% opacity) positioned in corners.
*   **Spacing:** Use `spacing-6` (2rem) for internal padding to maintain the "editorial" breathability.

### Illuminated Buttons
Buttons must look like manuscript icons.
*   **Primary:** A gradient fill from `primary` to `tertiary`. High-contrast `on-primary` text.
*   **Golden Borders:** For secondary buttons, use a 2px "Ghost Border" with a metallic gold tint.
*   **Shape:** `rounded-md` (0.375rem) for a slightly softened, hand-carved feel.

### Input Fields
*   **State:** Underline-only style (reminiscent of lines on parchment) using `outline`.
*   **Focus:** A "divine light" glow behind the input using a soft gold radial gradient.

### Lists & Dividers
Dividers are forbidden. Use vertical white space (`spacing-8`) or a subtle shift from `surface-container-low` to `surface-container-highest` to delineate list items.

---

## 6. Do's and Don'ts

### Do:
*   **Use Asymmetry:** Place images and text in a staggered, non-linear fashion.
*   **Embrace the Void:** Allow large areas of `background` (`#111125`) to remain empty to focus the user's "Third Eye" on the content.
*   **Animate the Light:** Use slow, pulsing transitions for "Divine Light" glows behind key components.

### Don't:
*   **Don't use pure black:** It kills the "void" depth. Always use the specified Indigo.
*   **Don't use hard corners:** Avoid `rounded-none`. Everything in the spiritual realm has been softened by time.
*   **Don't crowd the canvas:** If a screen feels busy, increase the spacing tokens. The manuscript needs room for contemplation.
*   **Don't use 100% Opaque Borders:** This shatters the illusion of a magical, fluid interface.