---
version: alpha
name: Wikipedia Android
description: Design tokens for the Wikipedia Android mobile app
colors:
  # Neutral Colors - Grays
  white: "#FFFFFF"
  gray100: "#F8F9Fa"
  gray200: "#EAECF0"
  gray300: "#C8CCD1"
  gray400: "#A2A9B1"
  gray500: "#72777D"
  gray600: "#54595D"
  gray650: "#2E3136"
  gray675: "#27292D"
  gray700: "#202122"
  black: "#000000"

  # Primary Colors - Actions and CTAs
  blue300: "#6699FF"
  blue600: "#3366CC"

  # Success Colors
  green600: "#00AF89"
  green700: "#14866D"
  green800: "#196551"

  # Error Colors
  red500: "#FF4242"
  red700: "#B32424"

  # Warning/Alert Colors
  yellow500: "#FFCC33"
  yellow700: "#AC6600"
  orange500: "#FF9500"
  orange200: "#FFC894"

  # Semantic Colors - Light Theme
  paper: "#FFFFFF"
  background: "#F8F9Fa"
  border: "#EAECF0"
  primary_text: "#202122"
  secondary_text: "#54595D"
  placeholder_text: "#72777D"
  inactive: "#A2A9B1"
  progressive: "#3366CC"
  success: "#14866D"
  destructive: "#B32424"
  warning: "#AC6600"
  highlight: "#FFCC33"
  focus: "#FF9500"

typography:
  headline_large:
    fontFamily: "sans-serif"
    fontSize: "24sp"
    fontWeight: 700
    lineHeight: "32sp"

  headline_medium:
    fontFamily: "sans-serif"
    fontSize: "20sp"
    fontWeight: 700
    lineHeight: "28sp"

  headline_small:
    fontFamily: "sans-serif"
    fontSize: "16sp"
    fontWeight: 700
    lineHeight: "24sp"

  body_large:
    fontFamily: "sans-serif"
    fontSize: "16sp"
    fontWeight: 400
    lineHeight: "24sp"

  body_medium:
    fontFamily: "sans-serif"
    fontSize: "14sp"
    fontWeight: 400
    lineHeight: "24sp"

  body_small:
    fontFamily: "sans-serif"
    fontSize: "12sp"
    fontWeight: 400
    lineHeight: "20sp"

  label_medium:
    fontFamily: "sans-serif-medium"
    fontSize: "12sp"
    fontWeight: 600
    lineHeight: "16sp"

  article_headline:
    fontFamily: "serif"
    fontSize: "24sp"
    fontWeight: 400

  article_body:
    fontFamily: "serif"
    fontSize: "16sp"
    fontWeight: 400

rounded:
  xs: "2dp"
  sm: "4dp"
  md: "12dp"

spacing:
  xs: "2dp"
  sm: "4dp"
  md: "8dp"
  lg: "16dp"
  xl: "24dp"
  xxl: "32dp"

components:
  button:
    backgroundColor: "{progressive}"
    textColor: "{white}"
    paddingHorizontal: "{lg}"
    paddingVertical: "{md}"
    borderRadius: "{sm}"

  card:
    backgroundColor: "{paper}"
    borderColor: "{border}"
    borderRadius: "{md}"
    padding: "{lg}"

  input_field:
    backgroundColor: "{paper}"
    borderColor: "{border}"
    textColor: "{primary_text}"
    placeholderColor: "{placeholder_text}"
    borderRadius: "{sm}"

  chip:
    backgroundColor: "{background}"
    textColor: "{primary_text}"
    paddingHorizontal: "{md}"
    paddingVertical: "{sm}"
    borderRadius: "{sm}"

  toolbar:
    backgroundColor: "{paper}"
    height: "56dp"
    elevation: "4dp"
---

## Overview

The Wikipedia Android app is a clean, accessible, and intuitive mobile encyclopedia designed for reading and exploring millions of articles in over 300 languages. The design prioritizes readability, multilingual support, and offline access while maintaining a neutral, professional aesthetic that focuses users on content.

The visual identity is intentionally minimal and accessible. High contrast between text and backgrounds ensures readability in all lighting conditions. The neutral color palette allows the article content to be the focal point. Semantic colors (blue for actions, green for success, red for errors) provide clear behavioral feedback.

## Colors

### Neutral Grays

The neutral palette forms the backbone of the design system. Grays 100–700 create visual hierarchy from lightest backgrounds to darkest text, ensuring sufficient contrast ratios for WCAG AA compliance across light and dark themes.

- **Gray 100–300**: Backgrounds, borders, dividers
- **Gray 400–500**: Inactive elements, placeholders
- **Gray 600–700**: Primary and secondary text

### Semantic Colors

