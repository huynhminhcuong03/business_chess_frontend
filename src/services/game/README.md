# Game Service Boundary

This folder is the swap point between the current local game logic and a future backend API.

Keep in the frontend:
- Rendering board cells, icons, cards, dice, panels, and player money/deed UI.
- Temporary UI state such as modals, expanded deed cards, dice animation, and waiting states.
- Calling service methods and applying returned state to React.

Move behind API later:
- Buying property.
- Building houses/hotels.
- Paying tax and rent.
- Mortgaging/redeeming property.
- Moving players, sending players to jail, and using jail-free cards.
- Drawing/executing Chance and Community cards.
- Bankruptcy, ownership, and money mutations.

Current files:
- `index.ts`: single import point for hooks. Switch exports here when replacing local logic with API calls.
- `apiGameService.ts`: future backend request methods. It is exported but not wired into the UI yet.
- `localGameService.ts`: local implementation of game state mutations.
- `localCardService.ts`: local implementation of card draw, card execution, and card helper calculations.
- `../apiClient.ts`: shared fetch wrapper using `VITE_API_URL`.
- `../../types/gameApi.ts`: DTO/request/response types for backend integration.

Future shape:
- Keep UI components and hooks calling the service layer.
- Replace local state updates with API responses without changing component props.
- When the backend is ready, map `GameSnapshotDTO` into the existing `Player` and `PropertyOwnership` UI types.
