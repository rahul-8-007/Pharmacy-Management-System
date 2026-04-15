```markdown
# Design System Specification: The Clinical Curator

## 1. Overview & Creative North Star
The Pharmacy Management landscape is often cluttered, anxiety-inducing, and overly mechanical. This design system introduces **"The Clinical Curator"**—a creative North Star that transforms high-utility data into an editorial, high-end experience. 

The goal is to move away from the "data-grid" fatigue of legacy healthcare software. Instead, we embrace **Organic Precision**. This is achieved through intentional asymmetry, overlapping surfaces that mimic stacked medical charts, and a sophisticated use of white space that provides "cognitive breathing room" for pharmacists under pressure. We are not just building a tool; we are designing a premium environment for accuracy and care.

## 2. Colors: Tonal Depth & Clinical Calm
This system utilizes a palette of **Professional Blues** for authority, **Sage Greens** for organic health, and **High-Contrast Reds** for critical "End Flow" actions.

### The "No-Line" Rule
To achieve a signature, modern aesthetic, designers are **prohibited from using 1px solid borders** for sectioning. Boundaries must be defined through:
- **Background Color Shifts:** Use `surface_container_low` against a `surface` background to define regions.
- **Tonal Transitions:** Vertical and horizontal hierarchy is established by the interaction of light and shadow, not lines.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. We use the Material surface tiers to create "nested" depth:
- **Base Layer:** `surface` (#f8f9fa) – The canvas.
- **Sectioning:** `surface_container` (#edeeef) – Large content blocks.
- **Interactive Cards:** `surface_container_lowest` (#ffffff) – Placed on darker containers to create a natural "lift."

### The "Glass & Gradient" Rule
To prevent the UI from feeling "flat" or "stock," floating elements (modals, dropdowns, navigation rails) should utilize **Glassmorphism**:
- Use `surface` colors at 80% opacity with a `24px` backdrop-blur.
- **Signature Textures:** Apply a subtle linear gradient from `primary` (#00478d) to `primary_container` (#005eb8) on main CTAs to provide a "jewel-like" depth that feels high-end and tactile.

## 3. Typography: The Editorial Scale
We use a dual-font strategy to balance technical utility with premium character.

*   **Display & Headlines (Manrope):** A modern, geometric sans-serif that feels technical yet approachable. Use `headline-lg` for dashboard summaries to create an "Editorial Header" look.
*   **Body & Labels (Inter):** The gold standard for readability. Inter's tall x-height ensures that complex drug names and dosages remain legible at `body-sm` (12px).

**Hierarchy as Identity:** 
Use extreme scale. Pair a `display-md` metric (e.g., "98% Accuracy") with a `label-md` uppercase caption. This contrast mimics high-end medical journals and removes the "form-heavy" look of typical pharmacy apps.

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering** rather than traditional structural dividers.

### The Layering Principle
Stack containers to create focus. An "Active Prescription" card (`surface_container_lowest`) sitting on a "Patient Profile" panel (`surface_container_low`) creates a soft, natural lift.

### Ambient Shadows
Shadows must be "atmospheric." 
- **Blur:** 32px to 64px.
- **Opacity:** 4%–8%.
- **Color:** Use a tinted shadow based on `on_surface` (#191c1d) to ensure the shadow looks like natural light hitting a surface, not a "drop shadow" effect.

### The "Ghost Border" Fallback
If a border is required for accessibility (e.g., input fields), use the **Ghost Border**: `outline_variant` at 20% opacity. Never use 100% opaque lines.

## 5. Components

### Buttons: The Action Tiers
- **Primary (The Blue Core):** Filled with `primary` (#00478d). Used for standard progression.
- **Secondary (The Sage Anchor):** Filled with `secondary_container` (#bdefc4). Used for "Add New" or "Refill" actions. It signals growth and health.
- **End Flow (The Critical Red):** To satisfy the "High Contrast" requirement, "End Flow" actions (e.g., *Dispense*, *Delete*, *Critical Alert*) use `tertiary` (#940010) with `on_tertiary` text. This ensures the eye immediately identifies the terminal action.

### Cards & Lists: The No-Divider Rule
Forbid the use of divider lines between list items. Use **Vertical White Space**:
- `8px` gap for related items.
- `16px` gap for distinct entries.
- Use a subtle `surface_container_high` hover state to indicate interactivity.

### Prescription Status Chips
- **Selection Chips:** Use `secondary_fixed` (Sage) for "Active" statuses.
- **Action Chips:** Use `primary_fixed` (Blue) for "Review Required."
- Shape: Use the `full` (9999px) roundedness scale for an organic, pill-like feel.

### Input Fields
Avoid the "boxed-in" look. Use a `surface_container_highest` background with a `sm` (2px) bottom-only radius. When focused, the "Ghost Border" transitions to a `primary` 2px bottom stroke.

## 6. Do's and Don'ts

### Do:
- **Do** use intentional asymmetry. Place a large headline on the left and a small utility chip on the far right to create an editorial flow.
- **Do** utilize `on_surface_variant` for secondary text to maintain a high-end, low-noise aesthetic.
- **Do** use `xl` (12px) rounding for main content containers to soften the "clinical" edge.

### Don't:
- **Don't** use pure black (#000000) for text. Use `on_surface` (#191c1d) for a softer, more professional contrast.
- **Don't** use standard "Success Green." Use the specified Sage tokens (`secondary`) to maintain the modern healthcare aesthetic.
- **Don't** overcrowd. If a screen feels full, increase the `surface` padding rather than adding more containers.

---
*This design system is a living document intended to evolve with the needs of the pharmacy professional while maintaining an uncompromising standard of high-end digital craftsmanship.*```