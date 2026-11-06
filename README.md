# Idea to Merge with the Copilot App

<img src="https://octodex.github.com/images/Professortocat_v2.png" align="right" height="200px" />

Hey kxc514!

Mona here. I'm done preparing your exercise. Hope you enjoy! 💚

Remember, it's self-paced so feel free to take a break! ☕️

[![](https://img.shields.io/badge/Go%20to%20Exercise-%E2%86%92-1f883d?style=for-the-badge&logo=github&labelColor=197935)](https://github.com/kxc514/skills-idea-to-merge-with-the-copilot-app/issues/1)

## Bookmark manager

Enter a website URL with or without `https://` to save its normalized URL
and a locally generated base62 `mona-` slug. Each row displays
`<url> :: <slug>`; Copy copies the slug, and Clear all asks for confirmation.
Slugs are local labels, not hosted short-link redirects.

Bookmarks are stored on this device under `mona-bookmarks` in `localStorage`.
Malformed or legacy entries are ignored on load. Storage and clipboard failures
are reported in the app; failed saves leave the entered URL intact.
Only HTTP and HTTPS links are accepted.

With Node.js 22.12 or newer, run `npm install`, `npm test` for the browser-free
helper tests, and `npm run build` for the static production build.
