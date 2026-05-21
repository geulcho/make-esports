import React, { useState } from 'react';
import { Trophy, Swords, ChevronRight, Crown, Shield } from 'lucide-react';

export default function PlayoffView({ teams, playoffState, LEAGUES }) {
  const leagueNames = {
    L_KR: '한국 (LCK)', L_NA: '북미 (LCS)', L_CN: '중국 (LPL)', L_NEU: '북유럽', L_WEU: '서유럽',
    L_RU: '러시아', L_DE: '독일', L_TW: '대만', L_SEU: '남유럽', L_BR: '브라질',
    L_EEU: '동유럽', L_SEA: '동남아', L_JP: '일본', L_SA: '남미', L_TR: '터키', L_MEAF: '중동/아프리카'
  };

  const leaguesWithPO = LEAGUES.filter(lid => playoffState[lid]);
  const [selectedLeague, setSelectedLeague] = useState(leaguesWithPO[0] || 'L_KR');

  const getTeam = (id) => teams.find(t => t.id === id);

  const getResolvedTeamId = (seed, bracket) => {
    if (!seed) return null;
    if (typeof seed === 'number') return null; // static seed - already resolved at init
    if (typeof seed === 'string' && seed.includes('.')) {
      const [matchId, outcome] = seed.split('.');
      const refMatch = bracket.find(m => m.id === matchId);
      if (!refMatch) return null;
      if (outcome === 'winner') return refMatch.winnerId || null;
      if (outcome === 'loser') return refMatch.loserId || null;
    }
    return null;
  };

  const renderMatchCard = (match, bracket) => {
    let teamAId = match.teamAId;
    let teamBId = match.teamBId;

    // Resolve dynamic references if not yet assigned
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

    const seedLabelA = match.seedLabel_A || '';
    const seedLabelB = match.seedLabel_B || '';

    return (
      <div key={match.id} className={"border rounded-xl p-3 transition-all " + cardBorder + " " + cardBg}>
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
                <span className="w-10 h-6 flex items-center justify-center rounded text-[10px] font-black shadow-sm flex-shrink-0" style={{ backgroundColor: teamA.colors.bg, color: teamA.colors.text }}>{teamA.abbr}</span>
                <span className="font-bold text-sm text-white truncate">{teamA.name}</span>
                {isWinnerA && <Trophy className="w-4 h-4 text-yellow-400 ml-auto flex-shrink-0" />}
              </>
            ) : (
              <span className="text-slate-500 text-xs font-bold italic">{seedLabelA || 'TBD'}</span>
            )}
          </div>

          {/* Score */}
          <div className="flex-shrink-0 w-16 text-center">
            {isDone ? (
              <span className="font-black text-lg text-white">{match.score || '-'}</span>
            ) : (
              <span className="text-slate-600 font-bold text-xs">VS</span>
            )}
          </div>

          {/* Team B */}
          <div className={"flex items-center gap-2 flex-1 min-w-0 justify-end " + (isDone && !isWinnerB ? 'opacity-35' : '')}>
            {teamB ? (
              <>
                {isWinnerB && <Trophy className="w-4 h-4 text-yellow-400 mr-auto flex-shrink-0" />}
                <span className="font-bold text-sm text-white truncate">{teamB.name}</span>
                <span className="w-10 h-6 flex items-center justify-center rounded text-[10px] font-black shadow-sm flex-shrink-0" style={{ backgroundColor: teamB.colors.bg, color: teamB.colors.text }}>{teamB.abbr}</span>
              </>
            ) : (
              <span className="text-slate-500 text-xs font-bold italic">{seedLabelB || 'TBD'}</span>
            )}
          </div>
        </div>
      </div>
    );
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
                <div className={"grid gap-3 " + (roundMatches.length >= 4 ? 'grid-cols-1 md:grid-cols-2' : roundMatches.length >= 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-lg')}>
                  {roundMatches.map(m => renderMatchCard(m, bracket))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
