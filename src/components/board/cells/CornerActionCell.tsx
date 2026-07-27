import freeParkingImage from '../../../assets/images/board_img/free_parking.png';
import goJailImage from '../../../assets/images/board_img/go_jail.png';
import jailImage from '../../../assets/images/board_img/jail.png';
import type { BoardCell } from '../../../types/board';
import type { BoardCellDirection } from '../../../types/boardCell';
import BaseBoardCell from './BaseBoardCell';

interface CornerActionCellProps {
    cell: BoardCell;
    direction: BoardCellDirection;
}

function JailCellContent({ name }: { name: string }) {
    const [jailLabel = 'Ở tù', visitLabel = 'Thăm tù'] = name
        .split('/')
        .map((label) => label.trim());

    return (
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-1">
            <div className="flex h-full w-full min-h-0 flex-col items-center justify-between gap-1 overflow-hidden">

                <div className='flex flex-col w-fit justify-center items-center border border-black '>
                    <div className="flex w-2/3 min-h-0 flex-1 items-center justify-center overflow-hidden">
                        <img
                            src={jailImage}
                            alt={jailLabel}
                            className="max-h-full max-w-full object-contain"
                        />
                    </div>

                    <p className="board-corner-title shrink-0 w-1/3 text-center font-black uppercase text-rose-700">
                        {jailLabel}
                    </p>
                </div>


                <p className="board-corner-subtitle shrink-0 text-center font-black uppercase text-rose-700">
                    {visitLabel}
                </p>
            </div>
        </div>
    );
}

function FreeParkingCellContent({ name }: { name: string }) {
    const labelMatch = name.match(/^(.*?)\s*\((.*?)\)$/);
    const parkingLabel =
        labelMatch?.[1]?.trim() ?? name;
    const freeLabel =
        labelMatch?.[2]?.trim() ?? 'Miễn phí';

    return (
        <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden p-2">
            <span className="board-corner-subtitle wrap-break-word flex items-center justify-center font-black uppercase text-rose-700">
                {parkingLabel}
            </span>

            <div className="flex h-[50%] w-[50%] -rotate-45 items-center justify-center overflow-hidden">
                <img
                    src={freeParkingImage}
                    alt="Bãi đậu xe"
                    className="h-full w-full object-contain"
                />
            </div>

            <span className="board-corner-subtitle wrap-break-word flex max-w-14 items-center justify-center font-black uppercase text-rose-700">
                {freeLabel}
            </span>
        </div>
    );
}

function GoToJailCellContent({ name }: { name: string }) {
    return (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 p-1.5">
            <div className="flex h-[68%] w-[68%] rotate-45 items-center justify-center overflow-hidden">
                <img
                    src={goJailImage}
                    alt="Vào tù"
                    className="h-full w-full object-contain"
                />
            </div>

            <span className="board-corner-title wrap-break-word font-black uppercase text-rose-700">
                {name}
            </span>
        </div>
    );
}

function DefaultCornerCellContent({ name }: { name: string }) {
    return (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-1">
            <span className="board-cell-name wrap-break-word font-semibold text-slate-800">
                {name}
            </span>
        </div>
    );
}

function CornerActionCell({
    cell,
    direction,
}: CornerActionCellProps) {
    function renderContent() {
        switch (cell.type) {
            case 'JAIL':
                return <JailCellContent name={cell.name} />;

            case 'FREE_PARKING':
                return (
                    <FreeParkingCellContent
                        name={cell.name}
                    />
                );

            case 'GO_TO_JAIL':
                return (
                    <GoToJailCellContent
                        name={cell.name}
                    />
                );

            default:
                return (
                    <DefaultCornerCellContent
                        name={cell.name}
                    />
                );
        }
    }

    return (
        <BaseBoardCell cell={cell} direction={direction}>
            {renderContent()}
        </BaseBoardCell>
    );
}

export default CornerActionCell;
