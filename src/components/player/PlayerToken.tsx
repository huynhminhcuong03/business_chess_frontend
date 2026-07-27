import { PLAYER_TOKEN_COLOR_CLASSES } from '../../constants/playerStyles';
import type { Player } from '../../types/player';

interface PlayerTokenProps {
  player: Player;
}

function PlayerToken({ player }: PlayerTokenProps) {
  return (
    <div
      title={player.name}
      aria-label={player.name}
      className={`relative flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-white text-[9px] font-black leading-none text-white shadow-lg ring-1 ring-slate-900/25 ${
        PLAYER_TOKEN_COLOR_CLASSES[player.tokenColor]
      }`}
    >
      <span className="absolute inset-0 rounded-full bg-white/20" />
      <span className="relative">{player.id}</span>
    </div>
  );
}

export default PlayerToken;
