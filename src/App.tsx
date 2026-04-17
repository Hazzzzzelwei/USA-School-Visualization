import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Users, GraduationCap, DollarSign, Ratio, MapPin } from 'lucide-react';
import { UNIVERSITIES, University } from './data';
import { USMap } from './USMap';

const SidebarSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="flex flex-col gap-3">
    <span className="text-[11px] uppercase tracking-widest text-color-text-muted font-bold">{title}</span>
    {children}
  </div>
);

const Checkbox: React.FC<{ label: string; checked: boolean; onChange: () => void }> = ({ label, checked, onChange }) => (
  <div 
    className="flex items-center gap-2.5 cursor-pointer py-1 group"
    onClick={onChange}
  >
    <div className={`w-4 h-4 border border-accent-sage rounded flex items-center justify-center transition-colors ${checked ? 'bg-accent-sage' : 'bg-white'}`}>
      {checked && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
    </div>
    <span className={`text-sm transition-colors ${checked ? 'text-text-main' : 'text-text-muted group-hover:text-text-main'}`}>
      {label}
    </span>
  </div>
);

const Slider: React.FC<{ label: string; value: number; min: number; max: number; unit: string; onChange: (v: number) => void }> = ({ label, value, min, max, unit, onChange }) => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-text-muted px-1">
      <span>{label}</span>
      <span className="text-accent-sage">{value}{unit}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      value={value} 
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1 bg-border-toned rounded-lg appearance-none cursor-pointer accent-accent-sage"
    />
  </div>
);

