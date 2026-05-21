import React from 'react';
import { LineChart, Trophy } from 'lucide-react';
import coeffsData from '../data/league_coefficients.json';

export default function LeagueCoefficientsView() {
  const leagues = coeffsData.leagues || [];

  return (
    <div className="flex flex-col gap-6 animate-fade-in h-[calc(100vh-200px)]">
      <div className="bg-slate-900/60 backdrop-blur-lg border border-white/5 rounded-2xl p-6 shadow-2xl flex-1 flex flex-col overflow-hidden">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-3 text-white">
            <LineChart className="w-6 h-6 text-indigo-400" /> 전 세계 리그 파워 랭킹 (League Coefficients)
          </h2>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1 border border-slate-800 rounded-xl relative bg-slate-950/50">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900 sticky top-0 z-10 shadow-md">
              <tr>
                <th className="px-6 py-4 rounded-tl-lg text-center">Rank</th>
                <th className="px-6 py-4">League</th>
                <th className="px-6 py-4 text-center">Teams</th>
                <th className="px-6 py-4 text-center">Avg Elo</th>
                <th className="px-6 py-4 text-center">Top 4 Elo Sum</th>
                <th className="px-6 py-4 text-center rounded-tr-lg">Coefficient Pts</th>
              </tr>
            </thead>
            <tbody>
              {leagues.map((league, idx) => (
                <tr key={league.league_id} className="border-b border-white/5 hover:bg-slate-800/80 transition-colors">
                  <td className="px-6 py-4 font-black text-slate-500 text-center text-lg">{league.rank}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-black">
                        {league.league_id.replace('L_', '')}
                      </div>
                      <div className="font-bold text-white text-base">{league.league_id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-slate-300">{league.team_count}</td>
                  <td className="px-6 py-4 text-center font-medium text-slate-400">{league.average_elo.toFixed(1)}</td>
                  <td className="px-6 py-4 text-center font-medium text-slate-400">{league.top4_elo_sum}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="font-black text-yellow-400 text-lg">{league.coefficient_points.toFixed(1)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {leagues.length === 0 && (
            <div className="text-center text-slate-500 mt-20">데이터가 없습니다.</div>
          )}
        </div>

      </div>
    </div>
  );
}
