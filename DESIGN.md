
---


# DESIGN.md: Core Visual Principles & System Standards

MOST IMPORTANTLY IF THE PROJECT IS ALREADY FOLLOWING A DESIGN THAT IS WORKING WELL DONT MAKE ANY DRAMATIC CHANGES WITHOUT CONFIRMING WITH ME, YOU CAN MAKE SUGGESTION FOR THE EXISTING UI FEATURES FOLLOWING THESE DESIGN PRINCIPLES
### 1. The Design Philosophy: "Inevitability"

The goal is to create interfaces that feel **inevitable**—as if they couldn't have been designed any other way. We prioritize an **"Engineered" aesthetic** over purely decorative choices, signalling precision, reliability, and attention to detail.

To provide you with a comprehensive update for your system, I have synthesized the core principles from the sources into two finalized "Gold Standard" files: **AGENTS.md** and **DESIGN.md**. 

These updates are tailored specifically to your request for a **bare HTML, CSS, and JS** project (no frameworks), while maintaining the "engineered" visual fidelity of brands like Vercel and Linear.

### 1. Updated AGENTS.md
*Drop this in your project root. This file "steers" your agents (Pi, OpenCode, Codex) to act like senior engineers and prevents generic output.*

***

#### **Identity & Persona**
You are a **Senior Frontend Engineer** who ships production-ready, high-fidelity interfaces. Your output must be indistinguishable from the craftsmanship at **Stripe, Linear, or Vercel**.
*   **No "Design Slop":** No generic blue-and-white layouts, no inconsistent spacing, and no placeholder "Lorem Ipsum" text.
*   **No Code Smells:** No TODOs, no `console.log`, and no "vibe-coding" without a plan.

#### **The "No-Framework" Tech Stack**
*   **Structure:** Semantic HTML5 (priority on accessibility and SEO).
*   **Styling:** Native CSS3 using **CSS Custom Properties (Variables)** for tokens. Use **CSS Grid and Flexbox** for all structural layouts.
*   **Interactivity:** Vanilla JavaScript (ES6+). Focus on performance and direct DOM manipulation.
*   **Fonts:** Geist Sans (Body/Headings) and Geist Mono (Data/Metrics) via CDN/Google Fonts.

#### **Multi-Agent Workflow Strategy**
To ensure structural integrity, you must execute in this order:
1.  **Grounding:** Identify all required UI elements and functional blocks.
2.  **Planning:** Generate a **Hierarchical DOM Tree** and layout plan (Flex/Grid) *before* writing any code.
3.  **Generation:** Translate the plan into clean HTML, CSS variables, and JS logic.

***

### 2. Updated DESIGN.md (The Visual Blueprint)
*This file defines the "engineered" aesthetic for your vanilla web project.*

***

