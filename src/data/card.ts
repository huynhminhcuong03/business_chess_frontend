import type { GameCard } from '../types/card';

export const chanceCards: GameCard[] = [
    {
        id: 1,
        type: 'CHANCE',
        title: 'Được bầu làm giám đốc',
        description: 'Trả mỗi người chơi $50.',
        actionType: 'PAY_EACH_PLAYER',
        actionData: {
            amountPerPlayer: 50,
        },
    },
    {
        id: 2,
        type: 'CHANCE',
        title: 'Nhà Bank lớn tiền',
        description: 'Lãnh $50 từ ngân hàng.',
        actionType: 'RECEIVE_FROM_BANK',
        actionData: {
            amount: 50,
        },
    },
    {
        id: 3,
        type: 'CHANCE',
        title: 'Kẻ gian móc túi',
        description: 'Trả $15 cho ngân hàng.',
        actionType: 'PAY_TO_BANK',
        actionData: {
            amount: 15,
        },
    },
    {
        id: 4,
        type: 'CHANCE',
        title: 'Đi lùi 3 bước',
        description: 'Di chuyển lùi lại 3 ô.',
        actionType: 'MOVE_BACK',
        actionData: {
            steps: 3,
        },
    },
    {
        id: 5,
        type: 'CHANCE',
        title: 'Đến ô Nguyễn Tri Phương',
        description:
            'Di chuyển đến ô Nguyễn Tri Phương.',
        actionType: 'MOVE_TO_POSITION',
        actionData: {
            targetPosition: 24,
            collectStartSalary: true,
        },
    },
    {
        id: 6,
        type: 'CHANCE',
        title: 'Sửa chữa nhà',
        description:
            'Trả $25 cho mỗi nhà và $100 cho mỗi khách sạn.',
        actionType: 'REPAIR_PROPERTIES',
        actionData: {
            amountPerHouse: 25,
            amountPerHotel: 100,
        },
    },
    {
        id: 7,
        type: 'CHANCE',
        title: 'Vào tù',
        description:
            'Đi thẳng vào tù, không đi ngang ô Bắt Đầu và không được lãnh $200.',
        actionType: 'GO_TO_JAIL',
        actionData: {
            targetPosition: 10,
            collectStartSalary: false,
        },
    },
    {
        id: 8,
        type: 'CHANCE',
        title: 'Gặp lại cố nhân',
        description: 'Lãnh $150 từ ngân hàng.',
        actionType: 'RECEIVE_FROM_BANK',
        actionData: {
            amount: 150,
        },
    },
    {
        id: 9,
        type: 'CHANCE',
        title: 'Tự Do Ra Tù',
        description: 'Giữ lại để sử dụng hoặc bán.',
        actionType: 'GET_OUT_OF_JAIL',
        actionData: {
            keepable: true,
        },
    },
    {
        id: 10,
        type: 'CHANCE',
        title: 'Đến ô công ty gần nhất',
        description:
            'Di chuyển đến công ty gần nhất và xử lý tiền thuê theo kết quả xúc xắc.',
        actionType: 'MOVE_TO_NEAREST_UTILITY',
        actionData: {
            rentMultiplier: 10,
            collectStartSalary: true,
        },
    },
    {
        id: 11,
        type: 'CHANCE',
        title: 'Đến ô Bắt Đầu',
        description:
            'Di chuyển đến ô Bắt Đầu và lãnh $200.',
        actionType: 'MOVE_TO_POSITION',
        actionData: {
            targetPosition: 0,
            collectStartSalary: true,
        },
    },
    {
        id: 12,
        type: 'CHANCE',
        title: 'Đến ô Tân Kỳ Tân Quý',
        description:
            'Đi đến ô Tân Kỳ Tân Quý. Nếu qua ô Bắt Đầu, được nhận $200.',
        actionType: 'MOVE_TO_POSITION',
        actionData: {
            targetPosition: 39,
            collectStartSalary: true,
        },
    },
    {
        id: 13,
        type: 'CHANCE',
        title: 'Đến ô Nguyễn Tất Thành',
        description:
            'Di chuyển đến Nguyễn Tất Thành. Nếu đi ngang ô Bắt Đầu thì lãnh $200.',
        actionType: 'MOVE_TO_POSITION',
        actionData: {
            targetPosition: 11,
            collectStartSalary: true,
        },
    },
    {
        id: 14,
        type: 'CHANCE',
        title: 'Đến ô Bến xe Cần Giuộc',
        description:
            'Di chuyển đến Bến xe Cần Giuộc. Nếu đi ngang ô Bắt Đầu thì lãnh $200.',
        actionType: 'MOVE_TO_POSITION',
        actionData: {
            targetPosition: 5,
            collectStartSalary: true,
        },
    },
    {
        id: 15,
        type: 'CHANCE',
        title: 'Đến ô bến xe gần nhất',
        description:
            'Di chuyển đến bến xe gần nhất. Trả tiền thuê gấp đôi hoặc mua nếu chưa có chủ.',
        actionType: 'MOVE_TO_NEAREST_STATION',
        actionData: {
            rentMultiplier: 2,
            collectStartSalary: true,
            canPurchaseIfUnowned: true,
        },
    },
    {
        id: 16,
        type: 'CHANCE',
        title: 'Đến ô bến xe gần nhất',
        description:
            'Di chuyển đến bến xe gần nhất. Trả tiền thuê gấp đôi hoặc mua nếu chưa có chủ.',
        actionType: 'MOVE_TO_NEAREST_STATION',
        actionData: {
            rentMultiplier: 2,
            collectStartSalary: true,
            canPurchaseIfUnowned: true,
        },
    },
];

