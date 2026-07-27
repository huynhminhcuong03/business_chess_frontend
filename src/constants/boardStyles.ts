import type { BoardCellType } from '../types/board';
import type { BoardCellDirection } from '../types/boardCell';

export const BOARD_GRID_TRACKS =
  '13.5% repeat(9, minmax(0, 1fr)) 13.5%';

export const CELL_BACKGROUND_CLASSES: Record<BoardCellType, string> = {
  START: 'bg-white',
  PROPERTY: 'bg-white',
  STATION: 'bg-white',
  UTILITY: 'bg-white',
  CHANCE: 'bg-white',
  COMMUNITY: 'bg-yellow-500',
  INCOME_TAX: 'bg-white',
  LUXURY_TAX: 'bg-white',
  JAIL: 'bg-white',
  FREE_PARKING: 'bg-white',
  GO_TO_JAIL: 'bg-white',
};

export const PROPERTY_COLOR_CLASSES: Record<string, string> = {
  RED: 'bg-red-500',
  GRAY: 'bg-gray-500',
  DARK_BLUE: 'bg-blue-900',
  GREEN: 'bg-green-500',
  ORANGE: 'bg-orange-500',
  YELLOW: 'bg-yellow-400',
  PRIMARY: 'bg-violet-500',
  BLUE: 'bg-blue-500',
};

export const CONTENT_DIRECTION_CLASSES: Record<
  BoardCellDirection,
  string
> = {
  top: 'rotate-180',
  right: '-rotate-90',
  bottom: 'rotate-0',
  left: 'rotate-90',
  'corner-bottom-left': 'rotate-45',
  'corner-top-left': 'rotate-135',
  'corner-top-right': '-rotate-135',
  'corner-bottom-right': '-rotate-45',
};
