# Studio Haven

Act as a principal React Developer and Elite UI/UX Creative Director. Let's initialize our flagship premium Design Agency Studio Hub & Client Workspace application boilerplate. Every view must utilize our 12px rounded-xl corners, #1A1A26 strokes, deep dark canvas palette (#08080C, #111118), and cyber-emerald accent colors (#00E676) with strict -0.03em tracked headlines.

Compile the application framework immediately into these highly distinctive layout structures:

1. Setup the Public Portfolio Grid & Split Checkout Gates:
- Overhaul '/portfolio': Build a beautiful 12-column creative showcase grid populated with mock premium agency design cases. Include active categorical navigation tags that toggle rows smoothly.
- Overhaul '/pricing': Build a multi-tier package matrix equipped with an animated range volume slider component that recalculates operational text weights on drag interactions.
- Overhaul '/checkout': Build a split-screen transactional view—one side housing text input form blocks for client intake parameters, the other side rendering a sticky statement-of-work summary receipt block with working voucher coupon validations.

2. Build the Active Client Workspace Dashboard with Runtime State Arrays:
- Overhaul '/client/tasks': Create a fully functional milestone state app using React useState hooks. Initialize it with 3 project items. Add a text form input bar and an "+ Add Deliverable" button that programmatically appends a fresh item row to the grid layout dynamically, complete with functional status toggle switches.
- Overhaul '/client/assets': Build a developer asset command vault holding code grids. Include one-click copy buttons that flash an emerald clipboard check verification badge when clicked.
- Overhaul '/client/booker': Build an active coordination calendar layout with selectable timeline block choices and a functional scheduling trigger input block.

3. Lock Down Complete Routing State Isolation & Link Destruct:
- Open the root routing configuration layer (router.tsx / App.tsx): Enforce a rigid synchronous check on localStorage to ensure session token validation persists flawlessly on hard browser refreshes (F5).
- On the Sign-In gate page, link "View Demo" to our persistence state: trigger a 1.2-second disabled loader animation spinner, write localStorage.setItem('app_secure_session_token', 'guest_demo_authorized'), and flash a temporary verification success toast message.
- Apply strict conditional rendering: when authorized, completely destroy, hide, and un-render the redundant 'Sign in' and 'Create account' choices from the sidebar options tree. Update the footer profile widget card to read 'Authorized Client Session' with a pulsing emerald status dot.
- Enforce strict max-w-[1600px] mx-auto constraints across internal views, sandbox layouts in Error Boundary wrappers, remove 7d/30d/90d pill bars from all settings/documentation paths, and maintain an empty, silent browser console log on mount!

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3da12a6a-3fb2-40d6-9fe3-8c6f3f453bae).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
