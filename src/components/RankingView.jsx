import React, { useState } from 'react';
import { BarChart3, Target, Search } from 'lucide-react';

export default function RankingView({ title, type, teams, icon }) {
  const [searchTerm, setSearchTerm] = useState('');

  const sortedTeams = [...teams].sort((a, b) => b.elo - a.elo);
  
  const filteredTeams = sortedTeams.filter(t => 
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.abbr?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in h-[calc(100vh-200px)]">
      <div className="bg-slate-900/60 backdrop-blur-lg border border-white/5 rounded-2xl p-6 shadow-2xl flex-1 flex flex-col overflow-hidden">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-3 text-white">
            {icon} {title}
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="팀명 또는 약칭 검색..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 text-sm text-white pl-9 pr-4 py-2 rounded-lg border border-slate-700 focus:border-indigo-500 outline-none w-64"
            />
          </div>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1 border border-slate-800 rounded-xl relative bg-slate-950/50">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900 sticky top-0 z-10 shadow-md">
              <tr>
                <th className="px-4 py-4 rounded-tl-lg w-16 text-center">Rank</th>
                <th className="px-4 py-4 w-20 text-center">Tier</th>
                <th className="px-4 py-4">Team</th>
                <th className="px-4 py-4 text-center">Elo Rating</th>
                {type === 'club' && <th className="px-4 py-4 text-center">League</th>}
                {type === 'national' && <th className="px-4 py-4 text-center">Region</th>}
                <th className="px-4 py-4 text-center">LAN</th>
                <th className="px-4 py-4 text-center">TMF</th>
                <th className="px-4 py-4 text-center">MAC</th>
                <th className="px-4 py-4 text-center">MEC</th>
                <th className="px-4 py-4 text-center rounded-tr-lg">DRF</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeams.map((team, idx) => {
                const getTierColor = (t) => {
                  if(t?.startsWith('S')) return 'text-purple-400';
                  if(t?.startsWith('A')) return 'text-pink-400';
                  if(t?.startsWith('B')) return 'text-indigo-400';
                  if(t?.startsWith('C')) return 'text-blue-400';
                  return 'text-slate-400';
                };

                return (
                  <tr key={team.id} className="border-b border-white/5 hover:bg-slate-800/80 transition-colors">
                    <td className="px-4 py-3 font-black text-slate-500 text-center text-lg">{idx + 1}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={"font-black text-lg " + getTierColor(team.tier)}>{team.tier || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="w-10 text-center py-1 rounded shadow-sm text-xs font-black truncate" style={{ backgroundColor: team.colors.bg, color: team.colors.text }}>{team.abbr}</span>
                        <span className="font-bold text-white">{team.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-black text-yellow-400 text-lg">{team.elo}</span>
                    </td>
                    {type === 'club' && <td className="px-4 py-3 text-center text-slate-400 font-bold">{team.league_id?.replace('L_', '')}</td>}
                    {type === 'national' && <td className="px-4 py-3 text-center text-slate-400 font-bold">{team.region}</td>}
                    <td className="px-4 py-3 text-center font-medium text-slate-300">{team.stats?.LAN}</td>
                    <td className="px-4 py-3 text-center font-medium text-slate-300">{team.stats?.TMF}</td>
                    <td className="px-4 py-3 text-center font-medium text-slate-300">{team.stats?.MAC}</td>
                    <td className="px-4 py-3 text-center font-medium text-slate-300">{team.stats?.MEC}</td>
                    <td className="px-4 py-3 text-center font-medium text-emerald-400">{team.stats?.DRF}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredTeams.length === 0 && (
            <div className="text-center text-slate-500 mt-20">
              검색 결과가 없습니다.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
