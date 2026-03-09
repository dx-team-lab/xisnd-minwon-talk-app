# **App Name**: MinwonTalk

## Core Features:

- Firebase User Management: Secure login/logout functionality using Firebase Authentication, and role-based authorization leveraging Firestore user data for access control to features and data.
- Dynamic Complaint Dashboard: An interactive main dashboard displaying project overviews, latest civil complaints, and compensation case summaries with key metrics, populated from Firestore.
- Advanced Search & Filtering: Comprehensive filter bar with multi-select dropdowns for region, phase, type, and compensation details, enabling users to efficiently locate specific complaints or cases stored in Firestore.
- Complaint & Case Management: Core CRUD operations for managing civil complaints and compensation cases, including creation, detailed viewing (via modal), and updating of records in Firestore.
- Response Plan & Case Precedent Viewer: Structured display of detailed response action plans and browsable tables of past compensation cases from Firestore, featuring descriptive tags and drill-down options.
- AI-powered Response Assistant: An AI tool that suggests optimal response actions from the `responses` collection based on the specifics and keywords of an entered complaint, aiding in effective dispute resolution.
- Filtered Data Export: Allow users to download currently displayed (filtered) complaint and compensation case data into an Excel file for further analysis and reporting.

## Style Guidelines:

- Primary accent: A sophisticated Deep Ocean Blue (#1E40AF), evoking reliability and professionalism. This serves as the dominant brand color for navigation and key interactive elements.
- Analogous secondary accent: A dynamic Sky Cyan (#50C2ED) derived from the primary hue, providing visual depth and a complementary contrast for callouts and highlighting.
- Neutral background: An airy Pale Blue Gray (#F8FAFC), offering a clean and unobtrusive canvas that harmonizes with the cool primary tones and ensures content readability.
- Action button color: A vibrant Verdant Green (#22C55E) designated for prominent call-to-action buttons, signaling successful actions and positive interactions, as specified by user input.
- Headline and section titles will utilize 'Space Grotesk', a modern sans-serif, for a distinctive, slightly tech-forward and clean aesthetic.
- Body text and detailed content will feature 'Inter', a highly readable grotesque-style sans-serif, ensuring clarity and neutrality across tables and descriptions.
- Use a consistent set of clean, line-based icons for clarity and intuitive navigation, particularly for filtering actions, data export, and view mode toggles.
- Implement a responsive design with breakpoints for Desktop (1280px+ for a 2-column layout), Tablet (768px-1279px for a stacked 1-column layout), and Mobile (767px- for an optimized, potentially horizontally scrollable 1-column view).
- Introduce subtle animations for filter selections, data loading states, and modal transitions to provide fluid user feedback and a polished feel.