import React, { useState } from 'react';
import { Info, Calendar, Search } from 'lucide-react';

export default function InfoView({ seasonHistory }) {
  const [selectedSeason, setSelectedSeason] = useState(seasonHistory.length > 0 ? seasonHistory[seasonHistory.length - 1].name : '');
  const [searchTerm, setSearchTerm] = useState('');

  const currentSeasonData = seasonHistory.find(s => s.name === selectedSeason);
  
  let groupedTeams = {};
  if (currentSeasonData) {
    const searchLower = searchTerm.toLowerCase();
    const filtered = currentSeasonData.teams.filter(t => 
      t.name.toLowerCase().includes(searchLower) || 
      t.abbr.toLowerCase().includes(searchLower) ||
      t.league_id.toLowerCase().includes(searchLower)
    );
    
    filtered.forEach(team => {
      const lg = team.league_id.replace('L_', '');
      if (!groupedTeams[lg]) groupedTeams[lg] = [];
      groupedTeams[lg].push(team);
    });
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in h-[calc(100vh-200px)]">
      <div className="bg-slate-900/60 backdrop-blur-lg border border-white/5 rounded-2xl p-6 shadow-2xl flex-1 flex flex-col overflow-hidden">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-3 text-white">
            <Info className="w-6 h-6 text-indigo-400" /> 시즌 기록실 (아카이브)
          </h2>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="팀명, 리그 등 검색..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-800 text-sm text-white pl-9 pr-4 py-2 rounded-lg border border-slate-700 focus:border-indigo-500 outline-none w-64 transition-colors"
              />
            </div>
            
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg">
              <Calendar className="w-4 h-4 text-slate-400" />
              <select 
                value={selectedSeason} 
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="bg-transparent text-white font-bold outline-none cursor-pointer text-sm"
              >
                {seasonHistory.map(s => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1 relative bg-transparent pr-2">
          {!currentSeasonData && (
            <div className="text-center text-slate-500 mt-20 flex flex-col items-center gap-4 bg-slate-950/50 p-10 rounded-xl border border-slate-800">
              <Info className="w-12 h-12 opacity-30" />
              <p>아직 종료된 시즌(오프닝/레귤러) 기록이 없습니다.</p>
              <p className="text-sm">페이즈가 진행되어 시즌이 전환될 때 자동으로 기록이 저장됩니다.</p>
            </div>
          )}
          {currentSeasonData && Object.keys(groupedTeams).length === 0 && (
            <div className="text-center text-slate-500 mt-20">
              검색 결과가 없습니다.
            </div>
          )}
          {currentSeasonData && Object.keys(groupedTeams).sort().map(leagueName => (
             <div key={leagueName} className="mb-8 bg-slate-950/50 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                <div className="bg-indigo-950/40 border-b border-indigo-900/50 px-4 py-3 flex items-center gap-2">
                   <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
                   <h3 className="font-black text-indigo-100 text-lg">{leagueName} <span className="text-xs text-indigo-400 font-bold ml-2">({groupedTeams[leagueName].length} teams)</span></h3>
                </div>
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-900/80">
                    <tr>
                      <th className="px-4 py-3 text-center">전체 순위</th>
                      <th className="px-4 py-3">팀명(약칭)</th>
                      <th className="px-4 py-3 text-center">경기</th>
                      <th className="px-4 py-3 text-center">승</th>
                      <th className="px-4 py-3 text-center">패</th>
                      <th className="px-4 py-3 text-center">세트득실</th>
                      <th className="px-4 py-3 text-center">세트득</th>
                      <th className="px-4 py-3 text-center">세트실</th>
                      <th className="px-4 py-3 text-center">점수득실</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedTeams[leagueName].map(team => (
                      <tr key={team.id} className="border-b border-white/5 hover:bg-slate-800/80 transition-colors">
                        <td className="px-4 py-2.5 font-black text-slate-500 text-center text-lg">{team.rank}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-3">
                            <span className="w-10 text-center py-1 rounded shadow-sm text-xs font-black truncate" style={{ backgroundColor: team.colors.bg, color: team.colors.text }}>{team.abbr}</span>
                            <span className="font-bold text-white text-sm">{team.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-center text-slate-300 font-bold">{team.match_count}</td>
                        <td className="px-4 py-2.5 text-center text-green-400 font-black">{team.wins}</td>
                        <td className="px-4 py-2.5 text-center text-red-400 font-bold">{team.losses}</td>
                        <td className="px-4 py-2.5 text-center font-black text-white">{(team.set_wins - team.set_losses) > 0 ? `+${team.set_wins - team.set_losses}` : team.set_wins - team.set_losses}</td>
                        <td className="px-4 py-2.5 text-center text-slate-400">{team.set_wins}</td>
                        <td className="px-4 py-2.5 text-center text-slate-400">{team.set_losses}</td>
                        <td className="px-4 py-2.5 text-center text-slate-500">{team.score_diff > 0 ? `+${team.score_diff}` : team.score_diff}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
