import React, { useState } from 'react';
import { Globe2, Swords, Zap, Trophy, ChevronRight } from 'lucide-react';

export default function NationalView({ natTeams, natGroups, meaStage1, meaStage2, meaFinal, iqMatchups }) {
  const [selectedRegion, setSelectedRegion] = useState('EU');

  const REGIONS = [
    { id: 'EU', label: '유럽 (EU)' },
    { id: 'APAC', label: '아태 (APAC)' },
    { id: 'AMERICA', label: '아메리카' },
    { id: 'MEAF', label: 'MEA 예선' },
    { id: 'IQ', label: 'IQ (최종 예선)' }
  ];

  const getTeam = (id) => natTeams.find(t => t.id === id);

  // ===== 조별리그 순위표 (EU, APAC, AMERICA) =====
  const renderTable = (groupName, teamsList) => {
    const sorted = [...teamsList].sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      const sdA = a.set_wins - a.set_losses;
      const sdB = b.set_wins - b.set_losses;
      if (sdB !== sdA) return sdB - sdA;
      if (b.set_wins !== a.set_wins) return b.set_wins - a.set_wins;
      if (b.score_diff !== a.score_diff) return b.score_diff - a.score_diff;
      return b.elo - a.elo;
    });

    const getRowClass = (idx) => {
      if (idx < 2) return 'bg-blue-950/60';
      if (idx === 2) return 'bg-emerald-950/60';
      return '';
    };
    const getBorderClass = (idx) => {
      if (idx < 2) return 'border-l-4 border-l-blue-500';
      if (idx === 2) return 'border-l-4 border-l-emerald-500';
      return 'border-l-4 border-l-transparent';
    };

    return (
      <div key={groupName} className="flex-1 min-w-[400px] flex flex-col min-h-0 bg-slate-900/60 border border-white/5 rounded-xl overflow-hidden mb-6 shadow-xl">
        <div className="px-4 py-3 bg-slate-800 text-sm font-bold text-indigo-400 border-b border-white/5 flex justify-between items-center">
          <span>{groupName}</span>
          <div className="flex gap-3 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-blue-500 inline-block"></span>본선 직행</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"></span>IQ 진출</span>
          </div>
        </div>
        <div className="overflow-y-auto custom-scrollbar">
          <table className="w-full text-xs text-left whitespace-nowrap">
            <thead className="text-[10px] text-slate-400 uppercase bg-slate-800/90 backdrop-blur-md sticky top-0 z-10">
              <tr>
                <th className="px-2 py-3 text-center">#</th>
                <th className="px-2 py-3">국가</th>
                <th className="px-2 py-3 text-center">경기</th>
                <th className="px-2 py-3 text-center">승</th>
                <th className="px-2 py-3 text-center">패</th>
                <th className="px-2 py-3 text-center">세트득실</th>
                <th className="px-2 py-3 text-center">세트득</th>
                <th className="px-2 py-3 text-center">세트실</th>
                <th className="px-2 py-3 text-center">점수득실</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((team, idx) => (
                <tr key={team.id} className={"border-b border-white/5 hover:bg-slate-800/80 transition-colors " + getRowClass(idx) + " " + getBorderClass(idx)}>
                  <td className="px-2 py-3 font-black text-slate-500 text-center">{idx + 1}</td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded shadow-sm font-bold truncate max-w-[80px]" style={{ backgroundColor: team.colors.bg, color: team.colors.text }}>{team.abbr}</span>
                      <span className="font-medium text-slate-200">{team.name}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-center text-slate-300 font-bold">{team.match_count}</td>
                  <td className="px-2 py-3 text-center text-green-400 font-black">{team.wins}</td>
                  <td className="px-2 py-3 text-center text-red-400 font-bold">{team.losses}</td>
                  <td className="px-2 py-3 text-center font-black text-white">{(team.set_wins - team.set_losses) > 0 ? '+' + (team.set_wins - team.set_losses) : (team.set_wins - team.set_losses)}</td>
                  <td className="px-2 py-3 text-center text-slate-400">{team.set_wins}</td>
                  <td className="px-2 py-3 text-center text-slate-400">{team.set_losses}</td>
                  <td className="px-2 py-3 text-center text-slate-500">{team.score_diff > 0 ? '+' + team.score_diff : team.score_diff}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ===== 매치업 카드 렌더링 (공통) =====
  const renderMatchupCard = (matchup, label) => {
    const teamA = getTeam(matchup.teamAId);
    const teamB = getTeam(matchup.teamBId);
    if (!teamA || !teamB) return null;
    
    const isDone = !!matchup.winnerId;
    const isWinnerA = matchup.winnerId === teamA.id;
    const isWinnerB = matchup.winnerId === teamB.id;

    return (
      <div key={matchup.teamAId + '-' + matchup.teamBId} className={"bg-slate-800/80 border rounded-lg p-3 flex items-center gap-3 " + (isDone ? 'border-slate-700' : 'border-indigo-500/40 shadow-lg shadow-indigo-500/10')}>
        {/* Team A */}
        <div className={"flex items-center gap-2 flex-1 " + (isDone && !isWinnerA ? 'opacity-40' : '')}>
          <span className="w-10 h-6 flex items-center justify-center rounded text-[10px] font-black shadow-sm" style={{ backgroundColor: teamA.colors.bg, color: teamA.colors.text }}>{teamA.abbr}</span>
          <span className="font-bold text-sm text-white truncate">{teamA.name}</span>
          {isWinnerA && <Trophy className="w-4 h-4 text-yellow-400 ml-auto flex-shrink-0" />}
        </div>
        
        {/* Score / VS */}
        <div className="flex-shrink-0 w-20 text-center">
          {isDone ? (
            <span className="font-black text-lg text-white">{matchup.score}</span>
          ) : (
            <span className="text-slate-500 font-bold text-xs">VS</span>
          )}
        </div>
        
        {/* Team B */}
        <div className={"flex items-center gap-2 flex-1 justify-end " + (isDone && !isWinnerB ? 'opacity-40' : '')}>
          {isWinnerB && <Trophy className="w-4 h-4 text-yellow-400 mr-auto flex-shrink-0" />}
          <span className="font-bold text-sm text-white truncate">{teamB.name}</span>
          <span className="w-10 h-6 flex items-center justify-center rounded text-[10px] font-black shadow-sm" style={{ backgroundColor: teamB.colors.bg, color: teamB.colors.text }}>{teamB.abbr}</span>
        </div>
      </div>
    );
  };

  // ===== MEA 대진표 =====
  const renderMEA = () => {
    return (
      <div className="flex flex-col gap-8 w-full mx-auto h-full overflow-y-auto custom-scrollbar pr-4">
        
        {/* Stage 1 */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-3 mb-1">
            <Swords className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-black text-white">1차 예선 (Stage 1)</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4 font-bold">하위 8팀 출전 • Bo5 단판 승부 • 4팀 생존</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {meaStage1.map((mu, i) => renderMatchupCard(mu, "S1-" + i))}
          </div>
          {meaStage1.length === 0 && <p className="text-slate-500 text-sm">아직 대진이 생성되지 않았습니다.</p>}
        </div>

        {/* Stage 2 */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-3 mb-1">
            <Swords className="w-5 h-5 text-pink-400" />
            <h3 className="text-lg font-black text-white">2차 예선 (Stage 2)</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4 font-bold">상위 12팀 + 1차 통과 4팀 (총 16팀) • Bo5 단판 승부 • 8팀 생존</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {meaStage2.map((mu, i) => renderMatchupCard(mu, "S2-" + i))}
          </div>
          {meaStage2.length === 0 && <p className="text-slate-500 text-sm">1차 예선 완료 후 대진이 생성됩니다.</p>}
        </div>

        {/* Final Stage (Single Elimination) */}
        <div className="bg-slate-900/60 border border-indigo-500/30 rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-3 mb-1">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-black text-white">최종 예선 (Single Elimination)</h3>
          </div>
          <p className="text-xs text-slate-400 mb-5 font-bold">생존 8팀 • Bo5 단판 토너먼트 (시드 배정)</p>
          
          {meaFinal.length > 0 ? (
            <div className="flex flex-col gap-6">
              {/* Quarterfinals */}
              {meaFinal.filter(m => m.round === 'QF').length > 0 && (
                <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                  <h4 className="text-slate-400 font-black mb-3 text-sm">8강 (Quarterfinals)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {meaFinal.filter(m => m.round === 'QF').map((mu, i) => renderMatchupCard(mu, "QF-" + i))}
                  </div>
                </div>
              )}
              
              {/* Semifinals */}
              {meaFinal.filter(m => m.round === 'SF').length > 0 && (
                <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                  <h4 className="text-slate-400 font-black mb-3 text-sm">4강 (Semifinals)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {meaFinal.filter(m => m.round === 'SF').map((mu, i) => renderMatchupCard(mu, "SF-" + i))}
                  </div>
                </div>
              )}
              
              {/* Final */}
              {meaFinal.filter(m => m.round === 'F').length > 0 && (
                <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 p-4 rounded-lg border border-yellow-500/30">
                  <h4 className="text-yellow-400 font-black mb-3 text-sm">결승 (Final)</h4>
                  <div className="max-w-md">
                    {meaFinal.filter(m => m.round === 'F').map((mu, i) => renderMatchupCard(mu, "F-" + i))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">2차 예선 완료 후 8강 대진이 생성됩니다.</p>
          )}
        </div>
      </div>
    );
  };

  // ===== IQ 대진표 =====
  const renderIQ = () => {
    if (!iqMatchups || iqMatchups.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
          <Zap className="w-12 h-12 opacity-30" />
          <p className="text-lg font-bold">아직 대륙간 최종 예선(IQ) 참가 팀이 결정되지 않았습니다.</p>
          <p className="text-sm">P11 페이즈에 돌입하면 자동으로 대진이 편성됩니다.</p>
        </div>
      );
    }

    // Collect all participating team IDs
    const allIQTeamIds = new Set();
    iqMatchups.forEach(mu => { allIQTeamIds.add(mu.teamAId); allIQTeamIds.add(mu.teamBId); });

    return (
      <div className="flex flex-col gap-6 w-full mx-auto h-full overflow-y-auto custom-scrollbar pr-4">
        <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30 rounded-xl p-5 shadow-lg">
          <h3 className="text-xl font-black text-white flex items-center gap-2 mb-2"><Zap className="w-6 h-6 text-yellow-400" /> Interregional Qualifier (대륙간 최종 예선)</h3>
          <p className="text-sm text-slate-300 mb-4">각 권역 조별 예선 3위 팀 9개 + MEA 준우승 1팀 = 10팀 참가 • 같은 권역끼리 만나지 않는 무작위 대진 • Bo5 단판 승부</p>
          
          {/* 진출 팀 목록 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[...allIQTeamIds].map(id => {
              const t = getTeam(id);
              if (!t) return null;
              return (
                <div key={id} className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-2">
                  <span className="w-8 h-5 flex items-center justify-center rounded text-[10px] font-bold" style={{ backgroundColor: t.colors.bg, color: t.colors.text }}>{t.abbr}</span>
                  <span className="text-xs font-bold text-slate-300">{t.name}</span>
                  <span className="text-[10px] text-slate-500 font-bold ml-1">{t.region}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Matchup cards */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-lg">
          <h4 className="text-indigo-400 font-black mb-4 text-sm">대진표 (총 {iqMatchups.length}경기)</h4>
          <div className="flex flex-col gap-3">
            {iqMatchups.map((mu, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-slate-500 font-black text-sm w-16 flex-shrink-0">MD {i + 1}</span>
                <div className="flex-1">{renderMatchupCard(mu, "IQ-" + i)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const currentGroups = natGroups[selectedRegion] || {};

  return (
    <div className="flex flex-col gap-6 animate-fade-in h-[calc(100vh-200px)]">
      <div className="flex gap-3 flex-wrap">
        {REGIONS.map(reg => (
          <button
            key={reg.id}
            onClick={() => setSelectedRegion(reg.id)}
            className={"px-5 py-2.5 rounded-xl font-bold transition-all border flex items-center gap-2 text-sm " +
              (selectedRegion === reg.id 
                ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' 
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-800'
              )}
          >
            {reg.id === 'IQ' ? <Zap className="w-4 h-4" /> : <Globe2 className="w-4 h-4" />} {reg.label}
          </button>
        ))}
      </div>

      <div className="bg-slate-900/60 backdrop-blur-lg border border-white/5 rounded-2xl p-6 shadow-2xl flex-1 flex flex-col overflow-hidden">
        {selectedRegion === 'MEAF' ? renderMEA() :
         selectedRegion === 'IQ' ? renderIQ() : (
          <div className="flex flex-wrap gap-4 overflow-y-auto custom-scrollbar pb-4 h-full">
            {Object.keys(currentGroups).map(groupName => {
              const teamIds = currentGroups[groupName];
              if (!teamIds) return null;
              const tList = teamIds.map(id => natTeams.find(t => t.id === id)).filter(Boolean);
              return renderTable((selectedRegion === 'AMERICA' ? "Sub-Region: " : "Group ") + groupName, tList);
            })}
          </div>
        )}
      </div>
    </div>
  );
}
