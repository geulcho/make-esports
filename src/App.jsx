import React, { useState, useEffect } from 'react';
import { Calendar, ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import clubsData from './data/clubs_database.json';
import natData from './data/nat_database.json';

import { getRandomMeta, simulateSet, simulateBo1Match, simulateBo2AdvMatch, simulateBo3Match, simulateBo5Match, generateRoundRobinSchedule } from './utils/engine';
import { getLeagueBracketType, getBracketTemplate } from './data/playoffBrackets';

import GNB from './components/GNB';
import ClubView from './components/ClubView';
import NationalView from './components/NationalView';
import PlayoffView from './components/PlayoffView';
import RankingView from './components/RankingView';
import LeagueCoefficientsView from './components/LeagueCoefficientsView';
import InfoView from './components/InfoView';

const LEAGUES = [...new Set(clubsData.clubs.map(c => c.league_id))];

const PHASES = [
  { id: 0, name: "프리시즌 (대기)", type: "REST" },
  // ===== 오프닝 시즌 (8 페이즈) =====
  { id: 1, name: "P1: 오프닝 페이즈 1", type: "JUMP", matches: { 8: 2, 10: 2, 12: 2, 16: 2, 24: 4 } },
  { id: 2, name: "P2: 오프닝 페이즈 2", type: "JUMP", matches: { 8: 2, 10: 2, 12: 2, 16: 2, 24: 4 } },
  { id: 3, name: "P3: 오프닝 페이즈 3", type: "JUMP", matches: { 8: 2, 10: 2, 12: 3, 16: 3, 24: 4 } },
  { id: 4, name: "P4: 오프닝 페이즈 4", type: "JUMP", matches: { 8: 3, 10: 2, 12: 3, 16: 3, 24: 4 } },
  { id: 5, name: "P5: 인터매치 1 (국대)", type: "NAT_DETAILED", maxSubPhase: 7 },
  { id: 6, name: "P6: 오프닝 페이즈 5", type: "JUMP", matches: { 8: 3, 10: 2, 12: 3, 16: 3, 24: 4 } },
  { id: 7, name: "P7: 오프닝 페이즈 6", type: "JUMP", matches: { 8: 3, 10: 2, 12: 3, 16: 3, 24: 4 } },
  { id: 8, name: "P8: 오프닝 페이즈 7", type: "JUMP", matches: { 8: 3, 10: 3, 12: 3, 16: 3, 24: 5 } },
  { id: 9, name: "P9: 오프닝 페이즈 8", type: "JUMP", matches: { 8: 3, 10: 3, 12: 3, 16: 3, 24: 5 } },
  { id: 10, name: "P10: 오프닝 플레이오프", type: "PO_DETAILED", maxSubPhase: 16 },
  { id: 11, name: "P11: MSM (국제대회)", type: "DETAILED", archive: "오프닝 시즌" },
  // ===== 레귤러 시즌 (8 페이즈) =====
  { id: 12, name: "P12: 인터매치 2 (국대)", type: "NAT_DETAILED", maxSubPhase: 7 },
  { id: 13, name: "P13: 레귤러 페이즈 1", type: "JUMP", matches: { 8: 2, 10: 2, 12: 2, 16: 2, 24: 4 } },
  { id: 14, name: "P14: 레귤러 페이즈 2", type: "JUMP", matches: { 8: 2, 10: 2, 12: 2, 16: 2, 24: 4 } },
  { id: 15, name: "P15: 레귤러 페이즈 3", type: "JUMP", matches: { 8: 2, 10: 2, 12: 3, 16: 3, 24: 4 } },
  { id: 16, name: "P16: 레귤러 페이즈 4", type: "JUMP", matches: { 8: 3, 10: 2, 12: 3, 16: 3, 24: 4 } },
  { id: 17, name: "P17: 인터매치 3 (IQ)", type: "IQ_DETAILED", maxSubPhase: 5 },
  { id: 18, name: "P18: 레귤러 페이즈 5", type: "JUMP", matches: { 8: 3, 10: 2, 12: 3, 16: 3, 24: 4 } },
  { id: 19, name: "P19: 레귤러 페이즈 6", type: "JUMP", matches: { 8: 3, 10: 2, 12: 3, 16: 3, 24: 4 } },
  { id: 20, name: "P20: 레귤러 페이즈 7", type: "JUMP", matches: { 8: 3, 10: 3, 12: 3, 16: 3, 24: 5 } },
  { id: 21, name: "P21: 레귤러 페이즈 8", type: "JUMP", matches: { 8: 3, 10: 3, 12: 3, 16: 3, 24: 5 } },
  { id: 22, name: "P22: 레귤러 플레이오프", type: "PO_DETAILED", maxSubPhase: 16 },
  { id: 23, name: "P23: WT & VSC (국제대회)", type: "DETAILED", archive: "레귤러 시즌" },
  { id: 24, name: "P24: WE / 비시즌", type: "DETAILED" }
];

const INIT_TEAMS = clubsData.clubs.map(c => ({
  ...c, elo: c.elo_rating || 1500, match_count: 0, streak: 0, wins: 0, losses: 0, set_wins: 0, set_losses: 0, score_diff: 0, colors: c.colors || { bg: '#333333', text: '#ffffff' }
}));

const INIT_NAT_TEAMS = natData.teams.map(c => ({
  ...c, elo: c.elo_rating || 1500, match_count: 0, streak: 0, wins: 0, losses: 0, set_wins: 0, set_losses: 0, score_diff: 0, colors: c.colors || { bg: '#333333', text: '#ffffff' }
}));

// Helper: sort teams by tiebreaking rule
const sortByStandings = (teamsList) => {
  return [...teamsList].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    const sdA = a.set_wins - a.set_losses;
    const sdB = b.set_wins - b.set_losses;
    if (sdB !== sdA) return sdB - sdA;
    if (b.set_wins !== a.set_wins) return b.set_wins - a.set_wins;
    if (b.score_diff !== a.score_diff) return b.score_diff - a.score_diff;
    return b.elo - a.elo;
  });
};

