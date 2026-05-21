import React from 'react';
import { Activity, Star, Newspaper, Trophy, TrendingUp, Zap, TrendingDown, Swords } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ClubView({
  teams, selectedLeague, setSelectedLeague, LEAGUES,
  favorites, toggleFavorite, news, history,
  setSelectedMatch, eloHistory, visibleGraphTeams, setVisibleGraphTeams
}) {

  const getStreakBadge = (streak) => {
    if (streak > 0) return <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-[10px] font-bold">{streak}W</span>;
    if (streak < 0) return <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-[10px] font-bold">{Math.abs(streak)}L</span>;
    return <span className="px-2 py-1 rounded bg-gray-500/20 text-gray-400 text-[10px] font-bold">-</span>;
  };

  const getFilteredTeams = (div = null) => {
    let list = [];
    if (selectedLeague === "FAVORITES") {
      list = teams.filter(t => favorites.includes(t.id) && t.league_id !== undefined); // only clubs
    } else {
      list = teams.filter(t => t.league_id === selectedLeague && (!div || t.division === div));
    }
    return list.sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      const setDiffA = a.set_wins - a.set_losses;
      const setDiffB = b.set_wins - b.set_losses;
      if (setDiffB !== setDiffA) return setDiffB - setDiffA;
      if (b.set_wins !== a.set_wins) return b.set_wins - a.set_wins;
      if (b.score_diff !== a.score_diff) return b.score_diff - a.score_diff;
      return b.elo - a.elo;
    });
  };

  const renderTable = (filteredTeams, title) => (
    <div className="flex-1 flex flex-col min-h-0 relative rounded-xl border border-white/5 bg-slate-900/40">
      {title && <div className="px-3 py-2 bg-slate-800 text-xs font-bold text-slate-300 border-b border-white/5">{title}</div>}
      <div className="overflow-y-auto custom-scrollbar flex-1">
        {filteredTeams.length === 0 && (
          <div className="text-center text-slate-500 mt-10 p-4">
            팀이 없습니다.
          </div>
        )}
        {filteredTeams.length > 0 && (
          <table className="w-full text-xs text-left whitespace-nowrap">
            <thead className="text-[10px] text-slate-400 uppercase bg-slate-800/90 backdrop-blur-md sticky top-0 z-10">
              <tr>
                <th className="px-2 py-3 rounded-tl-lg text-center">순위</th>
                <th className="px-2 py-3">팀명(약칭)</th>
                <th className="px-2 py-3 text-center">경기</th>
                <th className="px-2 py-3 text-center">승</th>
                <th className="px-2 py-3 text-center">패</th>
                <th className="px-2 py-3 text-center">세트득실</th>
                <th className="px-2 py-3 text-center">세트득</th>
                <th className="px-2 py-3 text-center">세트실</th>
                <th className="px-2 py-3 text-center">점수득실</th>
                <th className="px-2 py-3 text-center rounded-tr-lg">연승</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeams.map((team, idx) => (
                <tr key={team.id} className={`border-b border-white/5 hover:bg-slate-800/60 transition-colors ${idx < (filteredTeams.length >= 12 ? 6 : 4) ? 'bg-indigo-900/40 border-l-4 border-indigo-500' : 'border-l-4 border-transparent'}`}>
                  <td className="px-2 py-3 font-black text-slate-500 text-center">{idx + 1}</td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleFavorite(team.id)} className="focus:outline-none transition-transform hover:scale-110">
                        <Star className={`w-3 h-3 ${favorites.includes(team.id) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} />
                      </button>
                      <span className="px-2 py-0.5 rounded shadow-sm font-bold truncate max-w-[100px]" style={{ backgroundColor: team.colors.bg, color: team.colors.text }}>{team.abbr}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-center text-slate-300 font-bold">{team.match_count}</td>
                  <td className="px-2 py-3 text-center text-green-400 font-black">{team.wins}</td>
                  <td className="px-2 py-3 text-center text-red-400 font-bold">{team.losses}</td>
                  <td className="px-2 py-3 text-center font-black text-white">{(team.set_wins - team.set_losses) > 0 ? `+${team.set_wins - team.set_losses}` : team.set_wins - team.set_losses}</td>
                  <td className="px-2 py-3 text-center text-slate-400">{team.set_wins}</td>
                  <td className="px-2 py-3 text-center text-slate-400">{team.set_losses}</td>
                  <td className="px-2 py-3 text-center text-slate-500">{team.score_diff > 0 ? `+${team.score_diff}` : team.score_diff}</td>
                  <td className="px-2 py-3 text-center">{getStreakBadge(team.streak)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  const graphTeams = getFilteredTeams(); // for graph, just take all from league

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      {/* Left: Standings Table */}
      <div className="lg:col-span-5 flex flex-col gap-4 max-h-[700px]">
        <div className="bg-slate-900/60 backdrop-blur-lg border border-white/5 rounded-2xl p-5 shadow-2xl flex-1 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-white">
              <Activity className="w-5 h-5 text-pink-400" /> 순위표 
            </h2>
            <select 
              value={selectedLeague} 
              onChange={(e) => setSelectedLeague(e.target.value)}
              className="bg-slate-800 text-white text-sm font-bold rounded-lg px-3 py-1.5 border border-slate-700 outline-none focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="FAVORITES">⭐ My Favorites</option>
              {LEAGUES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          
          {selectedLeague === 'L_NA' ? (
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
              {renderTable(getFilteredTeams('EAST'), 'EAST DIVISION')}
              {renderTable(getFilteredTeams('WEST'), 'WEST DIVISION')}
            </div>
          ) : selectedLeague === 'L_CN' ? (
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
              {renderTable(getFilteredTeams('DRAGON'), 'DRAGON DIVISION')}
              {renderTable(getFilteredTeams('PHOENIX'), 'PHOENIX DIVISION')}
            </div>
          ) : (
            renderTable(getFilteredTeams())
          )}
        </div>
      </div>

      {/* Middle: News Feed */}
      <div className="lg:col-span-3 flex flex-col gap-4 max-h-[700px]">
        <div className="bg-slate-900/60 backdrop-blur-lg border border-white/5 rounded-2xl p-5 shadow-2xl flex-1 flex flex-col overflow-hidden">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
            <Newspaper className="w-5 h-5 text-blue-400" /> 투데이 핫이슈
          </h2>
          <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
            {news.map(item => (
              <div key={item.id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex gap-3 animate-fade-in-up">
                <div className="mt-1">
                  {item.type === 'info' && <Trophy className="w-4 h-4 text-slate-400" />}
                  {item.type === 'streak' && <TrendingUp className="w-4 h-4 text-green-400" />}
                  {item.type === 'upset' && <Zap className="w-4 h-4 text-yellow-400" />}
                  {item.type === 'cold' && <TrendingDown className="w-4 h-4 text-red-400" />}
                  {item.type === 'meta' && <Activity className="w-4 h-4 text-indigo-400" />}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Match History */}
      <div className="lg:col-span-4 flex flex-col gap-4 max-h-[700px]">
        <div className="bg-slate-900/60 backdrop-blur-lg border border-white/5 rounded-2xl p-5 shadow-2xl flex-1 flex flex-col overflow-hidden">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
            <Swords className="w-5 h-5 text-orange-400" /> 페이즈별 매치 결과
          </h2>
          <div className="flex flex-col gap-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
            {history.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-50">
                <Swords className="w-12 h-12 mb-3" />
                <p>진행된 경기가 없습니다</p>
              </div>
            )}
            {history.map((phaseMatches, i) => {
              const relevantMatches = phaseMatches.filter(m => {
                if (!m.teamA.league_id) return false; // not club matches
                if (selectedLeague === 'FAVORITES') return favorites.includes(m.teamA.id) || favorites.includes(m.teamB.id);
                return m.teamA.league_id === selectedLeague;
              });

              if (relevantMatches.length === 0) return null;

              const displayMatches = relevantMatches.slice(0, 15);

              return (
                <div key={i} className="animate-fade-in-up" style={{animationDelay: `${i * 50}ms`}}>
                  <div className="text-xs font-black text-indigo-400 mb-2 uppercase tracking-wider">{displayMatches[0].phase}</div>
                  <div className="flex flex-col gap-2">
                    {displayMatches.map(match => (
                      <div 
                        key={match.id} 
                        onClick={() => setSelectedMatch(match)}
                        className="group bg-slate-800/40 hover:bg-slate-800/80 border border-white/5 rounded-xl p-3 cursor-pointer transition-all hover:border-indigo-500/30"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2 w-[40%]">
                            <span className="px-2 py-0.5 rounded shadow-sm text-xs font-black truncate max-w-[80px]" style={{ backgroundColor: match.teamA.colors.bg, color: match.teamA.colors.text, opacity: match.winnerId === match.teamA.id ? 1 : 0.4 }}>
                              {match.teamA.abbr}
                            </span>
                          </div>
                          <div className="flex gap-2 items-center bg-slate-900/80 px-2 py-1 rounded-md text-sm font-black border border-white/5 whitespace-nowrap">
                            <span className={match.winnerId === match.teamA.id ? 'text-white' : 'text-slate-500'}>{match.setWinsA}</span>
                            <span className="text-slate-600 text-[10px] mx-1">{match.format || 'Bo3'}</span>
                            <span className={match.winnerId === match.teamB.id ? 'text-white' : 'text-slate-500'}>{match.setWinsB}</span>
                          </div>
                          <div className="flex items-center gap-2 w-[40%] justify-end">
                            <span className="px-2 py-0.5 rounded shadow-sm text-xs font-black truncate max-w-[80px]" style={{ backgroundColor: match.teamB.colors.bg, color: match.teamB.colors.text, opacity: match.winnerId === match.teamB.id ? 1 : 0.4 }}>
                              {match.teamB.abbr}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {relevantMatches.length > 15 && (
                      <div className="text-xs text-center text-slate-500 bg-slate-800/20 py-2 rounded-lg cursor-default">
                        + 그 외 {relevantMatches.length - 15} 경기 생략됨
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Elo Rating Graph Section (Full Width Bottom) */}
      <div className="lg:col-span-12 mt-2 bg-slate-900/60 backdrop-blur-lg border border-white/5 rounded-2xl p-5 shadow-2xl relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5 text-indigo-400" /> Elo 변동 추이 
          </h2>
          <div className="flex gap-2 flex-wrap justify-end max-w-[70%] overflow-auto max-h-12 custom-scrollbar">
            {graphTeams.map(team => (
              <button 
                key={team.id}
                onClick={() => setVisibleGraphTeams(prev => ({ ...prev, [team.id]: !prev[team.id] }))}
                className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all border ${visibleGraphTeams[team.id] ? 'opacity-100' : 'opacity-30 grayscale'}`}
                style={{ backgroundColor: team.colors.bg, color: team.colors.text, borderColor: team.colors.text }}
              >
                {team.abbr}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={eloHistory} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="phase" stroke="#94a3b8" tickFormatter={(tick) => `P${tick}`} />
              <YAxis stroke="#94a3b8" domain={['dataMin - 30', 'dataMax + 30']} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
              {graphTeams.map((team) => (
                visibleGraphTeams[team.id] && (
                  <Line 
                    key={team.id} 
                    type="monotone" 
                    dataKey={team.id} 
                    name={team.name} 
                    stroke={team.colors.bg === '#000000' || team.colors.bg === '#1a1a1a' ? '#888888' : team.colors.bg} 
                    strokeWidth={3}
                    dot={{ fill: team.colors.bg, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                )
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
