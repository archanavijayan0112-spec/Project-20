@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-display: 'Fraunces', serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: #FAF6EF;
  color: #161312;
}

::selection {
  background-color: #E0A23B;
  color: #161312;
}

.btn-primary {
  @apply inline-flex items-center justify-center gap-2 bg-ink text-paper px-5 py-3 text-sm font-medium tracking-wide transition-colors hover:bg-clay rounded-sm;
}

.btn-secondary {
  @apply inline-flex items-center justify-center gap-2 border border-ink/20 bg-transparent text-ink px-5 py-3 text-sm font-medium tracking-wide transition-colors hover:border-ink rounded-sm;
}

.label-eyebrow {
  @apply font-mono text-[11px] uppercase tracking-[0.18em] text-ink/50;
}

.card-surface {
  @apply bg-white/60 border border-ink/10 rounded-sm;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
