'use client';

import { useState, useCallback, useMemo } from 'react';
import { Flame } from 'lucide-react';
import SidebarLeft from './SidebarLeft.jsx';
import RightSidebar from './RightSidebar.jsx';
import HackathonFeed from './HackathonFeed.jsx';
import { useAppContext } from './AppContext.jsx';
import { useI18n } from '@/lib/i18n/context';

function LandingPage({ setCurrentPage: _setCurrentPage }) {
    const {
        isSidebarCollapsed,
        isMobileSidebarVisible,
        handleSidebarToggle,
        activeHackathon,
        setActiveHackathon,
        activeTechFilter,
        setActiveTechFilter,
        setIsSignInModalOpen,
        showToast
    } = useAppContext();

    const { t } = useI18n();

    const [filter, setFilter] = useState('all');

    // Memoize filter buttons configuration using i18n
    const filterButtons = useMemo(() => [
        { label: t('filters.all'), value: 'all' },
        { label: t('filters.upcoming'), value: 'upcoming' },
        { label: t('filters.ongoing'), value: 'ongoing' },
        { label: t('filters.remote'), value: 'remote' },
        { label: t('filters.prize'), value: 'prize' },
        { label: t('filters.bookmarked'), value: 'bookmarked' }
    ], [t]);

    // Handle filter change
    const handleFilterChange = useCallback((filterValue, filterName) => {
        setFilter(filterValue);
        showToast(`📊 Filter: ${filterName}`);
    }, [showToast]);

    return (
        <div className="flex flex-1 overflow-hidden relative">
            <SidebarLeft
                isMobileVisible={isMobileSidebarVisible}
                isCollapsed={isSidebarCollapsed}
                handleSidebarToggle={handleSidebarToggle}
                activeHackathon={activeHackathon}
                setActiveHackathon={setActiveHackathon}
                showToast={showToast}
            />

            <main className="main-content flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-5xl space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 m-0 p-0 border-none">
                                <Flame className="h-6 w-6 text-amber-400" aria-hidden="true" />
                                {t('hero.title')}
                                <span className="hud-tag text-[10px]">{t('hero.badge')}</span>
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">
                                {t('hero.subtitle')}
                            </p>
                        </div>
                    </div>

                    {activeHackathon && activeHackathon.id !== 0 && (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-cyan-950/40 to-violet-950/30 border border-cyan-500/20 text-xs text-cyan-300">
                            <div className="flex items-center gap-2.5">
                                <span className="radar-ping">
                                    <span className="radar-ping-ring bg-cyan-400" />
                                    <span className="radar-ping-dot bg-cyan-400" />
                                </span>
                                <span className="font-mono text-slate-300 text-xs">
                                    Sprint Channel: <strong className="text-white">{activeHackathon.name}</strong>
                                </span>
                                <span className="hud-tag text-[9px] uppercase tracking-wider">{activeHackathon.status}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                                    Track: {activeHackathon.category}
                                </span>
                                <button
                                    onClick={() => setActiveHackathon({ id: 0, slug: 'all', name: 'All Sprints (Global)', status: 'ALL', category: 'all' })}
                                    className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
                                    title="Clear channel filter"
                                >
                                    View All ×
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTechFilter && (
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-400 font-mono">Tech Stack Filter:</span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-mono text-xs font-semibold">
                                {activeTechFilter}
                                <button
                                    onClick={() => setActiveTechFilter(null)}
                                    className="hover:text-white transition ml-1 cursor-pointer"
                                    title="Clear tech filter"
                                >
                                    ×
                                </button>
                            </span>
                        </div>
                    )}

                    <div className="filter-buttons flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar" role="group" aria-label="Filter hackathons">
                        {filterButtons.map(({ label, value }) => {
                            const isActive = filter === value;
                            return (
                                <button
                                    key={value}
                                    className={`filter-btn relative px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wide transition-all ${
                                        isActive
                                            ? 'active text-cyan-300 font-semibold border border-cyan-400/50 bg-cyan-500/10 shadow-[0_0_15px_rgba(0,245,255,0.15)]'
                                            : 'text-slate-400 hover:text-white bg-[#0C0F1D]/80 border border-white/5 hover:border-white/10'
                                    }`}
                                    data-filter={value}
                                    onClick={() => handleFilterChange(value, label)}
                                    aria-pressed={isActive}
                                    aria-label={`Filter by ${label}`}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>

                    <HackathonFeed
                        currentFilter={filter}
                        activeHackathon={activeHackathon}
                        showToast={showToast}
                        showSignInModal={() => setIsSignInModalOpen(true)}
                    />
                </div>
            </main>

            <RightSidebar />
        </div>
    );
}

export default LandingPage;
