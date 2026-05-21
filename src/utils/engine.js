export const META_TYPES = ["A", "B", "C", "D", "E", "F", "G"];

export const getRandomRNG = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const getRandomMeta = () => {
  const shuffled = [...META_TYPES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 2);
};

export const calculateBaseCP = (team, currentMeta) => {
  const metaMatch = team.preferred_combos?.some(combo => currentMeta.includes(combo)) || false;
  const drfBonus = metaMatch ? 1.1 : 0.9;
  const finalDRF = (team.stats?.DRF || 80) * drfBonus;
  
  const formValue = Math.max(-3, Math.min(3, Math.floor(Math.abs(team.streak || 0) / 2) * Math.sign(team.streak || 0)));
  const rng = getRandomRNG(1, 10);
  
  return (finalDRF * 0.8) + formValue + rng;
};

const simulatePhase = (phaseType, teamA, teamB, currentMeta, isDerby, currentMomentum) => {
  let engagements = 0, statKey = "", rngMax = 5;
  if (phaseType === 1) { engagements = getRandomRNG(1, 2); statKey = "LAN"; rngMax = 5; }
  else if (phaseType === 2) { engagements = getRandomRNG(2, 4); statKey = "TMF"; rngMax = 10; }
  else if (phaseType === 3) { engagements = getRandomRNG(2, 3); statKey = "MAC"; rngMax = 15; }

  const rngMin = -rngMax;
  const mult = isDerby ? 1.5 : 1;
  const min = Math.floor(rngMin * mult);
  const max = Math.floor(rngMax * mult);

  let cpA = calculateBaseCP(teamA, currentMeta);
  let cpB = calculateBaseCP(teamB, currentMeta);
  
  let logs = [];
  let momentumA = currentMomentum.A;
  let momentumB = currentMomentum.B;
  let ended = false;
  let endReason = "";

  for (let i = 0; i < engagements; i++) {
    const powerA = Math.max(1, cpA + (teamA.stats?.[statKey] || 80) + (teamA.stats?.MEC || 80) + getRandomRNG(min, max));
    const powerB = Math.max(1, cpB + (teamB.stats?.[statKey] || 80) + (teamB.stats?.MEC || 80) + getRandomRNG(min, max));
    
    // Cube probability for harsher upsets
    const probA = Math.pow(powerA, 3) / (Math.pow(powerA, 3) + Math.pow(powerB, 3));
    const isAWinner = Math.random() < probA;
    
    const gained = getRandomRNG(1, 3);
    if (isAWinner) {
      momentumA += gained; cpA += gained;
      logs.push({ type: 'fight', msg: `[${statKey}] ${teamA.name} 교전 승리! (+${gained}) (승률: ${(probA*100).toFixed(1)}%)`, A: momentumA, B: momentumB });
    } else {
      momentumB += gained; cpB += gained;
      logs.push({ type: 'fight', msg: `[${statKey}] ${teamB.name} 교전 승리! (+${gained}) (승률: ${((1-probA)*100).toFixed(1)}%)`, A: momentumA, B: momentumB });
    }

    if (momentumA >= 20 || momentumB >= 20) {
      ended = true; endReason = "목표 도달 (20점)"; break;
    }
    const diff = Math.abs(momentumA - momentumB);
    if (phaseType === 2 && diff >= 12) {
      ended = true; endReason = "콜드 게임 (격차 12점 이상)"; break;
    }
    if (phaseType === 3 && diff >= 8) {
      ended = true; endReason = "넥서스 파괴 (격차 8점 이상)"; break;
    }
  }

  return { logs, momentumA, momentumB, ended, endReason };
};

export const simulateSet = (teamA, teamB, currentMeta, isDerby) => {
  let logs = [];
  let momentum = { A: 0, B: 0 };
  let endReason = "";

  for (let phase = 1; phase <= 3; phase++) {
    const phaseName = phase === 1 ? '초반 (LAN)' : phase === 2 ? '중반 (TMF)' : '후반 (MAC)';
    logs.push({ type: 'phase', msg: `--- ${phaseName} 페이즈 돌입 ---` });
    
    const result = simulatePhase(phase, teamA, teamB, currentMeta, isDerby, momentum);
    logs = logs.concat(result.logs);
    momentum.A = result.momentumA;
    momentum.B = result.momentumB;
    
    if (result.ended) { endReason = result.endReason; break; }
  }
  
  if (!endReason) endReason = "판정승";

  let winnerId = null, loserId = null;
  if (momentum.A === momentum.B) {
    if (Math.random() > 0.5) { momentum.A += 1; logs.push({ type: 'system', msg: `연장 혈투 끝에 ${teamA.name} 득점!` }); }
    else { momentum.B += 1; logs.push({ type: 'system', msg: `연장 혈투 끝에 ${teamB.name} 득점!` }); }
  }
  
  if (momentum.A > momentum.B) { winnerId = teamA.id; loserId = teamB.id; } 
  else { winnerId = teamB.id; loserId = teamA.id; }

  logs.push({ type: 'result', msg: `세트 결과: ${winnerId === teamA.id ? teamA.name : teamB.name} 승리 (${endReason})` });

  return { teamA, teamB, winnerId, loserId, momentum, logs, endReason };
};

