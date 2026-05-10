# Traveloop Design System

> A comprehensive design system for building consistent, premium dark-themed interfaces with warm amber accents. Use this document as a reference guide or as prompts for AI coding assistants.

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Component Patterns](#component-patterns)
6. [Effects & Animations](#effects--animations)
7. [Icon Guidelines](#icon-guidelines)
8. [Copilot Prompts](#copilot-prompts)

---

## Design Philosophy

**Core Principles:**
- **Premium Dark Theme**: Deep navy backgrounds that feel luxurious and modern
- **Warm Accents**: Amber/orange gradients that create visual warmth against cool backgrounds
- **Glassmorphism**: Frosted glass cards with subtle transparency and blur
- **Subtle Motion**: Gentle animations that add life without distraction
- **High Contrast**: Excellent readability with proper foreground/background contrast

**Visual Identity:**
- Sophisticated, not flashy
- Professional yet approachable
- Travel-inspired warmth
- Enterprise-ready polish

---

## Color System

### Primary Palette (OKLCH)

```css
:root {
  /* Backgrounds */
  --background: oklch(0.18 0.04 260);       /* Deep navy blue */
  --card: oklch(0.22 0.04 260);              /* Slightly lighter navy */
  --secondary: oklch(0.28 0.04 260);         /* Card hover / input backgrounds */
  --muted: oklch(0.25 0.03 260);             /* Subtle backgrounds */
  
  /* Text */
  --foreground: oklch(0.95 0.01 260);        /* Primary text - off-white */
  --muted-foreground: oklch(0.65 0.02 260);  /* Secondary text - gray */
  
  /* Accent Colors */
  --primary: oklch(0.75 0.18 55);            /* Amber - primary actions */
  --accent: oklch(0.70 0.20 55);             /* Orange - hover states */
  
  /* Borders */
  --border: oklch(0.32 0.04 260);            /* Subtle borders */
  --ring: oklch(0.75 0.18 55);               /* Focus rings - amber */
}
```

### Tailwind Color Classes

```
Background:        bg-background, bg-card, bg-secondary, bg-muted
Text:              text-foreground, text-muted-foreground, text-card-foreground
Borders:           border-border, border-border/50, border-border/80
Amber Gradient:    from-amber-400 via-orange-400 to-amber-500
Amber Solid:       bg-amber-500, bg-amber-400, text-amber-400
Button Text:       text-slate-900 (on amber buttons)
```

### Gradient Definitions

```
Primary CTA Gradient:    bg-gradient-to-r from-amber-500 to-orange-500
Primary CTA Hover:       hover:from-amber-400 hover:to-orange-400
Text Gradient:           bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent
Icon Background:         bg-gradient-to-br from-amber-500/20 to-orange-500/20
Glow Effect:             bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20
Orb 1 (Warm):            bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent
Orb 2 (Cool):            bg-gradient-to-tr from-blue-500/15 via-indigo-500/10 to-transparent
```

---

## Typography

### Font Stack

```css
--font-sans: 'Geist', 'Geist Fallback', system-ui, sans-serif;
--font-serif: 'Playfair Display', Georgia, serif;
--font-mono: 'Geist Mono', 'Geist Mono Fallback', monospace;
```

### Text Sizes & Weights

```
Hero Heading:       text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]
Page Title:         text-2xl font-bold
Section Title:      text-lg font-semibold
Card Title:         font-semibold text-foreground
Body Text:          text-base text-muted-foreground leading-relaxed
Small Text:         text-sm text-muted-foreground
Caption:            text-xs text-muted-foreground
Link:               text-amber-400 hover:text-amber-300 transition-colors
```

### Text Patterns

```tsx
// Gradient Text
<span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
  Highlighted Text
</span>

// Muted Paragraph
<p className="text-muted-foreground text-lg leading-relaxed max-w-md">
  Description text here
</p>

// Status Badge Text
<span className="text-sm text-amber-400 font-medium">
  Status text
</span>
```

---

## Spacing & Layout

### Container Widths

```
Max Content:        max-w-6xl mx-auto
Form Card:          max-w-md
Hero Section:       max-w-md (for paragraphs)
Full Bleed:         w-full
```

### Spacing Scale

```
Padding Small:      p-4
Padding Medium:     p-6, p-8
Padding Large:      p-8, p-10
Gap Small:          gap-2, gap-3
Gap Medium:         gap-4, gap-6
Gap Large:          gap-8, gap-12
Section Spacing:    mb-6, mb-8, mb-12
```

### Grid Layouts

```tsx
// Two Column Auth Layout
<div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[calc(100vh-14rem)]">
  {/* Left Column */}
  <div className="hidden lg:block">...</div>
  {/* Right Column */}
  <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">...</div>
</div>

// Two Column Form Row
<div className="grid grid-cols-2 gap-3">...</div>

// Social Buttons Row
<div className="grid grid-cols-2 gap-3">...</div>
```

### Border Radius

```
Small:              rounded-lg (0.5rem)
Medium:             rounded-xl (0.75rem)
Large:              rounded-2xl (1rem)
Extra Large:        rounded-3xl (1.5rem)
Full:               rounded-full
```

---

## Component Patterns

### Primary Button (CTA)

```tsx
<Button
  className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-300"
>
  <span className="flex items-center gap-2">
    Button Text
    <ArrowRight className="h-4 w-4" />
  </span>
</Button>
```

### Secondary/Outline Button

```tsx
<Button 
  variant="outline" 
  className="h-11 bg-secondary/30 border-border/50 hover:bg-secondary/50 hover:border-border transition-all"
>
  Button Text
</Button>
```

### Input Field

```tsx
<Input
  className="h-12 bg-secondary/50 border-border/50 focus:border-amber-500/50 focus:ring-amber-500/20 placeholder:text-muted-foreground/50 transition-all"
  placeholder="Placeholder text"
/>
```

### Input with Icon Button

```tsx
<div className="relative">
  <Input
    type={showPassword ? "text" : "password"}
    className="h-12 bg-secondary/50 border-border/50 pr-12 focus:border-amber-500/50 focus:ring-amber-500/20 placeholder:text-muted-foreground/50 transition-all"
  />
  <button
    type="button"
    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
  >
    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
  </button>
</div>
```

### Label

```tsx
<Label className="text-sm font-medium text-card-foreground">
  Label Text
</Label>
```

### Glassmorphism Card

```tsx
<div className="relative">
  {/* Glow effect behind card */}
  <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 rounded-3xl blur-xl opacity-70" />
  
  {/* Card content */}
  <div className="relative bg-card/80 backdrop-blur-xl rounded-2xl border border-border/80 p-8 shadow-2xl shadow-black/20">
    {/* Content here */}
  </div>
</div>
```

### Feature Card

```tsx
<div className="flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm hover:bg-card/80 hover:border-amber-500/30 transition-all duration-300 group cursor-default">
  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center group-hover:from-amber-500/30 group-hover:to-orange-500/30 transition-colors">
    <Icon className="w-5 h-5 text-amber-400" />
  </div>
  <div>
    <p className="font-semibold text-foreground">Feature Title</p>
    <p className="text-sm text-muted-foreground">Feature description</p>
  </div>
</div>
```

### Status Badge/Pill

```tsx
<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
  <span className="text-sm text-amber-400 font-medium">Status Text</span>
</div>
```

### Divider with Text

```tsx
<div className="relative my-8">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-border/50" />
  </div>
  <div className="relative flex justify-center text-xs">
    <span className="px-4 bg-card text-muted-foreground">or continue with</span>
  </div>
</div>
```

### Avatar Stack

```tsx
<div className="flex -space-x-3">
  {[1, 2, 3, 4, 5].map((i) => (
    <div 
      key={i} 
      className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 border-2 border-background flex items-center justify-center text-xs font-medium text-white"
    >
      {String.fromCharCode(64 + i)}
    </div>
  ))}
</div>
```

### Password Strength Indicator

```tsx
<div className="space-y-3 rounded-xl bg-secondary/30 border border-border/30 p-4">
  <div className="flex items-center justify-between text-xs">
    <span className="text-muted-foreground">Password strength</span>
    <span className={`font-semibold bg-gradient-to-r ${strengthColor} bg-clip-text text-transparent`}>
      {strengthText}
    </span>
  </div>
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((level) => (
      <div
        key={level}
        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
          level <= strength 
            ? `bg-gradient-to-r ${strengthColor}` 
            : "bg-border/50"
        }`}
      />
    ))}
  </div>
