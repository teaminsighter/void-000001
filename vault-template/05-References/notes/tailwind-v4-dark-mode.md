---
type: note
tags: [tailwind, css, dark-mode, dev]
saved: 2026-02-09
---

# Tailwind v4 Dark Mode Setup

In Tailwind v4, dark mode uses CSS `@custom-variant`:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

No more `darkMode: 'class'` in config. Just add `.dark` class to `<html>` and use `dark:bg-gray-900` as usual.

Source: https://tailwindcss.com/docs/dark-mode
