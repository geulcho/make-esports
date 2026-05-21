import React, { useState } from 'react';
import { Trophy, Globe2, BarChart3, LineChart, Target, Info, ChevronDown, Swords, Zap, MapPin } from 'lucide-react';

export default function GNB({ activeTab, setActiveTab }) {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setOpenDropdown(null);
  };

  // Simple top-level tabs (no dropdown)
  const simpleTabs = [
    { id: 'clubRank', label: '클럽 랭킹', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'natRank', label: '국대 랭킹', icon: <Target className="w-4 h-4" /> },
    { id: 'coeff', label: '리그 계수', icon: <LineChart className="w-4 h-4" /> },
    { id: 'info', label: '시즌 기록실', icon: <Info className="w-4 h-4" /> },
  ];

  const isClubActive = ['club', 'continental_emea', 'continental_apac', 'continental_amer'].includes(activeTab);
  const isNatActive = activeTab === 'national';
  const isIntlActive = ['intl_mm', 'intl_wm', 'intl_vsc', 'intl_we'].includes(activeTab);

  return (
    <div className="w-full bg-slate-900/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-white tracking-wider">ESP SIM PRO</span>
        </div>
        
        <div className="flex items-center gap-1">
          
          {/* 클럽 리그 (Dropdown) */}
          <div className="relative"
            onMouseEnter={() => setOpenDropdown('club')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button
              className={"flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all " +
                (isClubActive ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-white/5')}
            >
              <Trophy className="w-4 h-4" /> 클럽 리그 <ChevronDown className="w-3 h-3" />
            </button>
            {openDropdown === 'club' && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-[100] animate-fade-in">
                <button onClick={() => handleTabClick('club')} className={"w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-2 transition-colors " + (activeTab === 'club' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white')}>
                  <MapPin className="w-4 h-4" /> 지역 리그
                </button>
                <div className="mx-3 my-1 border-t border-slate-700/50"></div>
                <p className="px-4 py-1.5 text-[10px] text-slate-500 uppercase font-bold">대륙 대회</p>
                <button onClick={() => handleTabClick('continental_emea')} className={"w-full text-left px-4 py-2 text-sm font-bold flex items-center gap-2 transition-colors " + (activeTab === 'continental_emea' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white')}>
                  <Globe2 className="w-3.5 h-3.5" /> EMEA
                </button>
                <button onClick={() => handleTabClick('continental_apac')} className={"w-full text-left px-4 py-2 text-sm font-bold flex items-center gap-2 transition-colors " + (activeTab === 'continental_apac' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white')}>
                  <Globe2 className="w-3.5 h-3.5" /> APAC
                </button>
                <button onClick={() => handleTabClick('continental_amer')} className={"w-full text-left px-4 py-2 text-sm font-bold flex items-center gap-2 transition-colors " + (activeTab === 'continental_amer' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white')}>
                  <Globe2 className="w-3.5 h-3.5" /> AMER
                </button>
              </div>
            )}
          </div>

          {/* 국가대항전 (Simple) */}
          <button
            onClick={() => handleTabClick('national')}
            className={"flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all " +
              (isNatActive ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-white/5')}
          >
            <Swords className="w-4 h-4" /> 국가대항전
          </button>

          {/* 국제대회 (Dropdown) */}
          <div className="relative"
            onMouseEnter={() => setOpenDropdown('intl')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button
              className={"flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all " +
                (isIntlActive ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-white/5')}
            >
              <Globe2 className="w-4 h-4" /> 국제대회 <ChevronDown className="w-3 h-3" />
            </button>
            {openDropdown === 'intl' && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-[100] animate-fade-in">
                <p className="px-4 py-1.5 text-[10px] text-slate-500 uppercase font-bold">클럽</p>
                <button onClick={() => handleTabClick('intl_mm')} className={"w-full text-left px-4 py-2 text-sm font-bold flex items-center gap-2 transition-colors " + (activeTab === 'intl_mm' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white')}>
                  <Trophy className="w-3.5 h-3.5" /> MM (Mid-Season Major)
                </button>
                <button onClick={() => handleTabClick('intl_wm')} className={"w-full text-left px-4 py-2 text-sm font-bold flex items-center gap-2 transition-colors " + (activeTab === 'intl_wm' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white')}>
                  <Trophy className="w-3.5 h-3.5" /> WM (World Major)
                </button>
                <button onClick={() => handleTabClick('intl_vsc')} className={"w-full text-left px-4 py-2 text-sm font-bold flex items-center gap-2 transition-colors " + (activeTab === 'intl_vsc' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white')}>
                  <Zap className="w-3.5 h-3.5" /> VSC (Victory Super Cup)
                </button>
                <div className="mx-3 my-1 border-t border-slate-700/50"></div>
                <p className="px-4 py-1.5 text-[10px] text-slate-500 uppercase font-bold">국가대표</p>
                <button onClick={() => handleTabClick('intl_we')} className={"w-full text-left px-4 py-2 text-sm font-bold flex items-center gap-2 transition-colors " + (activeTab === 'intl_we' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white')}>
                  <Globe2 className="w-3.5 h-3.5" /> WE (World Esports)
                </button>
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-white/10 mx-1" />

          {/* Simple tabs */}
          {simpleTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={"flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all " +
                (activeTab === tab.id
                  ? 'bg-indigo-500/20 text-indigo-400'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