// Generic Match Simulator (BoN)
const simulateMatch = (teamA, teamB, currentMeta, maxSets) => {
  const isDerby = Math.random() < 0.05; 
  let sets = [];
  let setWinsA = 0;
  let setWinsB = 0;
  let totalMomentumA = 0;
  let totalMomentumB = 0;
  const winsRequired = Math.ceil(maxSets / 2);

  for (let i = 1; i <= maxSets; i++) {
    if (setWinsA === winsRequired || setWinsB === winsRequired) break;
    
    const setLogStart = { type: 'system', msg: `================ 세트 ${i} ================` };
    const setParams = simulateSet(teamA, teamB, currentMeta, isDerby);
    
    if (setParams.winnerId === teamA.id) setWinsA++;
    else setWinsB++;

    totalMomentumA += setParams.momentum.A;
    totalMomentumB += setParams.momentum.B;

    sets.push({
      setNum: i,
      winnerId: setParams.winnerId,
      momentum: setParams.momentum,
      logs: [setLogStart, ...setParams.logs]
    });
  }

  const winnerId = setWinsA === winsRequired ? teamA.id : teamB.id;
  const loserId = setWinsA === winsRequired ? teamB.id : teamA.id;

  return {
    teamA, teamB,
    winnerId, loserId,
    setWinsA, setWinsB,
    totalMomentumA, totalMomentumB,
    sets,
    isDerby,
    format: "Bo" + maxSets
  };
};

export const simulateBo3Match = (teamA, teamB, currentMeta) => simulateMatch(teamA, teamB, currentMeta, 3);
export const simulateBo5Match = (teamA, teamB, currentMeta) => simulateMatch(teamA, teamB, currentMeta, 5);

// Bo1: single set match
export const simulateBo1Match = (teamA, teamB, currentMeta) => {
  const isDerby = Math.random() < 0.05;
  const setResult = simulateSet(teamA, teamB, currentMeta, isDerby);
  return {
    teamA, teamB,
    winnerId: setResult.winnerId,
    loserId: setResult.loserId,
    setWinsA: setResult.winnerId === teamA.id ? 1 : 0,
    setWinsB: setResult.winnerId === teamB.id ? 1 : 0,
    totalMomentumA: setResult.momentum.A,
    totalMomentumB: setResult.momentum.B,
    sets: [{ setNum: 1, winnerId: setResult.winnerId, momentum: setResult.momentum, logs: setResult.logs }],
    isDerby,
    format: "Bo1"
  };
};

// Bo2 with 1-match advantage for teamA:
// Game 1: if teamA wins => series over (teamA wins 2-0 conceptually)
// Game 1: if teamB wins => tied 1-1, play Game 2 as decider
export const simulateBo2AdvMatch = (teamA, teamB, currentMeta) => {
  const isDerby = Math.random() < 0.05;
  // Game 1
  const set1 = simulateSet(teamA, teamB, currentMeta, isDerby);
  const sets = [{ setNum: 1, winnerId: set1.winnerId, momentum: set1.momentum, logs: set1.logs }];
  
  if (set1.winnerId === teamA.id) {
    // Advantage team won Game 1 => series over (2-0)
    return {
      teamA, teamB, winnerId: teamA.id, loserId: teamB.id,
      setWinsA: 2, setWinsB: 0,
      totalMomentumA: set1.momentum.A, totalMomentumB: set1.momentum.B,
      sets, isDerby, format: "Bo2_ADV"
    };
  }
  
  // teamB won Game 1 => tied 1-1, play Game 2
  const set2 = simulateSet(teamA, teamB, currentMeta, isDerby);
  sets.push({ setNum: 2, winnerId: set2.winnerId, momentum: set2.momentum, logs: set2.logs });
  
  const winnerId = set2.winnerId;
  const loserId = set2.loserId;
  const setWinsA = 1 + (set2.winnerId === teamA.id ? 1 : 0);
  const setWinsB = 1 + (set2.winnerId === teamB.id ? 1 : 0);
  
  return {
    teamA, teamB, winnerId, loserId,
    setWinsA, setWinsB,
    totalMomentumA: set1.momentum.A + set2.momentum.A,
    totalMomentumB: set1.momentum.B + set2.momentum.B,
    sets, isDerby, format: "Bo2_ADV"
  };
};

// N-팀 풀 라운드 로빈 생성기 (원형 방식, Circle Method)
export const generateRoundRobinSchedule = (teams) => {
  const n = teams.length;
  const isOdd = n % 2 !== 0;
  const pool = isOdd ? [...teams, null] : [...teams]; // 홀수면 가상의 BYE 팀 추가
  const totalRounds = pool.length - 1;
  const matchesPerRound = pool.length / 2;
  const schedule = [];

  for (let r = 0; r < totalRounds; r++) {
    const roundMatches = [];
    for (let i = 0; i < matchesPerRound; i++) {
      const home = pool[i];
      const away = pool[pool.length - 1 - i];
      if (home !== null && away !== null) {
        roundMatches.push([home, away]);
      }
    }
    schedule.push(roundMatches);
    
    // 회전 (첫 번째 팀은 고정, 나머지는 시계 방향 회전)
    pool.splice(1, 0, pool.pop());
  }

  return schedule;
};