</div>

// Strength colors:
// Strong (4-5):  from-emerald-400 to-emerald-500
// Fair (3):      from-amber-400 to-amber-500
// Weak (1-2):    from-red-400 to-red-500
```

### Loading Spinner

```tsx
<svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
</svg>
```

---

## Effects & Animations

### Background Animated Orbs

```tsx
{/* Warm amber orb - top right */}
<div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent blur-3xl animate-pulse" />

{/* Cool blue orb - bottom left */}
<div 
  className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-500/15 via-indigo-500/10 to-transparent blur-3xl animate-pulse" 
  style={{ animationDelay: '1s' }} 
/>

{/* Small accent orb */}
<div 
  className="absolute top-[40%] left-[20%] w-[300px] h-[300px] rounded-full bg-gradient-to-br from-amber-400/10 to-transparent blur-2xl animate-pulse" 
  style={{ animationDelay: '2s' }} 
/>
```

### Grid Pattern Overlay

```tsx
<div 
  className="absolute inset-0 opacity-[0.03]"
  style={{
    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
    backgroundSize: '60px 60px'
  }}
/>
```

### Glow Effect

```tsx
{/* Behind card glow */}
<div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 rounded-3xl blur-xl opacity-70" />
```

### Transition Classes

```
Standard:           transition-colors duration-200
All Properties:     transition-all duration-300
Shadow:             transition-shadow
Transform:          transition-transform
```

### Hover States

```
Card Hover:         hover:bg-card/80 hover:border-amber-500/30
Button Hover:       hover:from-amber-400 hover:to-orange-400
Link Hover:         hover:text-amber-300 or hover:text-foreground
Shadow Hover:       hover:shadow-amber-500/40
```

---

## Icon Guidelines

### Recommended Library
Lucide React (`lucide-react`)

### Common Icons Used

```tsx
import { 
  Eye, EyeOff,           // Password visibility
  ArrowRight,            // CTA buttons
  Plane, MapPin, Calendar, // Travel features
  Shield, Zap, Globe,    // Security/features
  Check, X               // Validation states
} from "lucide-react"
```

### Icon Sizes

```
Small (inline):     h-3 w-3, h-4 w-4
Medium (buttons):   h-5 w-5
Large (features):   h-6 w-6
```

### Icon in Feature Box

```tsx
<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
  <Icon className="w-5 h-5 text-amber-400" />