export const communityCards: GameCard[] = [
    {
        id: 1,
        type: 'COMMUNITY',
        title: 'Trả tiền sửa đường',
        description:
            'Trả $40 cho mỗi nhà và $115 cho mỗi khách sạn.',
        actionType: 'REPAIR_PROPERTIES',
        actionData: {
            amountPerHouse: 40,
            amountPerHotel: 115,
        },
    },
    {
        id: 2,
        type: 'COMMUNITY',
        title: 'Đoạt giải Á hậu',
        description: 'Lãnh $10 từ ngân hàng.',
        actionType: 'RECEIVE_FROM_BANK',
        actionData: {
            amount: 10,
        },
    },
    {
        id: 3,
        type: 'COMMUNITY',
        title: 'Nhà Bank lớn tiền',
        description: 'Lãnh $200 từ ngân hàng.',
        actionType: 'RECEIVE_FROM_BANK',
        actionData: {
            amount: 200,
        },
    },
    {
        id: 4,
        type: 'COMMUNITY',
        title: 'Trả tiền sửa đường',
        description:
            'Trả $40 cho mỗi nhà và $115 cho mỗi khách sạn.',
        actionType: 'REPAIR_PROPERTIES',
        actionData: {
            amountPerHouse: 40,
            amountPerHotel: 115,
        },
    },
    {
        id: 5,
        type: 'COMMUNITY',
        title: 'Đoạt giải Á hậu',
        description: 'Lãnh $10 từ ngân hàng.',
        actionType: 'RECEIVE_FROM_BANK',
        actionData: {
            amount: 10,
        },
    },
    {
        id: 6,
        type: 'COMMUNITY',
        title: 'Nhà Bank lớn tiền',
        description: 'Lãnh $200 từ ngân hàng.',
        actionType: 'RECEIVE_FROM_BANK',
        actionData: {
            amount: 200,
        },
    },
    {
        id: 7,
        type: 'COMMUNITY',
        title: 'Lãnh tiền thừa kế',
        description: 'Lãnh $100 từ ngân hàng.',
        actionType: 'RECEIVE_FROM_BANK',
        actionData: {
            amount: 100,
        },
    },
    {
        id: 8,
        type: 'COMMUNITY',
        title: 'Trả tiền khám bệnh',
        description: 'Trả $50 cho ngân hàng.',
        actionType: 'PAY_TO_BANK',
        actionData: {
            amount: 50,
        },
    },
    {
        id: 9,
        type: 'COMMUNITY',
        title: 'Trả tiền bệnh viện',
        description: 'Trả $100 cho ngân hàng.',
        actionType: 'PAY_TO_BANK',
        actionData: {
            amount: 100,
        },
    },
    {
        id: 10,
        type: 'COMMUNITY',
        title: 'Quà Giáng Sinh',
        description: 'Lãnh $100 từ ngân hàng.',
        actionType: 'RECEIVE_FROM_BANK',
        actionData: {
            amount: 100,
        },
    },
    {
        id: 11,
        type: 'COMMUNITY',
        title: 'Cho con đi học',
        description: 'Trả $150 cho ngân hàng.',
        actionType: 'PAY_TO_BANK',
        actionData: {
            amount: 150,
        },
    },
    {
        id: 12,
        type: 'COMMUNITY',
        title: 'Nhận tiền phục vụ',
        description: 'Lãnh $25 từ ngân hàng.',
        actionType: 'RECEIVE_FROM_BANK',
        actionData: {
            amount: 25,
        },
    },
    {
        id: 13,
        type: 'COMMUNITY',
        title: 'Đến ô Bắt Đầu',
        description:
            'Di chuyển đến ô Bắt Đầu và lãnh $200.',
        actionType: 'MOVE_TO_POSITION',
        actionData: {
            targetPosition: 0,
            collectStartSalary: true,
        },
    },
    {
        id: 14,
        type: 'COMMUNITY',
        title: 'Khai trương nhà hát',
        description: 'Thu mỗi người chơi $50.',
        actionType: 'COLLECT_FROM_EACH_PLAYER',
        actionData: {
            amountPerPlayer: 50,
        },
    },
    {
        id: 15,
        type: 'COMMUNITY',
        title: 'Lãnh lương hưu',
        description: 'Lãnh $200 từ ngân hàng.',
        actionType: 'RECEIVE_FROM_BANK',
        actionData: {
            amount: 200,
        },
    },
    {
        id: 16,
        type: 'COMMUNITY',
        title: 'Tự Do Ra Tù',
        description: 'Giữ lại để sử dụng hoặc bán.',
        actionType: 'GET_OUT_OF_JAIL',
        actionData: {
            keepable: true,
        },
    },
    {
        id: 17,
        type: 'COMMUNITY',
        title: 'Vào tù',
        description:
            'Đi thẳng vào tù, không đi ngang ô Bắt Đầu và không được lãnh $200.',
        actionType: 'GO_TO_JAIL',
        actionData: {
            targetPosition: 10,
            collectStartSalary: false,
        },
    },
    {
        id: 18,
        type: 'COMMUNITY',
        title: 'Quà khuyến mãi',
        description: 'Lãnh $50 từ ngân hàng.',
        actionType: 'RECEIVE_FROM_BANK',
        actionData: {
            amount: 50,
        },
    },
    {
        id: 19,
        type: 'COMMUNITY',
        title: 'Làm thêm giờ',
        description: 'Lãnh $20 từ ngân hàng.',
        actionType: 'RECEIVE_FROM_BANK',
        actionData: {
            amount: 20,
        },
    },
];

export function drawRandomCard(
    cards: GameCard[],
): GameCard {
    const randomIndex = Math.floor(
        Math.random() * cards.length,
    );

    return cards[randomIndex];
}