# Design System

This document outlines the design system standards for the application, inspired by Vercel's clean and modern UI patterns.

## Core Principles

### 1. **Rounded Corners**
- **Small elements**: `rounded-md` (6px) - buttons, badges, inputs
- **Cards & panels**: `rounded-lg` (8px) - cards, modals, larger containers
- **Large containers**: `rounded-xl` (12px) - major layout sections

### 2. **Spacing & Layout**
- **Consistent padding**: Use `p-4` (16px) for cards, `p-6` (24px) for larger containers
- **Gap spacing**: `gap-2` (8px) for tight elements, `gap-4` (16px) for standard spacing, `gap-6` (24px) for loose spacing
- **Vertical rhythm**: `space-y-3` for compact lists, `space-y-6` for sections

### 3. **Typography**
- **Headings**: Use semantic hierarchy with proper font weights
- **Body text**: `text-sm` (14px) for most content, `text-xs` (12px) for metadata
- **Monospace**: `font-mono` for code, URLs, technical data
- **Line height**: `leading-relaxed` for body text, `leading-snug` for headings

## Component Patterns

### Navigation & Breadcrumbs
```tsx
// Vercel-style breadcrumb navigation with slashes
<Navigation webTitle="Page Title" webId="123" />

// Breadcrumb separators use forward slashes (/)
<BreadcrumbSeparator>
  <span className="text-muted-foreground">/</span>
</BreadcrumbSeparator>
```

### Cards
```tsx
// Standard card with hover effects
<div className="border border-border bg-card p-4 hover:border-foreground/20 hover:shadow-sm transition-all duration-200 rounded-lg">
  {/* Card content */}
</div>
```

### Buttons
```tsx
// Primary button
<button className="px-4 py-2 bg-foreground text-background hover:bg-foreground/90 transition-colors rounded-lg">
  Primary Action
</button>

// Secondary button
<button className="px-4 py-2 bg-accent hover:bg-accent/80 transition-colors rounded-lg border border-border">
  Secondary Action
</button>

// Ghost button
<button className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors rounded-lg">
  Ghost Action
</button>
```

### User Menu Toggle
```tsx
// Enhanced user menu button with better borders and interactivity
<button className={cn(
  "flex items-center p-1.5 transition-all duration-200 relative group rounded-lg border",
  "hover:bg-accent/50 hover:border-foreground/20",
  "focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:ring-offset-2 focus:ring-offset-background",
  menuOpen ? "bg-accent/40 border-foreground/20" : "border-border bg-background"
)}>
  <div className={cn(
    "h-7 w-7 bg-muted text-foreground flex items-center justify-center text-xs font-medium flex-shrink-0 border border-border group-hover:border-foreground/30 transition-all duration-200 rounded-md",
    "group-hover:bg-background"
  )}>
    {initials}
  </div>
</button>
```

### Status Badges
```tsx
// Status with background and border
<span className="text-xs px-2 py-1 font-mono rounded-md bg-green-600/10 border border-green-600/20 text-green-600">
  COMPLETE
</span>
```

### Input Fields
```tsx
// Search input with icon
<div className="relative">
  <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
  <input className="w-full h-9 pl-10 pr-4 bg-background border border-border rounded-lg hover:border-foreground/20 transition-colors" />
</div>
```

## Color System

### Status Colors
- **Success**: `text-green-600`, `bg-green-600/10`, `border-green-600/20`
- **Warning**: `text-yellow-600`, `bg-yellow-600/10`, `border-yellow-600/20`
- **Error**: `text-red-600`, `bg-red-600/10`, `border-red-600/20`
- **Info**: `text-blue-600`, `bg-blue-600/10`, `border-blue-600/20`

### Interactive States
- **Hover borders**: `hover:border-foreground/20`
- **Hover backgrounds**: `hover:bg-accent/80`
- **Hover text**: `hover:text-foreground`
- **Focus states**: Use browser defaults with custom ring colors

## Animation & Transitions

### Standard Transitions
```css
transition-all duration-200  /* For most interactive elements */
transition-colors           /* For color-only changes */
```

### Hover Effects
- **Cards**: Subtle border color change + shadow
- **Buttons**: Background opacity change
- **Links**: Text color change

### Loading States
- **Pulse animation**: `animate-pulse` for loading indicators
- **Skeleton loading**: Use `bg-muted` with `animate-pulse`

## Layout Patterns

### Responsive Grid
```tsx
// Dashboard grid that adapts to screen size
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Grid items */}
</div>
```

### Centered Content
```tsx
// Centered content with max width
<div className="w-full flex justify-center">
  <div className="w-full max-w-4xl px-6">
    {/* Content */}
  </div>
</div>
```

### Sidebar Layout
```tsx
// Wide screen layout with sidebar
<div className="grid grid-cols-12 gap-8">
  <div className="col-span-8">{/* Main content */}</div>
  <div className="col-span-4">{/* Sidebar */}</div>
</div>
```

## Accessibility

### Focus Management
- Maintain logical tab order
- Provide visible focus indicators
- Use semantic HTML elements

### Screen Readers
- Use proper ARIA labels
- Provide alternative text for icons
- Use semantic headings hierarchy

### Keyboard Navigation
- Support standard keyboard shortcuts (⌘K for search)
- Ensure all interactive elements are keyboard accessible

## Best Practices

### Performance
- Use `transition-all duration-200` sparingly
- Prefer `transition-colors` for simple color changes
- Implement proper loading states

### Consistency
- Use design tokens from the theme
- Follow established patterns for similar components
- Maintain consistent spacing throughout

### Maintainability
- Use utility classes over custom CSS
- Document component variants
- Keep components focused and reusable

## Language Guidelines

### User-Facing Text
- Avoid technical jargon like "AI", "Agent", "Machine Learning"
- Use neutral terms: "Analysis", "Insights", "Summary", "Processing"
- Keep language simple and accessible

### Component Naming
- Use descriptive, non-technical names
- Focus on functionality rather than implementation
- Example: `ActivityFeed` instead of `AIActivityFeed`

## Examples

### Dashboard Card
```tsx
<Link href={`/w/${web.id}`} className="group block h-full">
  <div className="border border-border bg-card p-4 hover:border-foreground/20 hover:shadow-sm transition-all duration-200 h-full min-h-[160px] flex flex-col rounded-lg">
    <div className="space-y-3 flex-1">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs text-muted-foreground uppercase font-mono tracking-wider">
          {domain}
        </span>
        <span className="text-xs px-2 py-1 font-mono rounded-md bg-green-600/10 border border-green-600/20 text-green-600">
          COMPLETE
        </span>
      </div>
      <h3 className="text-sm font-medium line-clamp-2 group-hover:text-foreground/80 transition-all duration-200 leading-snug">
        {title}
      </h3>
    </div>
  </div>
</Link>
```

### Navigation Breadcrumb
```tsx
<nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
  <div className="flex h-14 items-center justify-between px-4">
    <div className="flex items-center gap-3">
      <Link href="/" className="hover:opacity-80 transition-opacity">
        <Logo />
      </Link>
      <span className="text-muted-foreground text-sm">/</span>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="text-foreground font-medium">
              Current Page
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  </div>
</nav>
``` 