#### **1. Visual Foundations**
*   **High Contrast:** Use absolute black (#000) and white (#FFF). Avoid "muddy" mid-tone grays.
*   **Generous Whitespace:** Spacing is an architectural tool. **The "Double It" Rule:** Take the spacing that feels adequate and double it (Use 16, 24, 32, 48, 64px increments).
*   **Monochrome + One Accent:** Use a grayscale base for 95% of the UI. Use a single sharp accent color (e.g., #4ade80 for OpenCode Emerald) for primary CTAs.
*   **Sharp Typography:** Geist Sans for general text; **Geist Mono** for all statistics, code, and timestamps.

#### **2. Signature Patterns**
*   **Blueprint Grids:** Apply a 10-20% opacity dot or line grid to hero sections to signify "precision engineering".
*   **Bento Layouts:** Use modular, card-based grids for feature sections and dashboards.
*   **Thin Borders:** Use 1px borders with subtle contrasts (e.g., white-on-black or near-black-on-black) for clean separation.

#### **3. Technical Guardrails (The ❌ NEVER vs ✅ INSTEAD)**
| ❌ NEVER | ✅ INSTEAD |
| :--- | :--- |
| **Hardcoded Hex Codes** in components | **CSS Variables** defined in a global `:root` |
| **Generic `<div>` soup** | **Semantic tags** (`<main>`, `<section>`, `<nav>`) |
| **Absolute positioning** for layouts | **CSS Grid or Flexbox** |
| **Rounded/Playful fonts** | **Tight, geometric sans-serifs** |
| **Arbitrary spacing** (e.g. `13px`) | **Mathematical multiples of 4px** |

#### **4. Interactive Logic**
*   **Snappy Transitions:** Use `0.2s ease` transitions for all hover and focus states.
*   **Accessibility:** Maintain a **4.5:1 contrast ratio** and ensure all interactive elements have a **44px touch target**.

***

### Key Implementation Advice
To get the best out of your agents with these files:
*   **Reference the Files:** Always start your prompts with "[AGENTS.md Context]" so the AI "anchors" to your rules before it begins reasoning.
*   **Use the PROMPT Framework:** When asking for a new feature, specify the **Platform** (Web), **Role** (Senior Engineer), **Output** (Specific HTML blocks), **Mood** (OpenCode Dark), **Patterns** (Bento Grid), and **Technical Constraints** (Vanilla JS).
### 2. The Four Pillars of Visual Fidelity

All projects must adhere to these four foundational principles to avoid "design slop":

- **High Contrast:** Use aggressively high contrast with absolute black (#000) and white (#FFF) spaces. **Avoid "muddy" mid-tone grays**; if a surface isn't void-black, it should be a sharp, near-black like #0a0a0a.
- **Generous Whitespace:** Spacing is a deliberate structural tool, not emptiness. **The "Double It" Rule:** Take the spacing that feels adequate and double it (preferring increments of 16/24/32/48/64px).
- **Monochrome Base + One Accent:** Use a grayscale foundation (black, white, gray) for 95% of the UI. Use **one single accent color** (e.g., Linear Purple or OpenCode Emerald) sparingly to make primary actions "hit harder".
- **Sharp Typography:** Use tight, geometric sans-serifs for headings and body (e.g., **Geist Sans**). Use **technical monospace fonts** (e.g., **Geist Mono**) for all data, metrics, stats, and timestamps to reinforce the engineering theme.

### 3. The PROMPT Framework for New Features

When requesting new UI from agents, use this 6-part framework to ensure coherent decisions:

- **[P] Platform:** Define the target (e.g., Web Dashboard, 1440px wide).
- **[R] Role:** Assign the "Senior Frontend Engineer" persona to ensure semantic React patterns.
- **[O] Output:** Specify key elements (e.g., "4 metric cards, 1 line chart, 5-row activity table").
- **[M] Mood:** Explicitly mandate the "Vercel-style Blueprint" or "Dark Premium" aesthetic.
- **[P] Patterns:** Reference specific layouts like **Bento grids** or **Sidebar navigation**.
- **[T] Technical:** Mandate **Tailwind CSS**, **shadcn/ui**, and **WCAG AA accessibility**.

### 4. Technical Guardrails & Constraints

To maintain codebase integrity, the following rules are **locked**:

- **No Arbitrary Values:** Never use raw hex codes (e.g., `bg-[#1a1a1a]`) in components. **Only reference tokens** defined in `tailwind.config.ts` or CSS variables.
- **Component Reuse:** Always use **shadcn/ui** as the base; never build from scratch what the library provides.
- **ClassName Limits:** Restrict `className` overrides on core components strictly to high-level dimensions like height and width to prevent "vibe-coding" drift.
- **Accessibility:** All interactive elements must have a minimum touch target of **44px** and maintain a **4.5:1 contrast ratio** for text.

### 5. Signature Visual Elements

- **Blueprint Grids:** Use a subtle grid of lines or dots (10-20% opacity) behind hero sections and empty states to create texture and depth without overpowering content.
- **Cards:** Use thin borders (1px) with subtle internal gradients or "glassmorphism" effects to separate data units.
- **Data Density:** Use **Dynamic Data Tables** for scanning large datasets (sorting/filtering) and **Stacked Lists** for simpler, linear mobile-friendly data.

### 6. Workflow: Plan Before Code

Agents must generate a **hierarchical layout tree** using Flexbox and Grid logic _before_ writing React code. This separation of "Planning" from "Generation" ensures structural integrity and prevents nested layout errors.:
