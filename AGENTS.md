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

- Sign-in is owned by Lovable Cloud Auth; all workspace routes live beneath `/portal`, which checks the verified auth session before rendering. Demo access is a local-only preview with no access to private database rows. Why: client records must remain protected by real identity and row-level ownership.
- The app is dark-only; all colors flow from the `:root` tokens in `src/styles.css` (canvas/surface/stroke/primary). Why: one locked design system, no hardcoded color classes in components.
- Major dashboard panels are wrapped in `PanelBoundary` (src/components/error-boundary.tsx) so a runtime error in one panel can't white-screen the page.
- Authenticated database reads and writes use `requireSupabaseAuth` server functions, and database ownership is derived from the verified auth context. Why: route guards alone cannot secure callable data actions.
