// ============================================================
// LIMBUS COMPANY E.G.O 도감
// script.js  (인격 도감 Identity/script.js 와 같은 구조)
// ============================================================

// ============================================================
// DOM 요소
// ============================================================

const egoGrid = document.getElementById("egoGrid");

const searchInput = document.getElementById("searchInput");
const seasonFilter = document.getElementById("seasonFilter");
const sinnerFilter = document.getElementById("sinnerFilter");
const gradeFilter = document.getElementById("gradeFilter");
const typeFilter = document.getElementById("typeFilter");
const sinFilter = document.getElementById("sinFilter");

const seasonTitle = document.getElementById("seasonTitle");
const noResult = document.getElementById("noResult");

const detailModal = document.getElementById("detailModal");
const egoDetail = document.getElementById("egoDetail");
const closeModal = document.getElementById("closeModal");

// ============================================================
// 스킬 종류 (각성 / 침식)
// ============================================================

const SKILL_KINDS = [
    { key: "awakening", label: "각성 스킬" },
    { key: "corrosion", label: "침식 스킬" }
];

// ============================================================
// HTML 특수문자 처리
// ============================================================

function escapeHTML(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ============================================================
// 등급 (ZAYIN, TETH, HE, WAW, ALEPH)
// ============================================================

function getGradeText(grade) {
    return String(grade || "").toUpperCase();
}

function getGradeClass(grade) {
    switch (getGradeText(grade)) {
        case "ZAYIN":
            return "zayin";
        case "TETH":
            return "teth";
        case "HE":
            return "he";
        case "WAW":
            return "waw";
        case "ALEPH":
            return "aleph";
        default:
            return "";
    }
}

function createGradeHTML(grade) {
    const text = getGradeText(grade);

    if (!text) {
        return "";
    }

    return `<span class="grade-badge ${getGradeClass(grade)}">${escapeHTML(text)}</span>`;
}

// ============================================================
// 죄악 (분노, 색욕, 나태, 탐식, 우울, 오만, 질투)
// ============================================================

function getSinClass(sin) {
    switch (sin) {
        case "분노":
            return "wrath";
        case "색욕":
            return "lust";
        case "나태":
            return "sloth";
        case "탐식":
            return "gluttony";
        case "우울":
            return "gloom";
        case "오만":
            return "pride";
        case "질투":
            return "envy";
        default:
            return "";
    }
}

function createSinBadgeHTML(sin, amount) {
    if (!sin) {
        return "";
    }

    const amountText =
        amount !== undefined && amount !== null && amount !== ""
            ? ` ×${escapeHTML(amount)}`
            : "";

    return `<span class="sin-badge ${getSinClass(sin)}">${escapeHTML(sin)}${amountText}</span>`;
}

// ============================================================
// 스킬 모으기 (각성 + 침식)
// ============================================================

function getEgoSkills(ego) {
    const skills = [];

    SKILL_KINDS.forEach(kind => {
        if (ego[kind.key]) {
            skills.push(ego[kind.key]);
        }
    });

    return skills;
}

// E.G.O가 가진 모든 죄악 (스킬의 sin + 자원 소모 cost에서 자동 수집, 중복 제거)
function getEgoSins(ego) {
    const sins = [];

    getEgoSkills(ego).forEach(skill => {
        if (skill.sin) {
            sins.push(skill.sin);
        }

        if (skill.cost && typeof skill.cost === "object") {
            Object.keys(skill.cost).forEach(sin => sins.push(sin));
        }
    });

    return [...new Set(sins)];
}

// E.G.O가 가진 공격 유형 (attackTypes를 직접 적었으면 그 값, 아니면 스킬 type에서 수집)
function getEgoAttackTypes(ego) {
    if (Array.isArray(ego.attackTypes) && ego.attackTypes.length > 0) {
        return ego.attackTypes;
    }

    const types = getEgoSkills(ego)
        .map(skill => skill.type)
        .filter(Boolean);

    return [...new Set(types)];
}

// ============================================================
// 특이사항
// notes: ["문구1", "문구2"] 또는 "문구" 하나만 적어도 된다.
// ============================================================

function normalizeNotes(notes) {
    if (Array.isArray(notes)) {
        return notes.filter(Boolean);
    }

    if (notes) {
        return [notes];
    }

    return [];
}

function createNotesHTML(notes) {
    const list = normalizeNotes(notes);

    if (list.length === 0) {
        return "";
    }

    return `
        <div class="skill-notes">
            ${list
                .map(note => `<span class="note-chip">${escapeHTML(note)}</span>`)
                .join("")}
        </div>
    `;
}

// ============================================================
// 필터 설정 (수감자 목록을 데이터에서 자동 생성)
// ============================================================

function setupFilters() {
    if (!sinnerFilter) {
        return;
    }

    const sinners = [...new Set(
        egos
            .map(ego => ego.sinner)
            .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, "ko"));

    sinnerFilter.innerHTML = "";

    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "모든 수감자";
    sinnerFilter.appendChild(allOption);

    sinners.forEach(sinner => {
        const option = document.createElement("option");
        option.value = sinner;
        option.textContent = sinner;
        sinnerFilter.appendChild(option);
    });
}

// ============================================================
// 이미지 HTML
// ============================================================

function createImageHTML(ego) {
    if (!ego.image) {
        return "";
    }

    return `
        <div class="ego-image-container">
            <img
                class="ego-image"
                src="${escapeHTML(ego.image)}"
                alt="${escapeHTML(ego.name || "E.G.O 이미지")}"
                loading="lazy"
                onerror="this.parentElement.style.display='none';"
            >
        </div>
    `;
}

function createDetailImageHTML(ego) {
    if (!ego.image) {
        return "";
    }

    return `
        <div class="detail-image-container">
            <img
                class="detail-image"
                src="${escapeHTML(ego.image)}"
                alt="${escapeHTML(ego.name || "E.G.O 이미지")}"
                loading="lazy"
                onerror="this.parentElement.style.display='none';"
            >
        </div>
    `;
}

// ============================================================
// E.G.O 카드 생성
// ============================================================

function createCard(ego) {
    const card = document.createElement("div");
    card.className = "ego-card";

    const sinTags = getEgoSins(ego)
        .map(sin => createSinBadgeHTML(sin))
        .join("");

    const tags = sinTags + (ego.keywords || [])
        .map(keyword => `<span class="tag">${escapeHTML(keyword)}</span>`)
        .join("");

    card.innerHTML = `
        ${createImageHTML(ego)}

        <div class="ego-season">${escapeHTML(ego.season)}</div>
        <div class="ego-sinner">${escapeHTML(ego.sinner)}</div>
        <div class="ego-name">${escapeHTML(ego.name)}</div>
        <div class="ego-grade">${createGradeHTML(ego.grade)}</div>
        <div class="ego-tags">${tags}</div>
    `;

    card.addEventListener("click", () => {
        openDetail(ego);
    });

    return card;
}

// ============================================================
// 검색용 문자열 만들기
// ============================================================

function createSearchText(ego) {
    const searchParts = [];

    searchParts.push(ego.season);
    searchParts.push(ego.sinner);
    searchParts.push(ego.name);
    searchParts.push(getGradeText(ego.grade));

    searchParts.push(...getEgoAttackTypes(ego));

    if (Array.isArray(ego.keywords)) {
        searchParts.push(...ego.keywords);
    }

    getEgoSkills(ego).forEach(skill => {
        searchParts.push(skill.name);
        searchParts.push(skill.type);
        searchParts.push(skill.sin);
        searchParts.push(...normalizeNotes(skill.notes));
        searchParts.push(skill.description);
        searchParts.push(skill.basePower);
        searchParts.push(skill.coinCount);
        searchParts.push(skill.sanityCost);

        if (skill.cost && typeof skill.cost === "object") {
            Object.keys(skill.cost).forEach(sin => {
                searchParts.push(sin);
            });
        }

        if (Array.isArray(skill.coins)) {
            skill.coins.forEach(coin => {
                if (!coin) {
                    return;
                }

                searchParts.push(coin.power);
                searchParts.push(coin.effect);
            });
        }
    });

    searchParts.push(ego.passive);
    searchParts.push(...normalizeNotes(ego.notes));

    return searchParts
        .filter(value => value !== null && value !== undefined)
        .join(" ")
        .toLowerCase();
}

// ============================================================
// E.G.O 필터링
// ============================================================

function filterEgos() {
    const searchValue = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const selectedSeason = seasonFilter ? seasonFilter.value : "all";
    const selectedSinner = sinnerFilter ? sinnerFilter.value : "all";
    const selectedGrade = gradeFilter ? gradeFilter.value : "all";
    const selectedType = typeFilter ? typeFilter.value : "all";
    const selectedSin = sinFilter ? sinFilter.value : "all";

    return egos.filter(ego => {

        if (selectedSeason !== "all" && ego.season !== selectedSeason) {
            return false;
        }

        if (selectedSinner !== "all" && ego.sinner !== selectedSinner) {
            return false;
        }

        if (selectedGrade !== "all" && getGradeText(ego.grade) !== selectedGrade) {
            return false;
        }

        if (selectedType !== "all") {
            if (!getEgoAttackTypes(ego).includes(selectedType)) {
                return false;
            }
        }

        if (selectedSin !== "all") {
            if (!getEgoSins(ego).includes(selectedSin)) {
                return false;
            }
        }

        if (searchValue !== "") {
            if (!createSearchText(ego).includes(searchValue)) {
                return false;
            }
        }

        return true;
    });
}

// ============================================================
// 시즌 제목
// ============================================================

function updateSeasonTitle() {
    if (!seasonTitle) {
        return;
    }

    const selectedSeason = seasonFilter ? seasonFilter.value : "all";

    seasonTitle.textContent =
        selectedSeason === "all" ? "전체 E.G.O" : selectedSeason;
}

// ============================================================
// 결과 없음 표시
// ============================================================

function setNoResultVisible(visible) {
    if (!noResult) {
        return;
    }

    // hidden 클래스는 display:none !important 이므로
    // style.display 대신 클래스를 넣고 빼야 한다.
    if (visible) {
        noResult.classList.remove("hidden");
    } else {
        noResult.classList.add("hidden");
    }
}

// ============================================================
// E.G.O 목록 출력
// ============================================================

function renderEgos() {
    if (!egoGrid) {
        return;
    }

    const filteredEgos = filterEgos();

    egoGrid.innerHTML = "";

    updateSeasonTitle();

    if (filteredEgos.length === 0) {
        setNoResultVisible(true);
        return;
    }

    setNoResultVisible(false);

    filteredEgos.forEach(ego => {
        egoGrid.appendChild(createCard(ego));
    });
}

// ============================================================
// 공격 타입 클래스
// ============================================================

function getAttackTypeClass(type) {
    switch (type) {
        case "참격":
            return "slash";
        case "관통":
            return "pierce";
        case "타격":
            return "blunt";
        case "방어":
            return "defense";
        default:
            return "";
    }
}

// ============================================================
// 코인 HTML
// ============================================================

function createCoinHTML(coins) {
    if (!Array.isArray(coins) || coins.length === 0) {
        return "";
    }

    return coins.map((coin, index) => {
        if (!coin) {
            return "";
        }

        const power = coin.power !== undefined ? coin.power : "-";
        const effect = coin.effect ? coin.effect : "효과 없음";

        return `
            <div class="coin">
                <div class="coin-number">코인 ${index + 1}</div>
                <div class="coin-power">+${escapeHTML(power)}</div>
                <div class="coin-effect">${escapeHTML(effect)}</div>
            </div>
        `;
    }).join("");
}

// ============================================================
// 자원 소모 HTML (cost: { "분노": 3 }, sanityCost: 20)
// ============================================================

function createCostHTML(skill) {
    const parts = [];

    if (skill.cost && typeof skill.cost === "object") {
        Object.entries(skill.cost).forEach(([sin, amount]) => {
            parts.push(createSinBadgeHTML(sin, amount));
        });
    }

    if (skill.sanityCost !== undefined && skill.sanityCost !== null && skill.sanityCost !== "") {
        parts.push(`<span class="cost-chip">정신력 -${escapeHTML(skill.sanityCost)}</span>`);
    }

    if (parts.length === 0) {
        return "";
    }

    return `
        <div class="skill-cost">
            <span class="skill-cost-title">소모</span>
            ${parts.join("")}
        </div>
    `;
}

// ============================================================
// 스킬 HTML (각성 / 침식)
// ============================================================

function createSkillHTML(skill, label) {
    if (!skill) {
        return "";
    }

    const skillName = skill.name || label;
    const skillType = skill.type || "";

    const basePower = skill.basePower !== undefined ? skill.basePower : "-";

    const coinCount =
        skill.coinCount !== undefined
            ? skill.coinCount
            : (Array.isArray(skill.coins) ? skill.coins.length : 0);

    const description = skill.description || "";
    const attackClass = getAttackTypeClass(skillType);
    const coinsHTML = createCoinHTML(skill.coins);

    return `
        <div class="detail-skill">

            <div class="skill-header">
                <div class="skill-number">${escapeHTML(label)}</div>
                <div class="skill-name">${escapeHTML(skillName)}</div>
            </div>

            <div class="skill-info">
                ${skillType
                    ? `<span class="skill-type ${attackClass}">${escapeHTML(skillType)}</span>`
                    : ""}
                ${createSinBadgeHTML(skill.sin)}
                <span>기본 위력 ${escapeHTML(basePower)}</span>
                <span>코인 ${escapeHTML(coinCount)}</span>
            </div>

            ${createCostHTML(skill)}

            ${description
                ? `<div class="skill-description">${escapeHTML(description)}</div>`
                : ""}

            ${createNotesHTML(skill.notes)}

            ${coinsHTML
                ? `
                    <div class="coins-title">코인 효과</div>
                    <div class="coins">${coinsHTML}</div>
                `
                : ""}

        </div>
    `;
}

// ============================================================
// 키워드 HTML
// ============================================================

function createKeywordHTML(keywords) {
    if (!Array.isArray(keywords) || keywords.length === 0) {
        return "";
    }

    return `
        <div class="detail-keywords">
            ${keywords
                .map(keyword => `<span class="tag">${escapeHTML(keyword)}</span>`)
                .join("")}
        </div>
    `;
}

// ============================================================
// 상세창 열기
// ============================================================

function openDetail(ego) {
    if (!detailModal || !egoDetail) {
        return;
    }

    const imageHTML = createDetailImageHTML(ego);
    const keywordsHTML = createKeywordHTML(ego.keywords);

    const attackTypesHTML = getEgoAttackTypes(ego)
        .map(type => `
            <span class="skill-type ${getAttackTypeClass(type)}">
                ${escapeHTML(type)}
            </span>
        `)
        .join("");

    const sinsHTML = getEgoSins(ego)
        .map(sin => createSinBadgeHTML(sin))
        .join("");

    const skillsHTML = SKILL_KINDS
        .filter(kind => ego[kind.key])
        .map(kind => createSkillHTML(ego[kind.key], kind.label))
        .join("");

    const passiveHTML = ego.passive
        ? `
            <div class="detail-section">
                <h3>패시브</h3>
                <div class="passive-box">${escapeHTML(ego.passive)}</div>
            </div>
        `
        : "";

    egoDetail.innerHTML = `

        ${imageHTML}

        <div class="detail-header">
            <div class="detail-season">${escapeHTML(ego.season)}</div>
            <div class="detail-sinner">${escapeHTML(ego.sinner)}</div>
            <h2 class="detail-name">${escapeHTML(ego.name)}</h2>
            <div class="detail-grade">${createGradeHTML(ego.grade)}</div>
        </div>

        ${keywordsHTML
            ? `
                <div class="detail-section">
                    <h3>키워드</h3>
                    ${keywordsHTML}
                </div>
            `
            : ""}

        ${attackTypesHTML
            ? `
                <div class="detail-section">
                    <h3>공격 타입</h3>
                    <div class="detail-attack-types">${attackTypesHTML}</div>
                </div>
            `
            : ""}

        ${sinsHTML
            ? `
                <div class="detail-section">
                    <h3>죄악</h3>
                    <div class="detail-sins">${sinsHTML}</div>
                </div>
            `
            : ""}

        ${normalizeNotes(ego.notes).length > 0
            ? `
                <div class="detail-section">
                    <h3>특이사항</h3>
                    ${createNotesHTML(ego.notes)}
                </div>
            `
            : ""}

        <div class="detail-section">
            <h3>스킬</h3>
            <div class="skills">
                ${skillsHTML || `<div class="empty-detail">등록된 스킬 정보가 없습니다.</div>`}
            </div>
        </div>

        ${passiveHTML}

    `;

    // 스크롤 위치를 맨 위로
    const content = detailModal.querySelector(".modal-content");

    if (content) {
        content.scrollTop = 0;
    }

    // hidden 클래스를 빼야 모달이 보인다.
    detailModal.classList.remove("hidden");
    document.body.classList.add("modal-open");
}

// ============================================================
// 상세창 닫기
// ============================================================

function closeDetail() {
    if (!detailModal) {
        return;
    }

    detailModal.classList.add("hidden");
    document.body.classList.remove("modal-open");
}

// ============================================================
// 이벤트
// ============================================================

if (searchInput) {
    searchInput.addEventListener("input", renderEgos);
}

if (seasonFilter) {
    seasonFilter.addEventListener("change", renderEgos);
}

if (sinnerFilter) {
    sinnerFilter.addEventListener("change", renderEgos);
}

if (gradeFilter) {
    gradeFilter.addEventListener("change", renderEgos);
}

if (typeFilter) {
    typeFilter.addEventListener("change", renderEgos);
}

if (sinFilter) {
    sinFilter.addEventListener("change", renderEgos);
}

if (closeModal) {
    closeModal.addEventListener("click", closeDetail);
}

// 모달 바깥(어두운 배경) 클릭
// 배경은 .modal-background 요소가 덮고 있어서
// event.target이 detailModal 자신이 아니라 배경 요소가 된다.
if (detailModal) {
    detailModal.addEventListener("click", event => {
        if (
            event.target === detailModal ||
            event.target.classList.contains("modal-background")
        ) {
            closeDetail();
        }
    });
}

// ESC 키
document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        if (detailModal && !detailModal.classList.contains("hidden")) {
            closeDetail();
        }
    }
});

// ============================================================
// 초기 실행
// ============================================================

setupFilters();
renderEgos();
