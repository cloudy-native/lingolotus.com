# Theme

The site has one palette: **warm paper**.

- Tokens: `src/theme/warm-paper.ts`
- Entry: `src/theme/colors.ts`
- Surfaces: `src/styles/global.css` (`bg-paper`, `bg-paper-page`) and Tailwind `paper` / `paper.page`

Cream page, ivory cards, terracotta phonetics, clay (`orange-800`) actions, stone ink. Level bands use orange / amber / rose / stone — not clinic teal or sky.

Do not add parallel `colors-*.ts` variants. Change the paper tokens, then the CSS variables and shared `levelSurfaces` if the temperature needs a nudge.