export default function App() {
  const [activeTab, setActiveTab] = useState('club');
  
  const [teams, setTeams] = useState(INIT_TEAMS);
  const [natTeams, setNatTeams] = useState(INIT_NAT_TEAMS);
  
  const [natGroups, setNatGroups] = useState({ EU:{A:[],B:[],C:[],D:[]}, APAC:{A:[],B:[],C:[]}, AMERICA:{North:[],South:[]} });
  const [natSchedules, setNatSchedules] = useState({});
  
  // IQ: array of 5 matchups [{teamAId, teamBId, winnerId, loserId, result}]
  const [iqMatchups, setIqMatchups] = useState([]);
  
  // MEA: explicit matchup arrays
  const [meaStage1, setMeaStage1] = useState([]); // 4 matchups
  const [meaStage2, setMeaStage2] = useState([]); // 8 matchups
  const [meaFinal, setMeaFinal] = useState([]); // Single-elim bracket (4 QF + 2 SF + 1 F)
  const [meaTop12Ids, setMeaTop12Ids] = useState([]);

  // Playoff state: { L_KR: { bracket: [...], currentMD: 0 }, ... }
  const [playoffState, setPlayoffState] = useState({});

  const [phaseIdx, setPhaseIdx] = useState(0);
  const [subPhase, setSubPhase] = useState(0); 
  const [isPhaseCompleted, setIsPhaseCompleted] = useState(false);
  
  const [currentMeta, setCurrentMeta] = useState(["A", "C"]);
  
  const [history, setHistory] = useState([]);
  const [news, setNews] = useState([{ id: 0, text: "새로운 가상 이스포츠 시즌이 시작되었습니다!", type: "info" }]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [seasonHistory, setSeasonHistory] = useState([]);

  // Calculate ranks for all leagues to store in history
  const calculateRankEntry = (currentTeams, phaseLabel) => {
    const entry = { phase: phaseLabel };
    LEAGUES.forEach(leagueId => {
      const leagueTeams = currentTeams.filter(t => t.league_id === leagueId);
      const sorted = sortByStandings(leagueTeams);
      sorted.forEach((t, idx) => {
        entry[t.id] = idx + 1;
      });
    });
    return entry;
  };

  const [selectedLeague, setSelectedLeague] = useState("L_KR");
  const [favorites, setFavorites] = useState([]);
  const [eloHistory, setEloHistory] = useState([]);
  const [visibleGraphTeams, setVisibleGraphTeams] = useState({});

  const prepareNatSchedules = () => {
    const schedules = {};
    ['EU', 'APAC', 'AMERICA'].forEach(reg => {
      if (!natGroups[reg]) return;
      Object.keys(natGroups[reg]).forEach(groupName => {
        const teamIds = natGroups[reg][groupName];
        schedules[reg + '-' + groupName] = generateRoundRobinSchedule(teamIds);
      });
    });
    setNatSchedules(schedules);
  };

  useEffect(() => {
    // ===== Initialize App State =====
    const newEloEntry = calculateRankEntry(INIT_TEAMS, 0);
    setEloHistory([newEloEntry]);
    
    prepareNatSchedules();

    // === Seeded Pot Draw for EU (4 groups) ===
    const groups = { EU: {A:[], B:[], C:[], D:[]}, APAC: {A:[], B:[], C:[]}, AMERICA: {North:[], South:[]} };
    const euTeams = natTeams.filter(t => t.region === 'EU').sort((a,b) => b.elo - a.elo);
    const euGroupNames = ['A','B','C','D'];
    const euTeamsPerGroup = Math.ceil(euTeams.length / 4);
    // Create pots (each pot = 4 teams of similar strength)
    for (let pot = 0; pot < euTeamsPerGroup; pot++) {
      const potTeams = euTeams.slice(pot * 4, pot * 4 + 4);
      const shuffledPot = [...potTeams].sort(() => 0.5 - Math.random());
      shuffledPot.forEach((t, i) => {
        if (i < euGroupNames.length) groups.EU[euGroupNames[i]].push(t.id);
      });
    }
    
    // === Seeded Pot Draw for APAC (3 groups) ===
    const apacTeams = natTeams.filter(t => t.region === 'APAC').sort((a,b) => b.elo - a.elo);
    const apacGroupNames = ['A','B','C'];
    const apacTeamsPerGroup = Math.ceil(apacTeams.length / 3);
    for (let pot = 0; pot < apacTeamsPerGroup; pot++) {
      const potTeams = apacTeams.slice(pot * 3, pot * 3 + 3);
      const shuffledPot = [...potTeams].sort(() => 0.5 - Math.random());
      shuffledPot.forEach((t, i) => {
        if (i < apacGroupNames.length) groups.APAC[apacGroupNames[i]].push(t.id);
      });
    }
    
    // AMERICA: fixed North/South by sub_region
    const amN = natTeams.filter(t => t.region === 'AMERICA' && t.sub_region === 'North');
    const amS = natTeams.filter(t => t.region === 'AMERICA' && t.sub_region === 'South');
    groups.AMERICA.North = amN.map(t=>t.id); 
    groups.AMERICA.South = amS.map(t=>t.id);
    
    setNatGroups(groups);

    // MEA Initial: sort by elo, top12 seeds vs bottom8
    const mea = natTeams.filter(t => t.region === 'MEAF').sort((a,b) => b.elo - a.elo);
    const top12 = mea.slice(0, 12).map(t => t.id);
    const bot8 = mea.slice(12, 20).map(t => t.id);
    setMeaTop12Ids(top12);
    
    // Generate Stage 1 matchups: 4 matches from bottom 8 (seeded: 1v8, 2v7, 3v6, 4v5 within bottom8)
    const s1Matchups = [
      { teamAId: bot8[0], teamBId: bot8[7], winnerId: null, loserId: null, score: null },
      { teamAId: bot8[3], teamBId: bot8[4], winnerId: null, loserId: null, score: null },
      { teamAId: bot8[1], teamBId: bot8[6], winnerId: null, loserId: null, score: null },
      { teamAId: bot8[2], teamBId: bot8[5], winnerId: null, loserId: null, score: null }
    ];
    setMeaStage1(s1Matchups);
  }, []);

  const addNews = (text, type) => setNews(prev => [{ id: Date.now() + Math.random(), text, type }, ...prev].slice(0, 15));

  // Extract 3rd place teams from all groups
  const getThirdPlaceTeams = (currentNatTeams) => {
    const thirdPlaceTeams = [];
    ['EU', 'APAC', 'AMERICA'].forEach(reg => {
      Object.keys(natGroups[reg]).forEach(groupName => {
        const teamIds = natGroups[reg][groupName];
        const teamObjs = teamIds.map(id => currentNatTeams.find(t => t.id === id)).filter(Boolean);
        const sorted = sortByStandings(teamObjs);
        if (sorted.length >= 3) {
          thirdPlaceTeams.push({ id: sorted[2].id, region: reg, group: groupName });
        }
      });
    });
    return thirdPlaceTeams; // EU 4 + APAC 3 + AMERICA 2 = 9 teams
  };

  // Generate IQ matchups: 10 teams, same region MUST NOT face each other
  const generateIQMatchups = (teamEntries) => {
    // Backtracking approach to ensure no same-region matchups
    const shuffle = (arr) => [...arr].sort(() => 0.5 - Math.random());
    
    const tryPairing = (remaining) => {
      if (remaining.length === 0) return [];
      if (remaining.length === 1) return null; // odd leftover = fail
      
      for (let i = 1; i < remaining.length; i++) {
        if (remaining[0].region !== remaining[i].region) {
          const rest = remaining.filter((_, idx) => idx !== 0 && idx !== i);
          const subResult = tryPairing(rest);
          if (subResult !== null) {
            return [
              { teamAId: remaining[0].id, teamBId: remaining[i].id, winnerId: null, loserId: null, score: null },
              ...subResult
            ];
          }
        }
      }
      return null; // no valid pairing found
    };
    
    // Try multiple shuffles to find a valid pairing
    for (let attempt = 0; attempt < 100; attempt++) {
      const result = tryPairing(shuffle(teamEntries));
      if (result) return result;
    }
    
    // Absolute fallback (should never happen with 10 teams from 4+ regions)
    const pool = shuffle(teamEntries);
    const matchups = [];
    for (let i = 0; i < pool.length - 1; i += 2) {
      matchups.push({ teamAId: pool[i].id, teamBId: pool[i+1].id, winnerId: null, loserId: null, score: null });
    }
    return matchups;
  };
  // ===== Playoff Initialization =====
  const initializePlayoffs = (currentTeams) => {
    const newPOState = {};
    
    LEAGUES.forEach(leagueId => {
      const bracketType = getLeagueBracketType(leagueId);
      const template = getBracketTemplate(bracketType);
      const leagueTeams = currentTeams.filter(t => t.league_id === leagueId);
      
      // Deep clone the bracket template
      const bracket = JSON.parse(JSON.stringify(template));
      
      const teamSeedMap = {};
      
      if (bracketType === 'NA') {
        // NA: separate W (WEST) and E (EAST) conferences
        const west = sortByStandings(leagueTeams.filter(t => t.division === 'WEST'));
        const east = sortByStandings(leagueTeams.filter(t => t.division === 'EAST'));
        const seedMap = {};
        west.forEach((t, i) => { 
          seedMap['W' + (i + 1)] = t.id; 
          teamSeedMap[t.id] = 'W' + (i + 1);
        });
        east.forEach((t, i) => { 
          seedMap['E' + (i + 1)] = t.id; 
          teamSeedMap[t.id] = 'E' + (i + 1);
        });
        
        bracket.forEach(m => {
          if (typeof m.seedA === 'string' && !m.seedA.includes('.')) {
            m.teamAId = seedMap[m.seedA] || null;
            m.seedLabel_A = m.seedA;
          }
          if (typeof m.seedB === 'string' && !m.seedB.includes('.')) {
            m.teamBId = seedMap[m.seedB] || null;
            m.seedLabel_B = m.seedB;
          }
        });
        
      } else if (bracketType === 'CN') {
        // CN: separate D (DRAGON) and P (PHOENIX) divisions
        const dragon = sortByStandings(leagueTeams.filter(t => t.division === 'DRAGON'));
        const phoenix = sortByStandings(leagueTeams.filter(t => t.division === 'PHOENIX'));
        const seedMap = {};
        dragon.forEach((t, i) => { 
          seedMap['D' + (i + 1)] = t.id; 
          teamSeedMap[t.id] = 'D' + (i + 1);
        });
        phoenix.forEach((t, i) => { 
          seedMap['P' + (i + 1)] = t.id; 
          teamSeedMap[t.id] = 'P' + (i + 1);
        });
        
        bracket.forEach(m => {
          if (typeof m.seedA === 'string' && !m.seedA.includes('.')) {
            m.teamAId = seedMap[m.seedA] || null;
            m.seedLabel_A = m.seedA;
          }
          if (typeof m.seedB === 'string' && !m.seedB.includes('.')) {
            m.teamBId = seedMap[m.seedB] || null;
            m.seedLabel_B = m.seedB;
          }
        });
        
      } else {
        // SMALL (6 teams from 8/10) or LARGE (8 teams from 12): numeric seeds
        const sorted = sortByStandings(leagueTeams);
        sorted.forEach((t, i) => {
          teamSeedMap[t.id] = '#' + (i + 1);
        });
        
        bracket.forEach(m => {
          if (typeof m.seedA === 'number') {
            m.teamAId = sorted[m.seedA - 1]?.id || null;
            m.seedLabel_A = '#' + m.seedA;
          }
          if (typeof m.seedB === 'number') {
            m.teamBId = sorted[m.seedB - 1]?.id || null;
            m.seedLabel_B = '#' + m.seedB;
          }
        });
      }
      
      // Initialize all match results
      bracket.forEach(m => {
        m.winnerId = null;
        m.loserId = null;
        m.score = null;
        // Set seedLabel for dynamic references
        if (typeof m.seedA === 'string' && m.seedA.includes('.')) {
          m.seedLabel_A = m.seedA.replace('.winner', ' 승자').replace('.loser', ' 패자');
        }
        if (typeof m.seedB === 'string' && m.seedB.includes('.')) {
          m.seedLabel_B = m.seedB.replace('.winner', ' 승자').replace('.loser', ' 패자');
        }
      });
      
      newPOState[leagueId] = { bracket, currentMD: 0, teamSeedMap };
    });
    
    setPlayoffState(newPOState);
  };

  const processTransition = () => {
    const currentPhaseObj = PHASES[phaseIdx];
    const isStepByStep = currentPhaseObj.type === "NAT_DETAILED" || currentPhaseObj.type === "IQ_DETAILED" || currentPhaseObj.type === "PO_DETAILED";
    
    if (isPhaseCompleted) {
      if (isStepByStep && subPhase < currentPhaseObj.maxSubPhase) {
        setSubPhase(subPhase + 1);
      } else {
        const nextIdx = phaseIdx + 1;
        setPhaseIdx(nextIdx);
        const nextPhase = PHASES[nextIdx];
        const nextIsStep = nextPhase?.type === "NAT_DETAILED" || nextPhase?.type === "IQ_DETAILED" || nextPhase?.type === "PO_DETAILED";
        setSubPhase(nextIsStep ? 1 : 0);
        
        if (nextPhase?.type === "NAT_DETAILED") {
          prepareNatSchedules();
        }
        
        // Initialize playoffs when entering PO_DETAILED phase
        if (nextPhase?.type === "PO_DETAILED") {
          initializePlayoffs(teams);
        }
        
        if (nextPhase?.type === 'IQ_DETAILED') {
          // P11: Select proper IQ teams (3rd place from each group + MEA runner-up)
          const thirdPlaceEntries = getThirdPlaceTeams(natTeams);
          
          // Find MEA runner-up from single-elim final bracket
          let meaRunnerUp = null;
          const finalMatch = meaFinal.find(m => m.round === 'F' && m.loserId);
          if (finalMatch) {
            meaRunnerUp = { id: finalMatch.loserId, region: 'MEAF' };
          }
          
          const allIQEntries = [...thirdPlaceEntries];
          if (meaRunnerUp) allIQEntries.push(meaRunnerUp);
          
          const matchups = generateIQMatchups(allIQEntries);
          setIqMatchups(matchups);
        }
      }
      setIsPhaseCompleted(false);
      return;
    }

    // First time clicking from Phase 0
    if (phaseIdx === 0) {
      setPhaseIdx(1);
      setIsPhaseCompleted(false);
      return;
    }

    const activePhaseObj = PHASES[phaseIdx];
    const newMeta = getRandomMeta();
    setCurrentMeta(newMeta);
    let newNews = [];
    let updatedTeams = JSON.parse(JSON.stringify(teams));
    let updatedNatTeams = JSON.parse(JSON.stringify(natTeams));
    let allMatchesThisPhase = [];
    
    // Archiving
    if (activePhaseObj.archive && subPhase === 0) {
      const sortedForArchive = [...updatedTeams].sort((a, b) => b.elo - a.elo).map((t, i) => ({ ...t, rank: i + 1 }));
      setSeasonHistory(prev => [...prev, { name: activePhaseObj.archive, teams: sortedForArchive }]);
      updatedTeams = updatedTeams.map(t => ({ ...t, match_count: 0, wins: 0, losses: 0, set_wins: 0, set_losses: 0, score_diff: 0, streak: 0 }));
      newNews.push({ id: Math.random(), text: "[시스템] " + activePhaseObj.archive + " 기록이 시즌 기록실에 저장되었으며 성적이 리셋되었습니다.", type: "info" });
    }

    if (activePhaseObj.type === "JUMP") {
      newNews.push({ id: Math.random(), text: "[메타 패치] " + activePhaseObj.name + " 연산 완료! 메타: [" + newMeta.join(', ') + "]", type: "meta" });
      LEAGUES.forEach(leagueId => {
        const leagueTeams = updatedTeams.filter(t => t.league_id === leagueId);
        const matchesNeeded = activePhaseObj.matches[leagueTeams.length] || 4;
        const isBo5 = (leagueId === 'L_NA' || leagueId === 'L_CN');
        
        for (let round = 0; round < matchesNeeded; round++) {
          const shuffled = [...leagueTeams].sort(() => 0.5 - Math.random());
          for (let i = 0; i < Math.floor(shuffled.length / 2) * 2; i += 2) {
            const teamA = shuffled[i]; const teamB = shuffled[i+1];
            const match = isBo5 ? simulateBo5Match(teamA, teamB, newMeta) : simulateBo3Match(teamA, teamB, newMeta);
            const winner = updatedTeams.find(t => t.id === match.winnerId);
            const loser = updatedTeams.find(t => t.id === match.loserId);
            const tA = updatedTeams.find(t => t.id === teamA.id);
            const tB = updatedTeams.find(t => t.id === teamB.id);

            tA.match_count++; tB.match_count++;
            tA.set_wins += match.setWinsA; tA.set_losses += match.setWinsB; tA.score_diff += (match.totalMomentumA - match.totalMomentumB);
            tB.set_wins += match.setWinsB; tB.set_losses += match.setWinsA; tB.score_diff += (match.totalMomentumB - match.totalMomentumA);
            winner.wins++; winner.streak = winner.streak > 0 ? winner.streak + 1 : 1;
            loser.losses++; loser.streak = loser.streak < 0 ? loser.streak - 1 : -1;
            const eloChange = Math.max(5, Math.round(32 * (1 - (1 / (1 + Math.pow(10, (loser.elo - winner.elo) / 400))))));
            winner.elo += eloChange; loser.elo -= eloChange;

            allMatchesThisPhase.push({ id: "P" + activePhaseObj.id + "-" + leagueId + "-" + round + "-" + i, phase: activePhaseObj.name, ...match });
          }
        }
      });
      const newRankEntry = calculateRankEntry(updatedTeams, activePhaseObj.id);
      setEloHistory(prev => [...prev, newRankEntry]);

    } else if (activePhaseObj.type === "IQ_DETAILED") {
      // IQ: simulate the matchup for this matchday
      newNews.push({ id: Math.random(), text: "[이벤트] P11 IQ 매치데이 " + subPhase + " 경기 종료.", type: "info" });
      const matchIdx = subPhase - 1;
      if (matchIdx < iqMatchups.length && !iqMatchups[matchIdx].winnerId) {
        const mu = iqMatchups[matchIdx];
        const teamA = updatedNatTeams.find(t => t.id === mu.teamAId);
        const teamB = updatedNatTeams.find(t => t.id === mu.teamBId);
        if (teamA && teamB) {
          const match = simulateBo5Match(teamA, teamB, currentMeta);
          const updatedMatchups = [...iqMatchups];
          updatedMatchups[matchIdx] = { ...mu, winnerId: match.winnerId, loserId: match.loserId, score: match.setWinsA + "-" + match.setWinsB };
          setIqMatchups(updatedMatchups);
          allMatchesThisPhase.push({ id: "IQ-MD" + subPhase, phase: "IQ MD" + subPhase, ...match });
        }
      }

    } else if (activePhaseObj.type === "NAT_DETAILED") {
      newNews.push({ id: Math.random(), text: "[이벤트] " + activePhaseObj.name + " 매치데이 " + subPhase + " 종료.", type: "info" });
       
      // RR execution for EU, APAC, AMERICA
      ['EU', 'APAC', 'AMERICA'].forEach(reg => {
        Object.keys(natGroups[reg]).forEach(groupName => {
          const schedule = natSchedules[reg + '-' + groupName];
          if(!schedule) return;
          
          let roundsToPlay = [];
          if (schedule.length > 7 && subPhase === 7) {
            for (let r = 6; r < schedule.length; r++) { roundsToPlay.push(schedule[r]); }
          } else if (subPhase - 1 < schedule.length) {
            roundsToPlay.push(schedule[subPhase - 1]);
          }

          roundsToPlay.forEach(roundMatches => {
            roundMatches.forEach(pair => {
              const teamA = updatedNatTeams.find(t => t.id === pair[0]);
              const teamB = updatedNatTeams.find(t => t.id === pair[1]);
              if(!teamA || !teamB) return;
              
              const match = simulateBo3Match(teamA, teamB, currentMeta);
              const winner = updatedNatTeams.find(t => t.id === match.winnerId);
              const loser = updatedNatTeams.find(t => t.id === match.loserId);
              const tA = updatedNatTeams.find(t => t.id === teamA.id);
              const tB = updatedNatTeams.find(t => t.id === teamB.id);
              tA.match_count++; tB.match_count++;
              tA.set_wins += match.setWinsA; tA.set_losses += match.setWinsB; tA.score_diff += (match.totalMomentumA - match.totalMomentumB);
              tB.set_wins += match.setWinsB; tB.set_losses += match.setWinsA; tB.score_diff += (match.totalMomentumB - match.totalMomentumA);
              winner.wins++; loser.losses++;
              winner.elo += 10; loser.elo -= 10;
              allMatchesThisPhase.push({ id: "NAT-MD" + subPhase + "-" + reg + "-" + groupName + "-" + teamA.abbr, phase: "MD" + subPhase, ...match });
            });
          });
        });
      });
       
      // ===== MEA Logic =====
      if (activePhaseObj.id === 5) {
        // P3: Stage 1 (MD 1~3) and Stage 2 (MD 5~7)
        if (subPhase >= 1 && subPhase <= 3) {
          // Stage 1: simulate 1~2 matches per MD from the 4 matchups
          const unplayed = meaStage1.filter(m => !m.winnerId);
          const toPlayCount = subPhase === 3 ? unplayed.length : Math.min(Math.ceil(4 / 3), unplayed.length);
          const updatedS1 = [...meaStage1];
          for (let k = 0; k < toPlayCount; k++) {
            const idx = updatedS1.findIndex(m => !m.winnerId);
            if (idx === -1) break;
            const mu = updatedS1[idx];
            const teamA = updatedNatTeams.find(t => t.id === mu.teamAId);
            const teamB = updatedNatTeams.find(t => t.id === mu.teamBId);
            if (teamA && teamB) {
              const match = simulateBo5Match(teamA, teamB, currentMeta);
              updatedS1[idx] = { ...mu, winnerId: match.winnerId, loserId: match.loserId, score: match.setWinsA + "-" + match.setWinsB };
              allMatchesThisPhase.push({ id: "MEA-S1-" + subPhase + "-" + k, phase: "MEA 1차예선", ...match });
            }
          }
          setMeaStage1(updatedS1);
          
          // After MD3, generate Stage 2 matchups if all stage1 done
          if (subPhase === 3) {
            const winners = updatedS1.filter(m => m.winnerId).map(m => m.winnerId);
            const stage2Pool = [...meaTop12Ids, ...winners].sort(() => 0.5 - Math.random());
            const s2Matchups = [];
            for (let i = 0; i < stage2Pool.length; i += 2) {
              if (stage2Pool[i+1]) {
                s2Matchups.push({ teamAId: stage2Pool[i], teamBId: stage2Pool[i+1], winnerId: null, loserId: null, score: null });
              }
            }
            setMeaStage2(s2Matchups);
          }
        } else if (subPhase >= 5 && subPhase <= 7) {
          // Stage 2: simulate 2~3 matches per MD from the 8 matchups
          const unplayed = meaStage2.filter(m => !m.winnerId);
          const toPlayCount = subPhase === 7 ? unplayed.length : Math.min(3, unplayed.length);
          const updatedS2 = [...meaStage2];
          for (let k = 0; k < toPlayCount; k++) {
            const idx = updatedS2.findIndex(m => !m.winnerId);
            if (idx === -1) break;
            const mu = updatedS2[idx];
            const teamA = updatedNatTeams.find(t => t.id === mu.teamAId);
            const teamB = updatedNatTeams.find(t => t.id === mu.teamBId);
            if (teamA && teamB) {
              const match = simulateBo5Match(teamA, teamB, currentMeta);
              updatedS2[idx] = { ...mu, winnerId: match.winnerId, loserId: match.loserId, score: match.setWinsA + "-" + match.setWinsB };
              allMatchesThisPhase.push({ id: "MEA-S2-" + subPhase + "-" + k, phase: "MEA 2차예선", ...match });
            }
          }
          setMeaStage2(updatedS2);
          
          // After MD7, generate Final Stage: 8-team SINGLE ELIMINATION seeded bracket
          if (subPhase === 7) {
            const winners = updatedS2.filter(m => m.winnerId).map(m => m.winnerId);
            // Sort by Elo for seeding
            const seeded = winners.map(id => updatedNatTeams.find(t => t.id === id)).filter(Boolean).sort((a,b) => b.elo - a.elo);
            // Bracket: 1v8, 4v5, 2v7, 3v6
            if (seeded.length >= 8) {
              const qf = [
                { teamAId: seeded[0].id, teamBId: seeded[7].id, winnerId: null, loserId: null, score: null, round: 'QF' },
                { teamAId: seeded[3].id, teamBId: seeded[4].id, winnerId: null, loserId: null, score: null, round: 'QF' },
                { teamAId: seeded[1].id, teamBId: seeded[6].id, winnerId: null, loserId: null, score: null, round: 'QF' },
                { teamAId: seeded[2].id, teamBId: seeded[5].id, winnerId: null, loserId: null, score: null, round: 'QF' }
              ];
              setMeaFinal(qf);
            }
          }
        }
      } else if (activePhaseObj.id === 12) {
        // P8: Single Elimination Final Stage
        const fin = JSON.parse(JSON.stringify(meaFinal));
        
        if (subPhase <= 2) {
          // MD 1~2: Quarterfinals (4 matches)
          const unplayed = fin.filter(m => m.round === 'QF' && !m.winnerId);
          const toPlay = subPhase === 2 ? unplayed.length : Math.min(2, unplayed.length);
          for (let k = 0; k < toPlay; k++) {
            const idx = fin.findIndex(m => m.round === 'QF' && !m.winnerId);
            if (idx === -1) break;
            const mu = fin[idx];
            const tA = updatedNatTeams.find(t => t.id === mu.teamAId);
            const tB = updatedNatTeams.find(t => t.id === mu.teamBId);
            if (tA && tB) {
              const match = simulateBo5Match(tA, tB, currentMeta);
              fin[idx] = { ...mu, winnerId: match.winnerId, loserId: match.loserId, score: match.setWinsA + "-" + match.setWinsB };
              allMatchesThisPhase.push({ id: "MEA-QF-" + subPhase + "-" + k, phase: "MEA 8강", ...match });
            }
          }
          
          // After QF done, generate SF
          if (subPhase === 2) {
            const qfDone = fin.filter(m => m.round === 'QF' && m.winnerId);
            if (qfDone.length >= 4) {
              // SF: QF1 winner vs QF2 winner, QF3 winner vs QF4 winner
              fin.push({ teamAId: qfDone[0].winnerId, teamBId: qfDone[1].winnerId, winnerId: null, loserId: null, score: null, round: 'SF' });
              fin.push({ teamAId: qfDone[2].winnerId, teamBId: qfDone[3].winnerId, winnerId: null, loserId: null, score: null, round: 'SF' });
            }
          }
        } else if (subPhase === 3 || subPhase === 4) {
          // MD 3~4: Semifinals
          const unplayed = fin.filter(m => m.round === 'SF' && !m.winnerId);
          if (unplayed.length > 0) {
            const idx = fin.findIndex(m => m.round === 'SF' && !m.winnerId);
            const mu = fin[idx];
            const tA = updatedNatTeams.find(t => t.id === mu.teamAId);
            const tB = updatedNatTeams.find(t => t.id === mu.teamBId);
            if (tA && tB) {
              const match = simulateBo5Match(tA, tB, currentMeta);
              fin[idx] = { ...mu, winnerId: match.winnerId, loserId: match.loserId, score: match.setWinsA + "-" + match.setWinsB };
              allMatchesThisPhase.push({ id: "MEA-SF-" + subPhase, phase: "MEA 4강", ...match });
            }
          }
          
          // After both SF done, generate Final
          if (subPhase === 4) {
            const sfDone = fin.filter(m => m.round === 'SF' && m.winnerId);
            if (sfDone.length >= 2) {
              fin.push({ teamAId: sfDone[0].winnerId, teamBId: sfDone[1].winnerId, winnerId: null, loserId: null, score: null, round: 'F' });
            }
          }
        } else if (subPhase === 5) {
          // MD 5: Final
          const idx = fin.findIndex(m => m.round === 'F' && !m.winnerId);
          if (idx !== -1) {
            const mu = fin[idx];
            const tA = updatedNatTeams.find(t => t.id === mu.teamAId);
            const tB = updatedNatTeams.find(t => t.id === mu.teamBId);
            if (tA && tB) {
              const match = simulateBo5Match(tA, tB, currentMeta);
              fin[idx] = { ...mu, winnerId: match.winnerId, loserId: match.loserId, score: match.setWinsA + "-" + match.setWinsB };
              allMatchesThisPhase.push({ id: "MEA-F-5", phase: "MEA 결승", ...match });
            }
          }
        }
        // MD 6~7: no MEA matches (already done by MD5)
        
        setMeaFinal(fin);
      }
    } else if (activePhaseObj.type === "PO_DETAILED") {
      // ===== Playoff MD-by-MD Execution (set-by-set for Bo3/Bo5/Bo2_ADV) =====
      const currentMD = subPhase;
      newNews.push({ id: Math.random(), text: "[이벤트] " + activePhaseObj.name + " 매치데이 " + currentMD + " 경기 진행 중.", type: "info" });
      
      const updatedPO = JSON.parse(JSON.stringify(playoffState));
      
      LEAGUES.forEach(leagueId => {
        const poData = updatedPO[leagueId];
        if (!poData) return;
        const bracket = poData.bracket;
        poData.currentMD = currentMD;
        
        // Find matches scheduled for this MD that are not yet decided
        const matchesThisMD = bracket.filter(m => !m.winnerId && m.mdSchedule && m.mdSchedule.includes(currentMD));
        
        matchesThisMD.forEach(matchNode => {
          // Resolve dynamic team references
          if (!matchNode.teamAId && typeof matchNode.seedA === 'string' && matchNode.seedA.includes('.')) {
            const [refId, outcome] = matchNode.seedA.split('.');
            const refMatch = bracket.find(m => m.id === refId);
            if (refMatch && ((outcome === 'winner' && refMatch.winnerId) || (outcome === 'loser' && refMatch.loserId))) {
              matchNode.teamAId = outcome === 'winner' ? refMatch.winnerId : refMatch.loserId;
              if (poData.teamSeedMap[matchNode.teamAId]) matchNode.seedLabel_A = poData.teamSeedMap[matchNode.teamAId];
            }
          }
          if (!matchNode.teamBId && typeof matchNode.seedB === 'string' && matchNode.seedB.includes('.')) {
            const [refId, outcome] = matchNode.seedB.split('.');
            const refMatch = bracket.find(m => m.id === refId);
            if (refMatch && ((outcome === 'winner' && refMatch.winnerId) || (outcome === 'loser' && refMatch.loserId))) {
              matchNode.teamBId = outcome === 'winner' ? refMatch.winnerId : refMatch.loserId;
              if (poData.teamSeedMap[matchNode.teamBId]) matchNode.seedLabel_B = poData.teamSeedMap[matchNode.teamBId];
            }
          }
          
          if (!matchNode.teamAId || !matchNode.teamBId) return;
          
          const teamA = updatedTeams.find(t => t.id === matchNode.teamAId);
          const teamB = updatedTeams.find(t => t.id === matchNode.teamBId);
          if (!teamA || !teamB) return;
          
          // Initialize partial series state if needed
          if (!matchNode.setsPlayed) matchNode.setsPlayed = [];
          if (matchNode.partialSetWinsA === undefined) matchNode.partialSetWinsA = 0;
          if (matchNode.partialSetWinsB === undefined) matchNode.partialSetWinsB = 0;
          if (matchNode.partialMomentumA === undefined) matchNode.partialMomentumA = 0;
          if (matchNode.partialMomentumB === undefined) matchNode.partialMomentumB = 0;
          
          // Determine how many sets to play this MD
          const fmt = matchNode.format;
          
          if (fmt === 'Bo1') {
            // Bo1: single set, single MD
            const isDerby = Math.random() < 0.05;
            const setResult = simulateSet(teamA, teamB, newMeta, isDerby);
            matchNode.setsPlayed.push(setResult);
            matchNode.partialSetWinsA += (setResult.winnerId === teamA.id ? 1 : 0);
            matchNode.partialSetWinsB += (setResult.winnerId === teamB.id ? 1 : 0);
            matchNode.partialMomentumA += setResult.momentum.A;
            matchNode.partialMomentumB += setResult.momentum.B;
            matchNode.winnerId = setResult.winnerId;
            matchNode.loserId = setResult.loserId;
          } else if (fmt === 'Bo5_Single') {
            // Bo5 played fully in a single MatchDay
            const winsNeeded = 3;
            while (matchNode.partialSetWinsA < winsNeeded && matchNode.partialSetWinsB < winsNeeded) {
              const isDerby = Math.random() < 0.05;
              const setResult = simulateSet(teamA, teamB, newMeta, isDerby);
              matchNode.setsPlayed.push(setResult);
              matchNode.partialMomentumA += setResult.momentum.A;
              matchNode.partialMomentumB += setResult.momentum.B;
              
              if (setResult.winnerId === teamA.id) matchNode.partialSetWinsA++;
              else matchNode.partialSetWinsB++;
            }
            if (matchNode.partialSetWinsA >= winsNeeded) {
              matchNode.winnerId = teamA.id;
              matchNode.loserId = teamB.id;
            } else {
              matchNode.winnerId = teamB.id;
              matchNode.loserId = teamA.id;
            }
          } else if (fmt === 'Bo2_ADV') {
            // Bo2_ADV: MD1 = game 1 (advantage team starts 1-0)
            // If advantage team wins game 1 => 2-0, series over
            // If advantage team loses game 1 => 1-1, play game 2 on MD2
            const mdIndex = matchNode.mdSchedule.indexOf(currentMD);
            const isDerby = Math.random() < 0.05;
            
            if (mdIndex === 0) {
              // Game 1
              const setResult = simulateSet(teamA, teamB, newMeta, isDerby);
              matchNode.setsPlayed.push(setResult);
              matchNode.partialMomentumA += setResult.momentum.A;
              matchNode.partialMomentumB += setResult.momentum.B;
              
              if (setResult.winnerId === teamA.id) {
                // Advantage team won => series over (2-0)
                matchNode.partialSetWinsA = 2;
                matchNode.partialSetWinsB = 0;
                matchNode.winnerId = teamA.id;
                matchNode.loserId = teamB.id;
              } else {
                // tied 1-1, wait for game 2
                matchNode.partialSetWinsA = 1;
                matchNode.partialSetWinsB = 1;
              }
            } else if (mdIndex === 1 && !matchNode.winnerId) {
              // Game 2 (decider)
              const setResult = simulateSet(teamA, teamB, newMeta, isDerby);
              matchNode.setsPlayed.push(setResult);
              matchNode.partialMomentumA += setResult.momentum.A;
              matchNode.partialMomentumB += setResult.momentum.B;
              
              if (setResult.winnerId === teamA.id) {
                matchNode.partialSetWinsA = 2;
                matchNode.partialSetWinsB = 1;
              } else {
                matchNode.partialSetWinsA = 1;
                matchNode.partialSetWinsB = 2;
              }
              matchNode.winnerId = setResult.winnerId;
              matchNode.loserId = setResult.loserId;
            }
          } else {
            // Bo3 or Bo5: play one set per MD
            const maxSets = fmt === 'Bo5' ? 5 : 3;
            const winsNeeded = Math.ceil(maxSets / 2);
            
            // Only play if series is not yet decided
            if (matchNode.partialSetWinsA < winsNeeded && matchNode.partialSetWinsB < winsNeeded) {
              const isDerby = Math.random() < 0.05;
              const setResult = simulateSet(teamA, teamB, newMeta, isDerby);
              matchNode.setsPlayed.push(setResult);
              matchNode.partialMomentumA += setResult.momentum.A;
              matchNode.partialMomentumB += setResult.momentum.B;
              
              if (setResult.winnerId === teamA.id) matchNode.partialSetWinsA++;
              else matchNode.partialSetWinsB++;
              
              // Check if series is decided
              if (matchNode.partialSetWinsA >= winsNeeded) {
                matchNode.winnerId = teamA.id;
                matchNode.loserId = teamB.id;
              } else if (matchNode.partialSetWinsB >= winsNeeded) {
                matchNode.winnerId = teamB.id;
                matchNode.loserId = teamA.id;
              }
            }
          }
          
          // Update running score display
          matchNode.score = matchNode.partialSetWinsA + "-" + matchNode.partialSetWinsB;
          matchNode.momentumScore = matchNode.partialMomentumA + "-" + matchNode.partialMomentumB;
          
          // If match just finished, update team stats
          if (matchNode.winnerId && !matchNode.statsUpdated) {
            matchNode.statsUpdated = true;
            const tA = updatedTeams.find(t => t.id === teamA.id);
            const tB = updatedTeams.find(t => t.id === teamB.id);
            tA.match_count++; tB.match_count++;
            tA.set_wins += matchNode.partialSetWinsA; tA.set_losses += matchNode.partialSetWinsB;
            tA.score_diff += (matchNode.partialMomentumA - matchNode.partialMomentumB);
            tB.set_wins += matchNode.partialSetWinsB; tB.set_losses += matchNode.partialSetWinsA;
            tB.score_diff += (matchNode.partialMomentumB - matchNode.partialMomentumA);
            const winner = updatedTeams.find(t => t.id === matchNode.winnerId);
            const loser = updatedTeams.find(t => t.id === matchNode.loserId);
            winner.wins++; winner.streak = winner.streak > 0 ? winner.streak + 1 : 1;
            loser.losses++; loser.streak = loser.streak < 0 ? loser.streak - 1 : -1;
            const eloChange = Math.max(5, Math.round(32 * (1 - (1 / (1 + Math.pow(10, (loser.elo - winner.elo) / 400))))));
            winner.elo += eloChange; loser.elo -= eloChange;
          }
          
          allMatchesThisPhase.push({ id: "PO-" + leagueId + "-" + matchNode.id + "-MD" + currentMD, phase: leagueId + " PO " + matchNode.label });
        });
      });
      
      setPlayoffState(updatedPO);
      
      const newRankEntry = calculateRankEntry(updatedTeams, activePhaseObj.id + "_MD" + currentMD);
      setEloHistory(prev => [...prev, newRankEntry]);

    } else {
      newNews.push({ id: Math.random(), text: "[시스템] " + activePhaseObj.name + " 진행 완료.", type: "info" });
    }

    setHistory(prev => [[...allMatchesThisPhase], ...prev].slice(0, 10));
    newNews.slice(0, 5).forEach(n => setNews(prev => [n, ...prev].slice(0, 15)));
    setTeams(updatedTeams);
    setNatTeams(updatedNatTeams);
    
    setIsPhaseCompleted(true);
  };

  const toggleFavorite = (id) => setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);

  const currentPhaseObj = PHASES[phaseIdx];
  const isStepByStep = currentPhaseObj.type === "NAT_DETAILED" || currentPhaseObj.type === "IQ_DETAILED" || currentPhaseObj.type === "PO_DETAILED";
  const isPO = currentPhaseObj.type === "PO_DETAILED";
  
  const phaseLabel = isStepByStep
    ? currentPhaseObj.name + " (MD " + subPhase + "/" + currentPhaseObj.maxSubPhase + ")"
    : currentPhaseObj.name;
  
  let buttonLabel = "";
  if (isPhaseCompleted) {
     if (isStepByStep && subPhase < currentPhaseObj.maxSubPhase) buttonLabel = "매치데이 " + (subPhase+1) + " 진입";
     else buttonLabel = "다음 페이즈 진입";
  } else {
     if (isStepByStep) buttonLabel = "진행 (Matchday " + subPhase + " 연산)";
     else buttonLabel = "진행 (" + currentPhaseObj.name + " 연산)";
  }

  const btnClass = isPhaseCompleted 
    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white' 
    : isPO
      ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white'
      : isStepByStep 
        ? 'bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-500 hover:to-orange-500 text-white' 
        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden flex flex-col relative">
      <div className="fixed inset-0 w-full h-[500px] bg-gradient-to-br from-indigo-900/20 to-purple-900/10 blur-3xl pointer-events-none" />
      
      <GNB activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="w-full bg-slate-900/40 border-b border-white/5 relative z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Current Meta</span>
              <span className="text-sm font-black text-emerald-400">{currentMeta.join(', ')}</span>
            </div>
            <div className="w-px h-8 bg-white/10 hidden sm:block" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Timeline</span>
              <span className="text-sm font-black text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" /> {phaseLabel}
                {isPhaseCompleted && <CheckCircle2 className="w-4 h-4 text-green-400 ml-2" />}
              </span>
            </div>
          </div>
          <button 
            onClick={processTransition}
            disabled={phaseIdx >= PHASES.length - 1}
            className={"px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(79,70,229,0.3)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed " + btnClass}
          >
            {isPhaseCompleted ? <ArrowRight className="w-4 h-4" /> : <Play className="w-4 h-4" />} {buttonLabel}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-7xl mx-auto p-6">
          {activeTab === 'club' && !isPO && <ClubView teams={teams} selectedLeague={selectedLeague} setSelectedLeague={setSelectedLeague} LEAGUES={LEAGUES} favorites={favorites} toggleFavorite={toggleFavorite} news={news} history={history} setSelectedMatch={setSelectedMatch} eloHistory={eloHistory} visibleGraphTeams={visibleGraphTeams} setVisibleGraphTeams={setVisibleGraphTeams} />}
          {(activeTab === 'club' && isPO) && <PlayoffView teams={teams} playoffState={playoffState} LEAGUES={LEAGUES} />}
          {activeTab === 'national' && <NationalView natTeams={natTeams} natGroups={natGroups} meaStage1={meaStage1} meaStage2={meaStage2} meaFinal={meaFinal} iqMatchups={iqMatchups} />}
          {activeTab === 'clubRank' && <RankingView title="글로벌 클럽 랭킹" type="club" teams={teams} icon={null} />}
          {activeTab === 'natRank' && <RankingView title="글로벌 국가대표 랭킹" type="national" teams={natTeams} icon={null} />}
          {activeTab === 'coeff' && <LeagueCoefficientsView />}
          {activeTab === 'info' && <InfoView seasonHistory={seasonHistory} />}
          {/* Scaffolded placeholder views */}
          {['continental_emea', 'continental_apac', 'continental_amer'].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500 gap-4 bg-slate-900/40 rounded-2xl border border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-indigo-900/30 flex items-center justify-center"><Calendar className="w-8 h-8 text-indigo-400" /></div>
              <p className="text-xl font-black text-white">대륙 대회: {activeTab.replace('continental_', '').toUpperCase()}</p>
              <p className="text-sm text-slate-400">이 기능은 향후 구현될 예정입니다.</p>
            </div>
          )}
          {['intl_mm', 'intl_wm', 'intl_vsc', 'intl_we'].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500 gap-4 bg-slate-900/40 rounded-2xl border border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-purple-900/30 flex items-center justify-center"><Calendar className="w-8 h-8 text-purple-400" /></div>
              <p className="text-xl font-black text-white">국제대회: {activeTab.replace('intl_', '').toUpperCase()}</p>
              <p className="text-sm text-slate-400">이 기능은 향후 구현될 예정입니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
