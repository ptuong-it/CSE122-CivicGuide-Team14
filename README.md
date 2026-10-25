# CivicGuide

CivicGuide is a Vietnamese-language prototype for discovering public-service procedures, preparing sample checklists, and simulating application tracking. It is a visual demo only; it is not an official government service and must not be used with real identity documents or personal data.

## Run locally

Serve the repository root over HTTP (for example, use the **Live Server** extension in VS Code and open `index.html`). The pages load sample JSON with `fetch`, so opening the HTML directly with a `file://` URL may prevent data from loading.

## Project structure

| Location | Responsibility |
| --- | --- |
| `index.html` | Public landing page |
| `pages/public/` | Search, procedure catalog and detail, authentication, help, contact, and privacy pages |
| `pages/citizen/` | Citizen dashboard, checklists, saved procedures, application wizard, tracking, notifications, and account settings |
| `pages/editor/` | Editor overview, procedure management/editing, approval queue, and AI review alerts |
| `pages/admin/` | System overview, procedure content management, user access, and system settings |
| `pages/shared/` | Access-denied (403) and not-found (404) screens |
| `css/style.css` | Base design tokens and shared component styles |
| `css/components.css` | Page and component styles |
| `css/responsive.css` | CivicGuide mockup theme overrides and responsive layout rules |
| `js/main.js` | Shared theme, search, and toast behavior |
| `js/ui-components.js` | Admin/editor header, role navigation, and demo table/form actions |
| `js/modules/` | Feature-specific behavior for public, citizen, and admin screens |
| `assets/data/` | Sample procedure, user, application, checklist, notification, and AI-alert JSON |
| `design/mockups/` | Reference PDF screens used for the interface |

## Screen-to-page map

| Mockup group | Page(s) |
| --- | --- |
| Public discovery (01) | `index.html`, `pages/public/public-service-catalog.html`, `pages/public/public-procedure-search.html`, `pages/public/public-procedure-detail.html` |
| Authentication (02) | `pages/public/public-auth-login.html`, `pages/public/public-auth-register.html`, `pages/public/public-password-reset.html` |
| Citizen workspace (03, 05) | `pages/citizen/citizen-dashboard-view.html`, `pages/citizen/citizen-checklist-home.html`, `pages/citizen/citizen-checklist-manage.html`, `pages/citizen/citizen-procedure-saved.html`, `pages/citizen/citizen-account-settings.html`, `pages/citizen/citizen-notification-list.html` |
| Application flow (04) | `pages/citizen/citizen-application-create.html` (Dynamic 3-step wizard with validation and submit) |
| Tracking and help (05, 06) | `pages/citizen/citizen-application-track.html`, `pages/citizen/citizen-application-detail.html`, `pages/public/public-help-center.html`, `pages/public/public-contact-support.html`, `pages/public/shared-terms-privacy.html` |
| Editorial and administration (07) | `pages/editor/editor-dashboard-view.html`, `pages/editor/editor-procedure-manage.html`, `pages/editor/editor-procedure-edit.html`, `pages/editor/editor-approval-queue.html`, `pages/editor/editor-aialert-manage.html`, `pages/admin/admin-dashboard-view.html`, `pages/admin/admin-procedure-manage.html`, `pages/admin/admin-user-manage.html`, `pages/admin/admin-system-settings.html` |
| Error handling | `pages/shared/shared-error-403.html`, `pages/shared/shared-error-404.html` |

Pages live in their corresponding role directory under `pages/`. Feature scripts are loaded by the HTML page that uses them; shared styles and `main.js` are loaded by all screens.