export default function App() {
  const [selectedUniId, setSelectedUniId] = useState<string | null>(null);
  
  // Filters
  const [showNational, setShowNational] = useState(true);
  const [showLAC, setShowLAC] = useState(true);
  
  const [maxSF, setMaxSF] = useState(20);
  const [maxAcceptance, setMaxAcceptance] = useState(30);
  const [maxTuition, setMaxTuition] = useState(70000);
  const [maxRankingNational, setMaxRankingNational] = useState(50);
  const [maxRankingLAC, setMaxRankingLAC] = useState(20);
  const [minStudents, setMinStudents] = useState(0);

  const [tuitionType, setTuitionType] = useState<'local' | 'intl'>('intl');

  // Field Visibility
  const [visibleFields, setVisibleFields] = useState({
    acceptance: true,
    enrollment: true,
    tuition: true,
    endowment: false,
    sfRatio: true,
    totalStudents: true,
    ranking: true,
  });

  const universitiesFiltered = useMemo(() => {
    return UNIVERSITIES.filter(uni => {
      if (!showNational && uni.type === 'National') return false;
      if (!showLAC && uni.type === 'LAC') return false;
      if (uni.sfRatio > maxSF) return false;
      if (uni.acceptanceRate > maxAcceptance) return false;
      
      if (uni.type === 'National') {
        if (uni.ranking > maxRankingNational) return false;
      } else if (uni.type === 'LAC') {
        if (uni.ranking > maxRankingLAC) return false;
      }

      if (uni.totalStudents < minStudents) return false;
      
      const tuition = tuitionType === 'intl' ? uni.tuitionIntl : uni.tuitionLocal;
      if (tuition > maxTuition) return false;

      return true;
    });
  }, [showNational, showLAC, maxSF, maxAcceptance, maxTuition, maxRankingNational, maxRankingLAC, minStudents, tuitionType]);

  const selectedUni = useMemo(() => 
    UNIVERSITIES.find(u => u.id === selectedUniId), [selectedUniId]
  );

  const toggleField = (field: keyof typeof visibleFields) => {
    setVisibleFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="flex h-screen w-screen bg-bg-cream text-text-main overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[360px] h-full bg-sidebar-bg border-r border-border-toned p-8 flex flex-col gap-9 overflow-y-auto custom-scrollbar">
        <div>
          <h1 className="text-2xl font-serif">The Academic Map</h1>
          <p className="text-[13px] text-text-muted italic mt-1 text-pretty">Exploring America's Top Tier Institutions</p>
        </div>

        <div className="flex flex-col gap-10">
          <SidebarSection title="Institution Type">
            <Checkbox label="National Universities" checked={showNational} onChange={() => setShowNational(!showNational)} />
            <Checkbox label="Liberal Arts Colleges" checked={showLAC} onChange={() => setShowLAC(!showLAC)} />
          </SidebarSection>

          <SidebarSection title="Threshold Filters">
            <Slider label="Max S/F Ratio" value={maxSF} min={1} max={20} unit=":1" onChange={setMaxSF} />
            <Slider label="Max Acceptance" value={maxAcceptance} min={1} max={30} unit="%" onChange={setMaxAcceptance} />
            <Slider label="Max National Rank" value={maxRankingNational} min={1} max={60} unit="" onChange={setMaxRankingNational} />
            <Slider label="Max LAC Rank" value={maxRankingLAC} min={1} max={25} unit="" onChange={setMaxRankingLAC} />
            <Slider label="Min Campus Size" value={minStudents} min={0} max={50000} unit="" onChange={setMinStudents} />
            
            <div className="mt-4 space-y-4 pt-4 border-t border-border-toned/30">
              <div className="p-1 bg-white/50 rounded-lg border border-border-toned">
                <div className="flex">
                  <button 
                    onClick={() => setTuitionType('intl')}
                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-tighter rounded-md transition-all ${tuitionType === 'intl' ? 'bg-accent-sage text-white shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                  >
                    International
                  </button>
                  <button 
                    onClick={() => setTuitionType('local')}
                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-tighter rounded-md transition-all ${tuitionType === 'local' ? 'bg-accent-sage text-white shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                  >
                    Local
                  </button>
                </div>
              </div>
              <Slider label="Max Fees ($)" value={maxTuition} min={5000} max={70000} unit="" onChange={setMaxTuition} />
            </div>
          </SidebarSection>

          <SidebarSection title="Interface Options">
            <Checkbox label="Show US News Rank" checked={visibleFields.ranking} onChange={() => toggleField('ranking')} />
            <Checkbox label="Show Acceptance" checked={visibleFields.acceptance} onChange={() => toggleField('acceptance')} />
            <Checkbox label="Show S/F Ratio" checked={visibleFields.sfRatio} onChange={() => toggleField('sfRatio')} />
          </SidebarSection>
        </div>

        <div className="mt-auto pt-8 text-[11px] text-text-muted opacity-60 border-t border-border-toned/30 leading-relaxed">
          Interactive map enabled: Scroll to Zoom, Drag to Pan.<br />
          Institutional rankings per US News 2024.
        </div>
      </aside>

      {/* Main Map Area */}
      <main className="flex-1 relative p-8 h-full">
        <div className="w-full h-full map-container rounded-[32px] border border-border-toned overflow-hidden">
          <USMap 
            universities={universitiesFiltered} 
            selectedId={selectedUniId} 
            onSelect={setSelectedUniId} 
          />
        </div>

        {/* Info Board */}
        <AnimatePresence>
          {selectedUni && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: 20 }}
              className="absolute top-12 right-12 w-[420px] bg-white rounded-[3rem] shadow-[0_30px_90px_rgba(51,51,51,0.18)] border border-border-toned overflow-hidden z-20 flex flex-col"
            >
              <div className="h-52 w-full relative">
                <img 
                  src={selectedUni.image} 
                  alt={selectedUni.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <button 
                  onClick={() => setSelectedUniId(null)}
                  className="absolute top-6 right-6 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 p-2 rounded-full backdrop-blur-md transition-all text-2xl leading-none"
                >
                  ×
                </button>

                <div className="absolute top-6 left-6 h-12 w-12 bg-white rounded-full p-2 shadow-xl flex items-center justify-center overflow-hidden border border-white">
                  <img src={selectedUni.logo} alt="logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>

                <div className="absolute bottom-7 left-9 right-9 flex flex-col">
                  <span className="text-[10px] text-white/90 uppercase tracking-[0.35em] font-bold mb-1.5">
                    {selectedUni.type === 'National' ? 'National University' : 'Liberal Arts College'} • RANK #{selectedUni.ranking}
                  </span>
                  <h2 className="text-white text-3xl font-serif leading-tight">{selectedUni.name}</h2>
                </div>
              </div>

              <div className="p-9 space-y-9 max-h-[calc(100vh-340px)] overflow-y-auto custom-scrollbar">
                {/* Motto & Basics */}
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5 text-xs text-accent-sage font-bold bg-accent-sage/5 w-fit px-4 py-1.5 rounded-full border border-accent-sage/10">
                    <MapPin size={14} className="text-accent-clay" />
                    {selectedUni.location}
                  </div>
                  <p className="text-[14px] text-text-muted italic leading-relaxed border-l-4 border-accent-clay/40 pl-4 font-serif">
                    {selectedUni.motto}
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-y-7 gap-x-6 py-8 border-y border-border-toned/50">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-text-muted flex items-center gap-1.5 font-bold">
                      <Ratio size={12} strokeWidth={2.5} className="text-accent-clay" /> S/F Ratio
                    </span>
                    <span className="font-serif text-[20px] text-accent-sage">{selectedUni.sfRatio}:1</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-text-muted flex items-center gap-1.5 font-bold">
                      <GraduationCap size={12} strokeWidth={2.5} className="text-accent-clay" /> Acceptance
                    </span>
                    <span className="font-serif text-[20px] text-accent-sage">{selectedUni.acceptanceRate}%</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-text-muted flex items-center gap-1.5 font-bold">
                      <Users size={12} strokeWidth={2.5} className="text-accent-clay" /> Campus Pop.
                    </span>
                    <span className="font-serif text-[20px] text-accent-sage">{selectedUni.totalStudents.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-text-muted flex items-center gap-1.5 font-bold">
                      <DollarSign size={12} strokeWidth={2.5} className="text-accent-clay" /> {tuitionType === 'intl' ? 'Intl' : 'Local'} Fee
                    </span>
                    <span className="font-serif text-[20px] text-accent-sage">
                      ${(tuitionType === 'intl' ? selectedUni.tuitionIntl : selectedUni.tuitionLocal).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Narrative Info */}
                <div className="space-y-8">
                  <div>
                    <span className="text-[11px] uppercase font-bold tracking-[0.2em] text-text-muted block mb-3 px-1">Institutional Vibe</span>
                    <p className="text-sm text-text-main leading-relaxed bg-sidebar-bg/20 p-6 rounded-[2rem] border border-border-toned/50 font-sans shadow-inner">
                      {selectedUni.vibe}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase font-bold tracking-[0.2em] text-text-muted block mb-3 px-1">Something Special</span>
                    <p className="text-sm text-text-main leading-relaxed bg-sidebar-bg/20 p-6 rounded-[2rem] border border-border-toned/50 font-sans shadow-inner">
                      {selectedUni.special}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase font-bold tracking-[0.2em] text-text-muted block mb-4 px-1">Undergraduate Majors</span>
                    <div className="space-y-6">
                      {Array.from(new Set(selectedUni.majors.map(m => m.category))).map(category => (
                        <div key={category} className="space-y-2">
                          <span className="text-[10px] uppercase tracking-wider text-accent-sage font-bold px-1 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent-clay" />
                            {category}
                          </span>
                          <div className="flex flex-wrap gap-1.5 pl-1">
                            {selectedUni.majors.filter(m => m.category === category).map(major => (
                              <span 
                                key={major.name} 
                                className="px-3 py-1.5 bg-white border border-border-toned text-text-main text-[11px] font-medium rounded-lg shadow-sm hover:border-accent-clay transition-colors"
                              >
                                {major.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <a 
                  href={selectedUni.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-accent-sage text-white px-4 py-5 rounded-[1.5rem] text-[15px] font-bold hover:bg-[#555949] transition-all group mt-2 shadow-lg shadow-accent-sage/20 active:scale-[0.98]"
                >
                  Visit Official Website
                  <ExternalLink size={16} className="opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-1 transition-transform" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
