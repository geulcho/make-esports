import React, { useState } from 'react';
import { Trophy, Swords, ChevronRight, Crown, Shield, Medal } from 'lucide-react';

export default function PlayoffView({ teams, playoffState, LEAGUES }) {
  const leagueNames = {
    L_KR: '한국', L_NA: '북미', L_CN: '중국', L_NEU: '북유럽', L_WEU: '서유럽',
    L_RU: '러시아', L_DE: '독일', L_TW: '대만', L_SEU: '남유럽', L_BR: '브라질',
    L_EEU: '동유럽', L_SEA: '동남아', L_JP: '일본', L_SA: '남미', L_TR: '터키', L_MEAF: '중동/아프리카'
  };

  const leaguesWithPO = LEAGUES.filter(lid => playoffState[lid]);
  const [selectedLeague, setSelectedLeague] = useState(leaguesWithPO[0] || 'L_KR');

  const getTeam = (id) => teams.find(t => t.id === id);

  const getResolvedTeamId = (seed, bracket) => {
    if (!seed) return null;
    if (typeof seed === 'number') return null;
    if (typeof seed === 'string' && seed.includes('.')) {
      const [matchId, outcome] = seed.split('.');
      const refMatch = bracket.find(m => m.id === matchId);
      if (!refMatch) return null;
      if (outcome === 'winner') return refMatch.winnerId || null;
      if (outcome === 'loser') return refMatch.loserId || null;
    }
    return null;
  };

  const renderMatchCard = (match, bracket, isTreeMode = false) => {
    if (!match) return <div className="w-full h-24 invisible"></div>; // Spacer for tree mode

    let teamAId = match.teamAId;
    let teamBId = match.teamBId;

    if (!teamAId && match.seedA && typeof match.seedA === 'string' && match.seedA.includes('.')) {
      teamAId = getResolvedTeamId(match.seedA, bracket);
    }
    if (!teamBId && match.seedB && typeof match.seedB === 'string' && match.seedB.includes('.')) {
      teamBId = getResolvedTeamId(match.seedB, bracket);
    }

    const teamA = teamAId ? getTeam(teamAId) : null;
    const teamB = teamBId ? getTeam(teamBId) : null;
    const isDone = !!match.winnerId;
    const isWinnerA = match.winnerId === teamAId;
    const isWinnerB = match.winnerId === teamBId;

    const formatLabel = match.format === 'Bo2_ADV' ? 'Bo2 (ADV)' : match.format;
    const isFinal = match.label && match.label.includes('결승');

    const cardBorder = isFinal
      ? (isDone ? 'border-yellow-500/50' : 'border-yellow-500/30 shadow-lg shadow-yellow-500/10')
      : (isDone ? 'border-slate-700' : 'border-indigo-500/30');
    const cardBg = isFinal
      ? 'bg-gradient-to-r from-yellow-900/20 to-orange-900/20'
      : 'bg-slate-800/80';

    let seedLabelA = match.seedLabel_A || '';
    if (seedLabelA && !seedLabelA.startsWith('#') && !seedLabelA.includes('승자') && !seedLabelA.includes('패자')) seedLabelA = '#' + seedLabelA;
    
    let seedLabelB = match.seedLabel_B || '';
    if (seedLabelB && !seedLabelB.startsWith('#') && !seedLabelB.includes('승자') && !seedLabelB.includes('패자')) seedLabelB = '#' + seedLabelB;

    // Check if series is in progress (has partial score but no winner yet)
    const isInProgress = !isDone && match.score && match.score !== '0-0' && (match.partialSetWinsA > 0 || match.partialSetWinsB > 0);

    let displayScore = null;
    if (isDone && (match.format === 'Bo3' || match.format === 'Bo5' || match.format === 'Bo5_Single' || match.format === 'Bo2_ADV')) {
      displayScore = (
        <div className="flex flex-col items-center">
          <span className="font-black text-lg leading-tight">{match.score}</span>
          <span className="text-[10px] text-slate-400">({match.momentumScore})</span>
        </div>
      );
    } else if (isDone) {
      displayScore = <span className="font-black text-lg text-white">{match.score}</span>;
    } else if (isInProgress) {
      displayScore = (
        <div className="flex flex-col items-center">
          <span className="font-black text-lg leading-tight text-yellow-400 animate-pulse">{match.score}</span>
          <span className="text-[9px] text-yellow-500/70 font-bold">진행 중</span>
        </div>
      );
    }

    return (
      <div key={match.id} className={`border rounded-xl p-3 transition-all flex flex-col justify-center relative ${cardBorder} ${cardBg} ${isTreeMode ? 'h-[100px] min-w-[280px]' : ''}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase">{match.label}</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-600">{formatLabel}</span>
            <span className="text-[10px] font-bold text-indigo-400">MD {match.mdSchedule ? match.mdSchedule.join(',') : '?'}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Team A */}
          <div className={"flex items-center gap-2 flex-1 min-w-0 " + (isDone && !isWinnerA ? 'opacity-35' : '')}>
            {match.advantage === 'A' && !isDone && <Shield className="w-3 h-3 text-yellow-400 flex-shrink-0" title="어드밴티지" />}
            {teamA ? (
              <>
                <span className="w-9 h-5 flex items-center justify-center rounded text-[9px] font-black shadow-sm flex-shrink-0" style={{ backgroundColor: teamA.colors.bg, color: teamA.colors.text }}>{teamA.abbr}</span>
                <span className="text-[9px] font-bold text-slate-400">{seedLabelA}</span>
                <span className="font-bold text-sm text-white truncate">{teamA.name}</span>
                {isWinnerA && <Trophy className="w-4 h-4 text-yellow-400 ml-auto flex-shrink-0" />}
              </>
            ) : (
              <span className="text-slate-500 text-xs font-bold italic">{seedLabelA || 'TBD'}</span>
            )}
          </div>

          {/* Score */}
          <div className="flex-shrink-0 w-16 text-center">
            {displayScore ? (
              displayScore
            ) : (
              <span className="text-slate-600 font-bold text-xs">VS</span>
            )}
          </div>

          {/* Team B */}
          <div className={"flex items-center gap-2 flex-1 min-w-0 justify-end " + (isDone && !isWinnerB ? 'opacity-35' : '')}>
            {teamB ? (
              <>
                {isWinnerB && <Trophy className="w-4 h-4 text-yellow-400 mr-auto flex-shrink-0" />}
                <span className="font-bold text-sm text-white truncate text-right">{teamB.name}</span>
                <span className="text-[9px] font-bold text-slate-400">{seedLabelB}</span>
                <span className="w-9 h-5 flex items-center justify-center rounded text-[9px] font-black shadow-sm flex-shrink-0" style={{ backgroundColor: teamB.colors.bg, color: teamB.colors.text }}>{teamB.abbr}</span>
              </>
            ) : (
              <span className="text-slate-500 text-xs font-bold italic">{seedLabelB || 'TBD'}</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Tournament Tree Renderer for NA / CN
  const renderTournamentTree = (bracket, type) => {
    if (type === 'NA') {
      // 4 Rounds
      const getM = (id) => bracket.find(m => m.id === id);
      return (
        <div className="flex gap-8 overflow-x-auto pb-6 snap-x">
          {/* Round 1 (8 matches) */}
          <div className="flex flex-col justify-around gap-2 shrink-0">
            {['1-1','1-2','1-3','1-4','1-5','1-6','1-7','1-8'].map(id => renderMatchCard(getM(id), bracket, true))}
          </div>
          {/* Round 2 (4 matches) */}
          <div className="flex flex-col justify-around gap-2 shrink-0">
            {['2-1','2-2','2-3','2-4'].map(id => renderMatchCard(getM(id), bracket, true))}
          </div>
          {/* Round 3 (2 matches) */}
          <div className="flex flex-col justify-around gap-2 shrink-0">
            {['3-1','3-2'].map(id => renderMatchCard(getM(id), bracket, true))}
          </div>
          {/* Round 4 (Grand Final) */}
          <div className="flex flex-col justify-around gap-2 shrink-0">
            {['4-1'].map(id => renderMatchCard(getM(id), bracket, true))}
          </div>
        </div>
      );
    } else if (type === 'CN') {
      // CN has 4 Rounds, but R1 only has 2 matches that feed into R2's 2-1 and 2-2. 
      // R2's 2-3 and 2-4 don't have R1 dependencies.
      const getM = (id) => bracket.find(m => m.id === id);
      return (
        <div className="flex gap-8 overflow-x-auto pb-6 snap-x">
          {/* Round 1 */}
          <div className="flex flex-col justify-around gap-2 shrink-0">
            {renderMatchCard(getM('1-1'), bracket, true)}
            <div className="h-[100px] invisible"></div> {/* Spacer for 2-3 alignment */}
            {renderMatchCard(getM('1-2'), bracket, true)}
            <div className="h-[100px] invisible"></div> {/* Spacer for 2-4 alignment */}
          </div>
          {/* Round 2 */}
          <div className="flex flex-col justify-around gap-2 shrink-0">
            {['2-1','2-3','2-2','2-4'].map(id => renderMatchCard(getM(id), bracket, true))}
          </div>
          {/* Round 3 */}
          <div className="flex flex-col justify-around gap-2 shrink-0">
            <div className="h-[100px] invisible"></div>
            {renderMatchCard(getM('3-1'), bracket, true)}
            <div className="h-[100px] invisible"></div>
            {renderMatchCard(getM('3-2'), bracket, true)}
            <div className="h-[100px] invisible"></div>
          </div>
          {/* Round 4 */}
          <div className="flex flex-col justify-around gap-2 shrink-0">
            {renderMatchCard(getM('4-1'), bracket, true)}
          </div>
        </div>
      );
    }
    return null;
  };

  const getFinalStandings = (bracket) => {
    const finalMatch = bracket.find(m => m.round === Math.max(...bracket.map(r => r.round)));
    if (!finalMatch || !finalMatch.winnerId) return [];

    const standings = [];
    standings.push(getTeam(finalMatch.winnerId));
    standings.push(getTeam(finalMatch.loserId));

    const maxRound = finalMatch.round;
    for (let r = maxRound - 1; r >= 1; r--) {
      const roundLosers = bracket.filter(m => m.round === r && m.loserId).map(m => getTeam(m.loserId)).filter(Boolean);
      
      // Sort by regular season performance proxy (Wins, then score diff, then Elo)
      roundLosers.sort((a,b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (b.score_diff !== a.score_diff) return b.score_diff - a.score_diff;
        return b.elo - a.elo;
      });

      roundLosers.forEach(t => {
        if (!standings.find(s => s.id === t.id)) {
          standings.push(t);
        }
      });
    }
    return standings.filter(Boolean); // return all participated teams
  };


  const poData = playoffState[selectedLeague];
  if (!poData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500 gap-4">
        <Swords className="w-12 h-12 opacity-30" />
        <p className="text-lg font-bold">플레이오프가 아직 시작되지 않았습니다.</p>
        <p className="text-sm">P6 또는 P14 페이즈에 도달하면 자동으로 시작됩니다.</p>
      </div>
    );
  }

  const bracket = poData.bracket || [];
  const maxRound = Math.max(...bracket.map(m => m.round));
  const isTournamentFinished = bracket.every(m => m.winnerId);
  
  // Decide layout type
  const isTreeLayout = selectedLeague === 'L_NA' || selectedLeague === 'L_CN';
  const treeType = selectedLeague === 'L_NA' ? 'NA' : 'CN';

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* League selector */}
      <div className="flex gap-2 flex-wrap">
        {leaguesWithPO.map(lid => (
          <button
            key={lid}
            onClick={() => setSelectedLeague(lid)}
            className={"px-4 py-2 rounded-xl font-bold transition-all border text-sm " +
              (selectedLeague === lid
                ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-800'
              )}
          >
            {leagueNames[lid] || lid}
          </button>
        ))}
      </div>

      {/* Bracket display */}
      <div className="bg-slate-900/60 backdrop-blur-lg border border-white/5 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-1">
          <Crown className="w-6 h-6 text-yellow-400" />
          <h2 className="text-xl font-black text-white">{leagueNames[selectedLeague] || selectedLeague} 플레이오프</h2>
        </div>
        <p className="text-xs text-slate-400 mb-6 font-bold">
          현재 MD: {poData.currentMD || 0} / {Math.max(...bracket.map(m => Math.max(...(m.mdSchedule || [0]))))}
        </p>

        {isTreeLayout ? (
          <div className="w-full bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
            {renderTournamentTree(bracket, treeType)}
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {Array.from({ length: maxRound }, (_, i) => i + 1).map(roundNum => {
              const roundMatches = bracket.filter(m => m.round === roundNum);
              if (roundMatches.length === 0) return null;

              const roundLabels = { 1: '1라운드', 2: '2라운드', 3: '3라운드', 4: '4라운드', 5: '5라운드 (결승)' };
              const isFinalRound = roundNum === maxRound;

              return (
                <div key={roundNum}>
                  <div className="flex items-center gap-2 mb-3">
                    <ChevronRight className={"w-4 h-4 " + (isFinalRound ? 'text-yellow-400' : 'text-indigo-400')} />
                    <h3 className={"text-sm font-black " + (isFinalRound ? 'text-yellow-400' : 'text-slate-300')}>
                      {roundLabels[roundNum] || 'Round ' + roundNum}
                      <span className="text-slate-500 font-bold ml-2 text-[10px]">
                        ({roundMatches.length}경기)
                      </span>
                    </h3>
                  </div>
                  <div className={"grid gap-3 " + (roundMatches.length >= 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : roundMatches.length >= 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-lg')}>
                    {roundMatches.map(m => renderMatchCard(m, bracket))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Final Standings */}
      {isTournamentFinished && (
        <div className="bg-slate-900/80 border border-yellow-500/30 rounded-2xl p-6 shadow-2xl mt-4 animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <Medal className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-black text-white">시즌 최종 순위표</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {getFinalStandings(bracket).map((team, index) => {
              const isChampion = index === 0;
              const isRunnerUp = index === 1;
              return (
                <div key={team.id} className={`flex items-center gap-3 p-3 rounded-xl border ${isChampion ? 'bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-yellow-500/50' : isRunnerUp ? 'bg-slate-800 border-slate-500/50' : 'bg-slate-800/50 border-slate-700/50'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${isChampion ? 'bg-yellow-500 text-slate-900' : isRunnerUp ? 'bg-slate-300 text-slate-900' : 'bg-slate-700 text-slate-300'}`}>
                    {index + 1}
                  </div>
                  <span className="w-10 h-6 flex items-center justify-center rounded text-[10px] font-black shadow-sm flex-shrink-0" style={{ backgroundColor: team.colors.bg, color: team.colors.text }}>{team.abbr}</span>
                  <span className={`font-bold text-sm truncate ${isChampion ? 'text-yellow-400' : 'text-slate-200'}`}>{team.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
