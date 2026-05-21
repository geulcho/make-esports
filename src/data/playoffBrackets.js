// ====================================================================
// 플레이오프 브라켓 정의 (4가지 유형)
// ====================================================================
// format: Bo1 | Bo2_ADV | Bo3 | Bo5
// seedA / seedB: 숫자 = 순위 시드, "W3" / "E5" = 컨퍼런스 시드, "D3" / "P2" = 디비전 시드
//               "1-2.winner" / "2-1.loser" = 이전 매치 결과 참조
// advantage: "A" = teamA에게 1매치 어드밴티지, null = 없음
// mdSchedule: 해당 매치의 개별 게임이 배정된 매치데이 배열

// ========== 북미 리그 (L_NA) — 16팀 ==========
export const BRACKET_NA = [
  // Round 1: 8 matches, Bo2 with advantage to higher seed
  { id: "1-1", round: 1, label: "1라운드 1경기", seedA: "W1", seedB: "W8", advantage: "A", format: "Bo2_ADV", mdSchedule: [1, 2] },
  { id: "1-2", round: 1, label: "1라운드 2경기", seedA: "W2", seedB: "W7", advantage: "A", format: "Bo2_ADV", mdSchedule: [1, 2] },
  { id: "1-3", round: 1, label: "1라운드 3경기", seedA: "W3", seedB: "W6", advantage: "A", format: "Bo2_ADV", mdSchedule: [1, 2] },
  { id: "1-4", round: 1, label: "1라운드 4경기", seedA: "W4", seedB: "W5", advantage: "A", format: "Bo2_ADV", mdSchedule: [1, 2] },
  { id: "1-5", round: 1, label: "1라운드 5경기", seedA: "E1", seedB: "E8", advantage: "A", format: "Bo2_ADV", mdSchedule: [1, 2] },
  { id: "1-6", round: 1, label: "1라운드 6경기", seedA: "E2", seedB: "E7", advantage: "A", format: "Bo2_ADV", mdSchedule: [1, 2] },
  { id: "1-7", round: 1, label: "1라운드 7경기", seedA: "E3", seedB: "E6", advantage: "A", format: "Bo2_ADV", mdSchedule: [1, 2] },
  { id: "1-8", round: 1, label: "1라운드 8경기", seedA: "E4", seedB: "E5", advantage: "A", format: "Bo2_ADV", mdSchedule: [1, 2] },
  // Round 2: 4 matches, Bo3
  { id: "2-1", round: 2, label: "2라운드 1경기", seedA: "1-1.winner", seedB: "1-4.winner", format: "Bo3", mdSchedule: [4, 5, 6] },
  { id: "2-2", round: 2, label: "2라운드 2경기", seedA: "1-2.winner", seedB: "1-3.winner", format: "Bo3", mdSchedule: [4, 5, 6] },
  { id: "2-3", round: 2, label: "2라운드 3경기", seedA: "1-5.winner", seedB: "1-8.winner", format: "Bo3", mdSchedule: [4, 5, 6] },
  { id: "2-4", round: 2, label: "2라운드 4경기", seedA: "1-6.winner", seedB: "1-7.winner", format: "Bo3", mdSchedule: [4, 5, 6] },
  // Round 3: 2 matches, Bo3 (Conference Finals)
  { id: "3-1", round: 3, label: "3라운드 (서부결승)", seedA: "2-1.winner", seedB: "2-2.winner", format: "Bo3", mdSchedule: [8, 9, 10] },
  { id: "3-2", round: 3, label: "3라운드 (동부결승)", seedA: "2-3.winner", seedB: "2-4.winner", format: "Bo3", mdSchedule: [8, 9, 10] },
  // Round 4: Grand Final, Bo5
  { id: "4-1", round: 4, label: "결승", seedA: "3-1.winner", seedB: "3-2.winner", format: "Bo5", mdSchedule: [12, 13, 14, 15, 16] },
];

// ========== 중국 리그 (L_CN) — 10팀 ==========
export const BRACKET_CN = [
  // Round 1: 2 matches (intra-division 4v5), Bo1
  { id: "1-1", round: 1, label: "1라운드 1경기", seedA: "D4", seedB: "D5", format: "Bo1", mdSchedule: [1] },
  { id: "1-2", round: 1, label: "1라운드 2경기", seedA: "P4", seedB: "P5", format: "Bo1", mdSchedule: [1] },
  // Round 2: 4 matches (cross-division), Bo3
  { id: "2-1", round: 2, label: "2라운드 1경기", seedA: "D1", seedB: "1-2.winner", format: "Bo3", mdSchedule: [3, 4, 5] },
  { id: "2-2", round: 2, label: "2라운드 2경기", seedA: "P1", seedB: "1-1.winner", format: "Bo3", mdSchedule: [3, 4, 5] },
  { id: "2-3", round: 2, label: "2라운드 3경기", seedA: "D2", seedB: "P3", format: "Bo3", mdSchedule: [3, 4, 5] },
  { id: "2-4", round: 2, label: "2라운드 4경기", seedA: "P2", seedB: "D3", format: "Bo3", mdSchedule: [3, 4, 5] },
  // Round 3: 2 matches, Bo3
  { id: "3-1", round: 3, label: "3라운드 1경기", seedA: "2-1.winner", seedB: "2-4.winner", format: "Bo3", mdSchedule: [8, 9, 10] },
  { id: "3-2", round: 3, label: "3라운드 2경기", seedA: "2-2.winner", seedB: "2-3.winner", format: "Bo3", mdSchedule: [8, 9, 10] },
  // Round 4: Grand Final, Bo5
  { id: "4-1", round: 4, label: "결승", seedA: "3-1.winner", seedB: "3-2.winner", format: "Bo5", mdSchedule: [12, 13, 14, 15, 16] },
];

