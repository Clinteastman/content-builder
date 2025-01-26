# Dark Mode

Using variants to style your site in dark mode.

## Overview

Dark mode is now a standard feature for many operating systems. Tailwind makes it easy to implement with the `dark` variant:

```html
<div class="bg-white dark:bg-gray-800 rounded-lg px-6 py-8 ring shadow-xl ring-gray-900/5">
  <div>
    <span class="inline-flex items-center justify-center rounded-md bg-indigo-500 p-2 shadow-lg">
      <svg class="h-6 w-6 stroke-white"><!-- ... --></svg>
    </span>
  </div>
  <h3 class="text-gray-900 dark:text-white mt-5 text-base font-medium tracking-tight">
    Writes upside-down
  </h3>
  <p class="text-gray-500 dark:text-gray-400 mt-2 text-sm">
    The Zero Gravity Pen can be used to write in any orientation, including upside-down. It even works in outer space.
  </p>
</div>
```

By default, it uses the `prefers-color-scheme` CSS media feature.

## Toggling dark mode manually

To use a CSS selector instead of `prefers-color-scheme`, override the `dark` variant:

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

Then use the `dark` class in your HTML:

```html
<html class="dark">
  <body>
    <div class="bg-white dark:bg-black">
      <!-- ... -->
    </div>
  </body>
</html>
```

### Using a data attribute

For data attribute activation:

```css
@import "tailwindcss";
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
```

Usage:

```html
<html data-theme="dark">
  <body>
    <div class="bg-white dark:bg-black">
      <!-- ... -->
    </div>
  </body>
</html>
```

### With system theme support

For three-way theme toggles (light, dark, system), use this JavaScript:

```javascript
// Add to head to avoid FOUC
document.documentElement.classList.toggle(
  "dark",
  localStorage.currentTheme === "dark" ||
    (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches),
);

// Light mode
localStorage.currentTheme = "light";

// Dark mode
localStorage.currentTheme = "dark";

// System preference
localStorage.removeItem("theme");
```