</div>
```

### Logo Icon

```tsx
<div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
  <svg className="w-5 h-5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
</div>
```

---

## Copilot Prompts

### General Component Prompts

**Card Component:**
```
Create a glassmorphism card with:
- Background: bg-card/80 with backdrop-blur-xl
- Border: border border-border/80
- Rounded corners: rounded-2xl
- Shadow: shadow-2xl shadow-black/20
- Add a glow effect div behind it with amber gradient and blur-xl
```

**Form Input:**
```
Style this input with:
- Height: h-12
- Background: bg-secondary/50
- Border: border-border/50
- Focus state: focus:border-amber-500/50 focus:ring-amber-500/20
- Placeholder: placeholder:text-muted-foreground/50
- Add transition-all for smooth state changes
```

**Primary Button:**
```
Create a primary CTA button with:
- Gradient background: from-amber-500 to-orange-500
- Hover: from-amber-400 to-orange-400
- Text color: text-slate-900
- Font: font-semibold
- Shadow: shadow-lg shadow-amber-500/25
- Hover shadow: hover:shadow-amber-500/40
- Include an ArrowRight icon with gap-2
```

### Layout Prompts

**Auth Page Layout:**
```
Create a two-column auth layout with:
- Left column: Hidden on mobile, shows hero content with gradient text heading
- Right column: Contains the glassmorphism form card
- Grid: grid lg:grid-cols-2 gap-12 lg:gap-20 items-center
- Background: Add animated gradient orbs with blur-3xl and animate-pulse
- Add a subtle grid pattern overlay with opacity-[0.03]
```

**Navigation Header:**
```
Create a fixed header with:
- Position: fixed top-0 left-0 right-0 z-50
- Padding: px-6 py-5
- Logo: Amber gradient icon with shadow
- Nav links: text-muted-foreground with hover:text-foreground
- Max width container: max-w-7xl mx-auto
```

### Feature Section Prompts

**Feature Card List:**
```
Create a vertical list of feature cards with:
- Flex layout: flex items-start gap-4
- Icon box: 10x10 rounded-lg with amber gradient background at 20% opacity
- Icon color: text-amber-400
- Hover state: group-hover with increased opacity on icon box
- Hover border: hover:border-amber-500/30
- Transition: transition-all duration-300
```

**Social Proof Section:**
```
Create a social proof section with:
- Avatar stack: flex -space-x-3 with overlapping circular avatars
- Avatars: gradient background from-slate-600 to-slate-700
- Border: border-2 border-background for separation
- Stats text: Two lines - main stat in font-medium, subtitle in text-xs text-muted-foreground
```

### Complete Page Prompts

**Login Page:**
```
Build a login page for Traveloop with:
- Dark navy background with animated amber and blue gradient orbs
- Grid pattern overlay for texture
- Two-column layout: hero content left, login form right
- Hero: Gradient text heading, feature cards with icons
- Form: Glassmorphism card, email/password inputs, show/hide password toggle
- Primary CTA: Amber gradient button with loading state spinner
- Social login: Google and GitHub outline buttons
- Links: Forgot password, sign up - all in amber-400
```

**Register Page:**
```
Build a registration page for Traveloop with:
- Same background treatment as login (orbs, grid pattern)
- Two-column layout: value proposition left, register form right
- Left side: Heading with gradient text, three benefit cards with icons, avatar stack social proof
- Form: First/last name row, email, password with strength indicator
- Password strength: 5-bar indicator with color coding (red/amber/green)
- Checkmark list for password requirements
- Terms agreement text below submit button
- Social signup options
```

### Animation Prompts

**Animated Background:**
```
Add animated background elements:
- 3 gradient orbs with different sizes (600px, 500px, 300px)
- Positioning: absolute, positioned off-screen edges
- Colors: amber/orange for warm, blue/indigo for cool contrast
- Effect: blur-3xl for soft glow
- Animation: animate-pulse with staggered delays (0s, 1s, 2s)
- Opacity: 10-20% for subtlety
```

**Interactive Hover:**
```
Add hover interactions:
- Cards: bg-card/50 to bg-card/80, border change to amber-500/30
- Buttons: Gradient shift from amber-500 to amber-400
- Shadows: Increase shadow opacity on hover
- Icon containers: Increase gradient opacity from /20 to /30
- Use transition-all duration-300 for smooth animations
```

---

## Quick Reference Cheatsheet

### Most Used Classes

```
// Backgrounds
bg-background bg-card bg-card/80 bg-secondary/50 bg-secondary/30

// Text
text-foreground text-muted-foreground text-card-foreground text-amber-400

// Borders
border-border border-border/50 border-border/80 border-amber-500/30

// Gradients
bg-gradient-to-r from-amber-500 to-orange-500
bg-gradient-to-br from-amber-500/20 to-orange-500/20
bg-clip-text text-transparent

// Effects
backdrop-blur-xl blur-xl blur-3xl shadow-2xl shadow-black/20 shadow-amber-500/25

// Layout
rounded-2xl rounded-xl rounded-lg rounded-full
h-11 h-12 w-10 h-10 gap-2 gap-4 p-4 p-8

// Transitions
transition-all transition-colors duration-200 duration-300

// States
hover:bg-card/80 hover:border-amber-500/30 hover:text-foreground
focus:border-amber-500/50 focus:ring-amber-500/20
```

---

*Last updated: 2024 | Traveloop Design System v1.0*