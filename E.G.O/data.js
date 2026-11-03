// ============================================================
// E.G.O 데이터
// E.G.O를 추가하려면 아래 객체 하나를 복사해서 배열에 이어 붙이면 됩니다.
//
// - image: 이미지가 없으면 이 줄을 통째로 지워도 됩니다.
// - grade: "ZAYIN" / "TETH" / "HE" / "WAW" / "ALEPH" 중 하나
// - awakening: 각성 스킬 (필수)
// - corrosion: 침식 스킬 (없으면 이 항목을 통째로 지워도 됩니다)
// - 스킬 안의 type: "참격" / "관통" / "타격"
// - 스킬 안의 sin(죄악): "분노" "색욕" "나태" "탐식" "우울" "오만" "질투"
// - cost: 자원 소모량. 예) cost: { "분노": 3, "오만": 2 }
// - sanityCost: 정신력 소모량 (숫자)
// - notes(특이사항): 문구 목록. 예) notes: ["수비 스킬 발동 안 함", "파괴 불가 코인"]
//   스킬 안에 넣으면 해당 스킬 칸에, E.G.O 맨 바깥에 넣으면 "특이사항" 칸에 표시됩니다.
// - 아래 항목들은 모두 "예시 데이터"입니다. 실제 내용으로 바꿔서 사용하세요.
// - E.G.O의 죄악 목록과 공격 유형, 죄악 필터는 스킬과 cost 값에서 자동으로 만들어집니다.
//   (attackTypes를 직접 적으면 그 값을 우선 사용합니다)
// ============================================================

const egos = [

    {
        season: "시즌 1",
        sinner: "이상",
        name: "예시 E.G.O 1",

        // 이미지가 없으면 이 줄을 아예 빼도 됨
        image: "",

        grade: "WAW",
        keywords: ["키워드 예시"],

        awakening: {
            name: "각성 스킬 이름",
            type: "참격",
            sin: "분노",
            cost: { "분노": 3 },
            sanityCost: 20,
            basePower: 6,
            coinCount: 3,
            coins: [
                {
                    power: 4,
                    effect: "[적중시] 효과 예시"
                },
                {
                    power: 4,
                    effect: ""
                },
                {
                    power: 5,
                    effect: "[적중시] 효과 예시"
                }
            ],
            notes: ["특이사항 예시"],
            description: "각성 스킬 설명"
        },

        corrosion: {
            name: "침식 스킬 이름",
            type: "참격",
            sin: "분노",
            cost: { "분노": 3 },
            sanityCost: 20,
            basePower: 8,
            coinCount: 3,
            coins: [
                {
                    power: 5,
                    effect: "[적중시] 효과 예시"
                },
                {
                    power: 5,
                    effect: ""
                },
                {
                    power: 6,
                    effect: "[적중시] 효과 예시"
                }
            ],
            description: "침식 스킬 설명"
        },

        passive: "E.G.O 패시브 설명"
    },

    {
        season: "Standard Fare",
        sinner: "파우스트",
        name: "예시 E.G.O 2",

        grade: "ZAYIN",
        keywords: ["키워드 없음"],

        awakening: {
            name: "각성 스킬 이름",
            type: "타격",
            sin: "오만",
            cost: { "오만": 2 },
            sanityCost: 10,
            basePower: 4,
            coinCount: 1,
            coins: [
                {
                    power: 7,
                    effect: "진동 1 부여"
                }
            ],
            description: "각성 스킬 설명"
        },

        passive: "E.G.O 패시브 설명"
    }

];