**Progressive (Action/Primary):** Blue 600 (#3366CC) is used for primary actions, links, and interactive elements. This brand-safe color encourages user engagement while maintaining readability.

**Success:** Green 700 (#14866D) indicates completed actions or positive states (saved articles, successful edits).

**Destructive:** Red 700 (#B32424) signals warnings, errors, and destructive actions (delete, logout).

**Warning:** Yellow 700 (#AC6600) draws attention to cautionary messages. Used sparingly to avoid alert fatigue.

**Highlight:** Yellow 500 (#FFCC33) accents important content or search results without overwhelming the interface.

## Typography

The app uses a two-typeface system: **sans-serif for UI** and **serif for article content**. This distinction helps readers differentiate between navigational and editorial text.

### Headlines (Sans-serif)

- **Headline Large (H1):** 24sp, bold. Used for article titles and major section headers.
- **Headline Medium (H2):** 20sp, bold. Subsections and modal titles.
- **Headline Small (H3):** 16sp, bold. List items and card headers.

### Body Text (Sans-serif)

- **Body Large:** 16sp, regular. Primary content and descriptions.
- **Body Medium:** 14sp, regular. Secondary content, menu items.
- **Body Small:** 12sp, regular. Captions, hints, timestamps.

### Article Typography (Serif)

- **Article Headlines:** 24sp, serif. Article section titles maintain editorial character.
- **Article Body:** 16sp, serif. Article text uses serif to match Wikipedia's web aesthetic and improve reading comfort in long-form content.

## Layout

### Spacing Scale

The app uses an 8dp base unit for consistent rhythm and visual alignment. Common values:

- **2dp:** Minimal spacing (dividers, compact text)
- **4dp:** Corner radius on small elements
- **8dp:** Standard padding/margin
- **16dp:** Content insets, list item padding
- **24dp & 32dp:** Large section spacing, container padding

### Navigation Bar

The navigation bar is 72dp tall, positioned at the bottom for thumb-friendly access. Accommodates icon (24dp) + label (11sp) hierarchy.

### Cards & Containers

Cards use 4dp corner radius for subtlety. Standard padding is 16dp. Borders are 1dp using Gray 200. Elevations:

- **Toolbar:** 4dp (subtle elevation from content)
- **Cards & Bottom Sheets:** 0dp to 8dp depending on depth
- **Floating Action Buttons:** Reserved for future use; currently no FABs in Wikipedia app

## Elevation & Depth

The design avoids heavy shadows. Depth is suggested through:

- **Subtle borders** (1dp Gray 200 on light theme)
- **Background color shifts** (one or two grays lighter/darker)
- **Minimal elevation** (2–4dp on key UI elements like toolbars)

This keeps the interface lightweight and ensures content remains the focal point.

## Shapes

### Corner Radius Scale

- **XS (2dp):** Input fields, small chips, minor UI elements
- **SM (4dp):** Buttons, cards, standard containers
- **MD (12dp):** Wiki cards, larger components

All corners are rounded to humanize the design without appearing overly playful.

## Components

### Buttons

**Primary Button:** Blue 600 background, white text, 4dp radius, 16dp horizontal padding, 8dp vertical padding. Used for main CTAs (Search, Edit, Save).

**Secondary Button:** Gray 200 background, Gray 700 text. Used for alternative actions (Cancel, Skip, More).

**Text Button:** No background, Blue 600 text. Used for tertiary actions (Learn More, Dismiss).

### Input Fields

White background, Gray 200 border (1dp), 4dp radius. Placeholder text in Gray 500. On focus: border changes to Blue 600. Error state: border changes to Red 700.

### Cards

White background, Gray 200 border (1dp), 4dp radius, 16dp padding. Subtle elevation or border to separate from background. Used for article summaries, search results, and featured content.

### Chips

Light gray background, 8dp horizontal padding, 4dp vertical padding, 4dp radius. Primarily used for language selection and content filters. Selected state: Blue 600 background with white text.

### Toolbars

White background, 56dp height (responsive to system font scaling), 4dp elevation. Title uses Headline Small (H3). Icons are 24dp.

## Do's and Don'ts

### Do:

- Prioritize **readability over decoration.** High contrast, legible sizes, generous whitespace.
- Use **semantic colors consistently.** Blue for actions, green for success, red for errors.
- Maintain **clear visual hierarchy.** Font size and weight guide scanning.
- Provide **multilingual support.** Test layouts with right-to-left and complex scripts.
- Support **system settings.** Respect system font size and dark mode preferences.
- Test for **accessibility.** Ensure WCAG AA compliance; minimum 4.5:1 contrast for text.

### Don't:

- Overuse bright colors. Reserve them for semantic meaning.
- Rely on color alone to communicate status (e.g., combine color with icons or text).
- Use very small text sizes (below 12sp) for body content.
- Add decorative elements that compete with article content.
- Ignore safe areas. Respect system navigation bars and status bars.
- Create visual clutter. Whitespace is your ally.

---

**Last Updated:** 2026
**Platform:** Android (Material Design 3)
**Status:** Active – Used in Wikipedia Android app v3.x+
