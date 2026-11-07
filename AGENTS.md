<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules

- Session token lives in browser localStorage under `app_secure_session_token` (guest value `guest_demo_authorized`); the `/client` route layout (src/routes/client.tsx) validates it synchronously in `beforeLoad` and again on mount, and redirects to `/signin` when absent. Why: the workspace gate must survive hard refreshes with no backend.
- The app is dark-only; all colors flow from the `:root` tokens in `src/styles.css` (canvas/surface/stroke/primary). Why: one locked design system, no hardcoded color classes in components.
- Major dashboard panels are wrapped in `PanelBoundary` (src/components/error-boundary.tsx) so a runtime error in one panel can't white-screen the page.
