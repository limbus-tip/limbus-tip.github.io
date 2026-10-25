// ============================================================
// LIMBUS COMPANY 인격 도감
// script.js
// ============================================================


// ============================================================
// DOM 요소
// ============================================================

const identityGrid = document.getElementById("identityGrid");

const searchInput = document.getElementById("searchInput");

const seasonFilter = document.getElementById("seasonFilter");
const sinnerFilter = document.getElementById("sinnerFilter");
const gradeFilter = document.getElementById("gradeFilter");
const typeFilter = document.getElementById("typeFilter");
const sinFilter = document.getElementById("sinFilter");

const seasonTitle = document.getElementById("seasonTitle");
const noResult = document.getElementById("noResult");

const detailModal = document.getElementById("detailModal");
const identityDetail = document.getElementById("identityDetail");
const closeModal = document.getElementById("closeModal");


// ============================================================
// 별 표시
// ============================================================

function getStars(grade) {
    return "★".repeat(Number(grade) || 0);
}


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
// 필터 설정 (수감자 목록을 데이터에서 자동 생성)
// ============================================================

function setupFilters() {

    if (!sinnerFilter) {
        return;
    }

    const sinners = [...new Set(
        identities
            .map(identity => identity.sinner)
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


// 인격이 가진 모든 죄악 (스킬 + 방어 스킬에서 자동 수집, 중복 제거)
function getIdentitySins(identity) {

    const sins = [];

    if (Array.isArray(identity.skills)) {
        identity.skills.forEach(skill => {
            if (skill && skill.sin) {
                sins.push(skill.sin);
            }
        });
    }

    if (identity.defenseSkill && identity.defenseSkill.sin) {
        sins.push(identity.defenseSkill.sin);
    }

    return [...new Set(sins)];
}


function createSinBadgeHTML(sin) {

    if (!sin) {
        return "";
    }

    return `
        <span class="sin-badge ${getSinClass(sin)}">${escapeHTML(sin)}</span>
    `;
}


// ============================================================
// 특이사항 (수비 스킬 발동 안 함, 피아식별 불가, 파괴 불가 코인 등)
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
// 이미지 HTML
// ============================================================

function createImageHTML(identity) {

    if (!identity.image) {
        return "";
    }

    const imageURL = escapeHTML(identity.image);
    const imageAlt = escapeHTML(identity.name || "인격 이미지");

    return `
        <div class="identity-image-container">
            <img
                class="identity-image"
                src="${imageURL}"
                alt="${imageAlt}"
                loading="lazy"
                onerror="this.parentElement.style.display='none';"
            >
        </div>
    `;
}


// ============================================================
// 인격 카드 생성
// ============================================================

function createCard(identity) {

    const card = document.createElement("div");

    card.className = "identity-card";

    const sinTags = getIdentitySins(identity)
        .map(sin => createSinBadgeHTML(sin))
        .join("");

    const tags = sinTags + (identity.keywords || [])
        .map(keyword => `<span class="tag">${escapeHTML(keyword)}</span>`)
        .join("");

    card.innerHTML = `
        ${createImageHTML(identity)}

        <div class="identity-season">${escapeHTML(identity.season)}</div>
        <div class="identity-sinner">${escapeHTML(identity.sinner)}</div>
        <div class="identity-name">${escapeHTML(identity.name)}</div>
        <div class="identity-grade">${getStars(identity.grade)}</div>
        <div class="identity-tags">${tags}</div>
    `;

    card.addEventListener("click", () => {
        openDetail(identity);
    });

    return card;
}


// ============================================================
// 검색용 문자열 만들기
// ============================================================

function createSearchText(identity) {

    const searchParts = [];

    searchParts.push(identity.season);
    searchParts.push(identity.sinner);
    searchParts.push(identity.name);

    if (Array.isArray(identity.attackTypes)) {
        searchParts.push(...identity.attackTypes);
    }

    if (Array.isArray(identity.keywords)) {
        searchParts.push(...identity.keywords);
    }

    if (Array.isArray(identity.skills)) {

        identity.skills.forEach(skill => {

            if (!skill) {
                return;
            }

            searchParts.push(skill.name);
            searchParts.push(skill.type);
            searchParts.push(skill.sin);
            searchParts.push(...normalizeNotes(skill.notes));
            searchParts.push(skill.description);
            searchParts.push(skill.basePower);
            searchParts.push(skill.coinCount);

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
    }

    if (identity.defenseSkill) {
        searchParts.push(identity.defenseSkill.name);
        searchParts.push(identity.defenseSkill.type);
        searchParts.push(identity.defenseSkill.sin);
        searchParts.push(...normalizeNotes(identity.defenseSkill.notes));
        searchParts.push(identity.defenseSkill.description);
        searchParts.push(identity.defenseSkill.basePower);
    }

    searchParts.push(identity.passive);
    searchParts.push(identity.supportPassive);
    searchParts.push(...normalizeNotes(identity.notes));

    return searchParts
        .filter(value => value !== null && value !== undefined)
        .join(" ")
        .toLowerCase();
}


// ============================================================
// 인격 필터링
// ============================================================

function filterIdentities() {

    const searchValue = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const selectedSeason = seasonFilter ? seasonFilter.value : "all";
    const selectedSinner = sinnerFilter ? sinnerFilter.value : "all";
    const selectedGrade = gradeFilter ? gradeFilter.value : "all";
    const selectedType = typeFilter ? typeFilter.value : "all";
    const selectedSin = sinFilter ? sinFilter.value : "all";

    return identities.filter(identity => {

        if (selectedSeason !== "all" && identity.season !== selectedSeason) {
            return false;
        }

        if (selectedSinner !== "all" && identity.sinner !== selectedSinner) {
            return false;
        }

        if (selectedGrade !== "all" && String(identity.grade) !== String(selectedGrade)) {
            return false;
        }

        if (selectedType !== "all") {
            const attackTypes = identity.attackTypes || [];

            if (!attackTypes.includes(selectedType)) {
                return false;
            }
        }

        if (selectedSin !== "all") {
            if (!getIdentitySins(identity).includes(selectedSin)) {
                return false;
            }
        }

        if (searchValue !== "") {
            if (!createSearchText(identity).includes(searchValue)) {
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
        selectedSeason === "all" ? "전체 인격" : selectedSeason;
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
// 인격 목록 출력
// ============================================================

function renderIdentities() {

    if (!identityGrid) {
        return;
    }

    const filteredIdentities = filterIdentities();

    identityGrid.innerHTML = "";

    updateSeasonTitle();

    if (filteredIdentities.length === 0) {
        setNoResultVisible(true);
        return;
    }

    setNoResultVisible(false);

    filteredIdentities.forEach(identity => {
        identityGrid.appendChild(createCard(identity));
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
// 스킬 HTML
// ============================================================

function createSkillHTML(skill, index) {

    if (!skill) {
        return "";
    }

    const skillName = skill.name || `스킬 ${index + 1}`;
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
                <div class="skill-number">스킬 ${index + 1}</div>
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
// 방어 스킬 HTML
// ============================================================

function createDefenseHTML(defenseSkill) {

    if (!defenseSkill) {
        return "";
    }

    const name = defenseSkill.name || "방어";
    const type = defenseSkill.type || "방어";
    const basePower =
        defenseSkill.basePower !== undefined ? defenseSkill.basePower : "-";
    const description = defenseSkill.description || "";

    return `
        <div class="detail-section">

            <h3>방어 스킬</h3>

            <div class="defense-skill">

                <div class="defense-header">
                    <span class="skill-type defense">${escapeHTML(type)}</span>
                    ${createSinBadgeHTML(defenseSkill.sin)}
                    <strong>${escapeHTML(name)}</strong>
                </div>

                <div class="defense-power">
                    기본 위력 ${escapeHTML(basePower)}
                </div>

                ${description
                    ? `<div class="defense-description">${escapeHTML(description)}</div>`
                    : ""}

                ${createNotesHTML(defenseSkill.notes)}

            </div>

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
// 상세창 이미지
// ============================================================

function createDetailImageHTML(identity) {

    if (!identity.image) {
        return "";
    }

    return `
        <div class="detail-image-container">
            <img
                class="detail-image"
                src="${escapeHTML(identity.image)}"
                alt="${escapeHTML(identity.name || "인격 이미지")}"
                loading="lazy"
                onerror="this.parentElement.style.display='none';"
            >
        </div>
    `;
}


// ============================================================
// 상세창 열기
// ============================================================

function openDetail(identity) {

    if (!detailModal || !identityDetail) {
        return;
    }

    const imageHTML = createDetailImageHTML(identity);
    const keywordsHTML = createKeywordHTML(identity.keywords);

    const attackTypesHTML =
        Array.isArray(identity.attackTypes)
            ? identity.attackTypes
                .map(type => `
                    <span class="skill-type ${getAttackTypeClass(type)}">
                        ${escapeHTML(type)}
                    </span>
                `)
                .join("")
            : "";

    const sinsHTML = getIdentitySins(identity)
        .map(sin => createSinBadgeHTML(sin))
        .join("");

    let skillsHTML = "";

    if (Array.isArray(identity.skills) && identity.skills.length > 0) {

        skillsHTML = identity.skills
            .map((skill, index) => createSkillHTML(skill, index))
            .join("");

    } else {

        skillsHTML = `
            <div class="empty-detail">등록된 스킬 정보가 없습니다.</div>
        `;
    }

    const defenseHTML = createDefenseHTML(identity.defenseSkill);

    const passiveHTML = identity.passive
        ? `
            <div class="detail-section">
                <h3>패시브</h3>
                <div class="passive-box">${escapeHTML(identity.passive)}</div>
            </div>
        `
        : "";

    const supportPassiveHTML = identity.supportPassive
        ? `
            <div class="detail-section">
                <h3>서포트 패시브</h3>
                <div class="passive-box">${escapeHTML(identity.supportPassive)}</div>
            </div>
        `
        : "";

    identityDetail.innerHTML = `

        ${imageHTML}

        <div class="detail-header">
            <div class="detail-season">${escapeHTML(identity.season)}</div>
            <div class="detail-sinner">${escapeHTML(identity.sinner)}</div>
            <h2 class="detail-name">${escapeHTML(identity.name)}</h2>
            <div class="detail-grade">${getStars(identity.grade)}</div>
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

        ${normalizeNotes(identity.notes).length > 0
            ? `
                <div class="detail-section">
                    <h3>특이사항</h3>
                    ${createNotesHTML(identity.notes)}
                </div>
            `
            : ""}

        <div class="detail-section">
            <h3>스킬</h3>
            <div class="skills">${skillsHTML}</div>
        </div>

        ${defenseHTML}
        ${passiveHTML}
        ${supportPassiveHTML}

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
    searchInput.addEventListener("input", renderIdentities);
}

if (seasonFilter) {
    seasonFilter.addEventListener("change", renderIdentities);
}

if (sinnerFilter) {
    sinnerFilter.addEventListener("change", renderIdentities);
}

if (gradeFilter) {
    gradeFilter.addEventListener("change", renderIdentities);
}

if (typeFilter) {
    typeFilter.addEventListener("change", renderIdentities);
}

if (sinFilter) {
    sinFilter.addEventListener("change", renderIdentities);
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

renderIdentities();