// ========== 8/10팀 리그 — 6팀 진출 ==========
export const BRACKET_SMALL = [
  // Round 1: 2 matches, Bo5_Single
  { id: "1-1", round: 1, label: "1라운드 1경기", seedA: 3, seedB: 6, format: "Bo5_Single", mdSchedule: [3] },
  { id: "1-2", round: 1, label: "1라운드 2경기", seedA: 4, seedB: 5, format: "Bo5_Single", mdSchedule: [4] },
  // Round 2: 2 matches, Bo5_Single (top seeds enter)
  { id: "2-1", round: 2, label: "2라운드 1경기", seedA: 1, seedB: "1-2.winner", format: "Bo5_Single", mdSchedule: [6] },
  { id: "2-2", round: 2, label: "2라운드 2경기", seedA: 2, seedB: "1-1.winner", format: "Bo5_Single", mdSchedule: [7] },
  // Round 3: 2 matches, Bo5_Single (winners bracket final + elimination)
  { id: "3-1", round: 3, label: "3라운드 1경기 (승자전)", seedA: "2-1.winner", seedB: "2-2.winner", format: "Bo5_Single", mdSchedule: [9] },
  { id: "3-2", round: 3, label: "3라운드 2경기 (패자전)", seedA: "2-1.loser", seedB: "2-2.loser", format: "Bo5_Single", mdSchedule: [10] },
  // Round 4: 1 match, Bo5_Single (qualification match)
  { id: "4-1", round: 4, label: "4라운드 (재도전)", seedA: "3-1.loser", seedB: "3-2.winner", format: "Bo5_Single", mdSchedule: [14] },
  // Round 5: Grand Final, Bo5_Single
  { id: "5-1", round: 5, label: "결승", seedA: "3-1.winner", seedB: "4-1.winner", format: "Bo5_Single", mdSchedule: [15] },
];

// ========== 12팀 리그 — 8팀 진출 ==========
export const BRACKET_LARGE = [
  // Round 1: 4 matches, Bo5_Single
  { id: "1-1", round: 1, label: "1라운드 1경기", seedA: 1, seedB: 4, format: "Bo5_Single", mdSchedule: [2] },
  { id: "1-2", round: 1, label: "1라운드 2경기", seedA: 2, seedB: 3, format: "Bo5_Single", mdSchedule: [3] },
  { id: "1-3", round: 1, label: "1라운드 3경기", seedA: 5, seedB: 8, format: "Bo5_Single", mdSchedule: [4] },
  { id: "1-4", round: 1, label: "1라운드 4경기", seedA: 6, seedB: 7, format: "Bo5_Single", mdSchedule: [5] },
  // Round 2: 3 matches, Bo5_Single
  { id: "2-1", round: 2, label: "2라운드 1경기", seedA: "1-1.loser", seedB: "1-4.winner", format: "Bo5_Single", mdSchedule: [8] },
  { id: "2-2", round: 2, label: "2라운드 2경기", seedA: "1-2.loser", seedB: "1-3.winner", format: "Bo5_Single", mdSchedule: [9] },
  { id: "2-3", round: 2, label: "2라운드 3경기 (승자전)", seedA: "1-1.winner", seedB: "1-2.winner", format: "Bo5_Single", mdSchedule: [10] },
  // Round 3: 1 match, Bo5_Single
  { id: "3-1", round: 3, label: "3라운드 (패자전)", seedA: "2-1.winner", seedB: "2-2.winner", format: "Bo5_Single", mdSchedule: [13] },
  // Round 4: 1 match, Bo5_Single
  { id: "4-1", round: 4, label: "4라운드 (재도전)", seedA: "2-3.loser", seedB: "3-1.winner", format: "Bo5_Single", mdSchedule: [14] },
  // Round 5: Grand Final, Bo5_Single
  { id: "5-1", round: 5, label: "결승", seedA: "2-3.winner", seedB: "4-1.winner", format: "Bo5_Single", mdSchedule: [15] },
];

// ========== 리그 → 브라켓 매핑 ==========
export const getLeagueBracketType = (leagueId) => {
  if (leagueId === 'L_NA') return 'NA';
  if (leagueId === 'L_CN') return 'CN';
  // 12-team leagues
  if (['L_KR', 'L_NEU', 'L_WEU', 'L_SEA'].includes(leagueId)) return 'LARGE';
  // 8/10-team leagues
  return 'SMALL';
};

export const getBracketTemplate = (type) => {
  switch (type) {
    case 'NA': return BRACKET_NA;
    case 'CN': return BRACKET_CN;
    case 'LARGE': return BRACKET_LARGE;
    case 'SMALL': return BRACKET_SMALL;
    default: return BRACKET_SMALL;
  }
};
