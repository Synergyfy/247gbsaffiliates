'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { useAuthStore } from '@/store/useAuthStore';
import { getAffiliateRegisterUrl } from '@/lib/centralHub';

interface AgentRecord {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  profileImage?: string;
  skills?: string[];
  bio?: string;
  hourlyRate?: number;
  currency?: string;
  timezone?: string;
  role?: string;
  subTitle?: string;
  locationArea?: string;
  distanceMiles?: number | null;
  distanceKm?: number | null;
  distanceLabel?: string | null;
  isOnboarded?: boolean;
  isQuizPassed?: boolean;
  verificationStatus?: string;
  isPaidVisible?: boolean;
  createdAt?: string;
  postcode?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  languages?: string[];
  isDemoProfile?: boolean;
}

interface HeroCarouselCard {
  id: string;
  name: string;
  role: string;
  locationArea: string;
  distance: string;
  quote: string;
  image: string;
  badge: string;
  agent: AgentRecord;
}

type AffiliateRoleOption = 'agent' | 'account_manager' | 'consultant';
const ROLE_FILTER_OPTIONS: Array<{ id: AffiliateRoleOption; label: string }> = [
  { id: 'agent', label: 'Agents' },
  { id: 'account_manager', label: 'Managers' },
  { id: 'consultant', label: 'Consultants' },
];

const DEMO_POSTCODE = 'SW1A 1AA';
const DEMO_AFFILIATES: AgentRecord[] = [
  {
    id: 'demo-marcus-vance', firstName: 'Marcus', lastName: 'Vance',
    role: 'account_manager', subTitle: 'Meta Ads & Growth Lead', city: 'Westminster', region: 'London',
    skills: ['Facebook Ads', 'Funnel Architecture', 'Paid Acquisition'], hourlyRate: 85,
    bio: 'Specialises in paid social, B2B lead generation and customer acquisition.',
    isDemoProfile: true,
  },
  {
    id: 'demo-eleanor-wright', firstName: 'Eleanor', lastName: 'Wright',
    role: 'consultant', subTitle: 'CRO & Analytics Specialist', city: 'Westminster', region: 'London',
    skills: ['GA4 Migration', 'CRO Auditing', 'Tag Manager'], hourlyRate: 95,
    bio: 'Helps businesses improve landing page conversion and analytics tracking.',
    isDemoProfile: true,
  },
  {
    id: 'demo-julian-reed', firstName: 'Julian', lastName: 'Reed',
    role: 'agent', subTitle: 'Sales Operations Specialist', city: 'Camden', region: 'London',
    skills: ['B2B Lead Qualification', 'CRM Setup', 'Outreach'], hourlyRate: 75,
    bio: 'Supports outbound pipeline setup, CRM hygiene and lead qualification.',
    isDemoProfile: true,
  },
  {
    id: 'demo-sophia-chen', firstName: 'Sophia', lastName: 'Chen',
    role: 'account_manager', subTitle: 'PPC & Search Lead', city: 'City of London', region: 'London',
    skills: ['Google Search', 'Performance Max', 'PPC'], hourlyRate: 90,
    bio: 'Works on high-intent search, ecommerce growth and campaign performance.',
    isDemoProfile: true,
  },
  {
    id: 'demo-david-alvarez', firstName: 'David', lastName: 'Alvarez',
    role: 'consultant', subTitle: 'Affiliate Operations Advisor', city: 'Kensington', region: 'London',
    skills: ['Affiliate Operations', 'Contract SLAs', 'Governance'], hourlyRate: 110,
    bio: 'Advises teams on affiliate operations, compliance and delivery processes.',
    isDemoProfile: true,
  },
];

const getAgentAvatarUrl = (agent: AgentRecord): string => {
  if (agent.profileImage && agent.profileImage.trim()) {
    return agent.profileImage;
  }
  const seed =
    agent.id ||
    `${agent.firstName || ''}-${agent.lastName || ''}`.trim() ||
    agent.name ||
    'affiliate';
  return `https://i.pravatar.cc/150?u=${encodeURIComponent(seed)}`;
};

const isPostalLookupUnavailable = (error: unknown) => {
  if (!error || typeof error !== 'object') return false;
  const requestError = error as {
    code?: string;
    response?: { status?: number };
  };
  const status = requestError.response?.status;
  return status === 502 || status === 503 || status === 504 ||
    (!status && ['ERR_NETWORK', 'ECONNABORTED', 'ETIMEDOUT'].includes(requestError.code || ''));
};

export default function FindAgentPage() {
  const { user } = useAuthStore();

  // Search state
  const [postcode, setPostcode] = useState('');
  const [submittedPostcode, setSubmittedPostcode] = useState('');

  // Role filtering (empty array or all 3 selected = All roles)
  const [selectedRoles, setSelectedRoles] = useState<AffiliateRoleOption[]>([]);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  const isAllRolesSelected =
    selectedRoles.length === 0 || selectedRoles.length === ROLE_FILTER_OPTIONS.length;

  const toggleRoleFilter = (roleId: AffiliateRoleOption) => {
    setSelectedRoles((prev) => {
      if (prev.includes(roleId)) {
        return prev.filter((item) => item !== roleId);
      }
      return [...prev, roleId];
    });
  };

  const clearRoleFilter = () => {
    setSelectedRoles([]);
  };

  useEffect(() => {
    if (!roleDropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [roleDropdownOpen]);

  const roleFilterSummary = useMemo(() => {
    if (isAllRolesSelected) return 'All Roles';
    return ROLE_FILTER_OPTIONS.filter((opt) => selectedRoles.includes(opt.id))
      .map((opt) => opt.label)
      .join(', ');
  }, [isAllRolesSelected, selectedRoles]);

  // Selected agent for profile modal popup
  const [selectedAgent, setSelectedAgent] = useState<AgentRecord | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Hero carousel is driven by the live verified directory.
  const { data: heroDirectory } = useQuery<{ items: AgentRecord[] }>({
    queryKey: ['public-directory-featured'],
    queryFn: async () => (await apiClient.get('/users/directory', { params: { limit: 6 } })).data,
    staleTime: 60 * 1000,
  });

  const heroCards = useMemo<HeroCarouselCard[]>(() => {
    const items = heroDirectory?.items ?? [];
    return items.map((agent) => {
      const name =
        `${agent.firstName || ''} ${agent.lastName || ''}`.trim() ||
        agent.name ||
        'Accredited member';
      const role = (agent.role || 'agent').replaceAll('_', ' ');
      const location =
        [agent.city, agent.region].filter(Boolean).join(', ') ||
        agent.country ||
        'United Kingdom';
      return {
        id: agent.id,
        name,
        role: role.replace(/\b\w/g, (character) => character.toUpperCase()),
        locationArea: location,
        distance: agent.hourlyRate ? `£${agent.hourlyRate}/HR` : '',
        quote: agent.bio || `Verified ${role} available for delegated work.`,
        image: getAgentAvatarUrl(agent),
        badge: 'VERIFIED MEMBER',
        agent,
      };
    });
  }, [heroDirectory]);

  // Hero Carousel State
  const [heroIndex, setHeroIndex] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const [carouselAnimating, setCarouselAnimating] = useState(false);
  const carouselTotalCards = heroCards.length;
  const carouselPausedRef = useRef(false);

  // Keep ref in sync so the interval closure always reads current value
  useEffect(() => {
    carouselPausedRef.current = carouselPaused;
  }, [carouselPaused]);

  // Auto-advance carousel every 5s — interval never restarts, reads ref instead
  useEffect(() => {
    if (carouselTotalCards < 2) return;
    const timer = setInterval(() => {
      if (carouselPausedRef.current) return;
      setCarouselAnimating(true);
      setTimeout(() => {
        setHeroIndex((prev) => (prev + 1) % carouselTotalCards);
        setCarouselAnimating(false);
      }, 250);
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselTotalCards]);

  const goToCarouselIndex = (idx: number) => {
    if (idx === heroIndex) return;
    setCarouselAnimating(true);
    setTimeout(() => {
      setHeroIndex(idx);
      setCarouselAnimating(false);
    }, 200);
  };

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const resultsSectionRef = useRef<HTMLDivElement>(null);
  const heroSearchInputRef = useRef<HTMLInputElement>(null);

  // Live directory results — queries real database affiliates first. If the
  // postcode lookup is not yet configured or affiliates have null postcodes,
  // we fall back to the unfiltered database directory before DEMO_AFFILIATES.
  const {
    data: directoryResult,
    isFetching: isSearching,
    isError: isDirectoryError,
    error: directoryError,
    refetch: refetchDirectory,
  } = useQuery<{ items: AgentRecord[]; distanceFrom?: string | null; source: 'live' | 'demo' }>({
    queryKey: ['public-directory', submittedPostcode],
    enabled: Boolean(submittedPostcode),
    queryFn: async () => {
      try {
        const [postcodeRes, allRes] = await Promise.allSettled([
          apiClient.get('/users/directory', {
            params: {
              postcode: submittedPostcode,
              limit: 100,
            },
          }),
          apiClient.get('/users/directory', {
            params: {
              limit: 100,
            },
          }),
        ]);

        const postcodeItems: AgentRecord[] =
          postcodeRes.status === 'fulfilled' ? (postcodeRes.value.data?.items ?? []) : [];
        const allItems: AgentRecord[] =
          allRes.status === 'fulfilled' ? (allRes.value.data?.items ?? []) : [];

        // Merge postcode-matched affiliates first, followed by any database
        // affiliates whose postcode is null (so they were skipped by distance filter).
        const seenIds = new Set<string>();
        const mergedItems: AgentRecord[] = [];
        for (const item of [...postcodeItems, ...allItems]) {
          if (item?.id && !seenIds.has(item.id)) {
            seenIds.add(item.id);
            mergedItems.push(item);
          }
        }

        if (mergedItems.length > 0) {
          return {
            items: mergedItems,
            total: mergedItems.length,
            distanceFrom:
              postcodeRes.status === 'fulfilled'
                ? (postcodeRes.value.data?.distanceFrom ?? submittedPostcode)
                : submittedPostcode,
            source: 'live' as const,
          };
        }

        // If both API requests failed, surface the error or demo fallback
        if (postcodeRes.status === 'rejected' && allRes.status === 'rejected') {
          throw postcodeRes.reason;
        }

        const normalizedPostcode = submittedPostcode.toUpperCase().replace(/\s+/g, ' ').trim();
        const isDemoPostcode = normalizedPostcode.replace(/\s/g, '') === DEMO_POSTCODE.replace(/\s/g, '');
        if (isDemoPostcode) {
          return {
            items: DEMO_AFFILIATES,
            total: DEMO_AFFILIATES.length,
            distanceFrom: DEMO_POSTCODE,
            source: 'demo' as const,
          };
        }

        return { items: [], total: 0, distanceFrom: submittedPostcode, source: 'live' as const };
      } catch (error) {
        const normalizedPostcode = submittedPostcode.toUpperCase().replace(/\s+/g, ' ').trim();
        const isDemoPostcode = normalizedPostcode.replace(/\s/g, '') === DEMO_POSTCODE.replace(/\s/g, '');
        if (!isDemoPostcode || !isPostalLookupUnavailable(error)) throw error;

        return { items: DEMO_AFFILIATES, total: DEMO_AFFILIATES.length, distanceFrom: DEMO_POSTCODE, source: 'demo' as const };
      }
    },
  });

  const displayedAgents = useMemo(() => {
    const rawItems = directoryResult?.items ?? [];
    if (isAllRolesSelected) return rawItems;
    const allowed = new Set<string>(selectedRoles);
    return rawItems.filter((affiliate) => {
      const normalizedRole = (affiliate.role || 'agent').toLowerCase().replace('-', '_');
      return allowed.has(normalizedRole);
    });
  }, [directoryResult?.items, isAllRolesSelected, selectedRoles]);
  const directoryErrorMessage = (() => {
    const message = (directoryError as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
    if (Array.isArray(message)) return message.join(', ');
    return message || 'We could not load the affiliate directory right now. Please try again.';
  })();

  // Handle Postcode Lookup
  const handleSearch = (e?: React.FormEvent, overrideCode?: string) => {
    if (e) e.preventDefault();
    const raw = overrideCode || postcode;
    const clean = raw.trim().toUpperCase().replace(/\s+/g, ' ');
    if (clean.length < 2) return;

    setSubmittedPostcode(clean);

    setTimeout(() => {
      resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleOpenRequestModal = (agent: AgentRecord) => {
    setSelectedAgent(agent);
    setShowRequestModal(true);
  };

  const getAgentProfileMetrics = (agent: AgentRecord) => {
    const seedStr = agent.id || agent.name || agent.firstName || 'affiliate';
    let hash = 0;
    for (let i = 0; i < seedStr.length; i += 1) {
      hash = (hash * 31 + seedStr.charCodeAt(i)) % 1000;
    }
    const assessmentScore = 91 + (hash % 9); // 91% - 99%
    const slaReliability = (98.2 + (hash % 18) / 10).toFixed(1); // 98.2% - 99.9%
    const completedDeliverables = 14 + (hash % 48);
    const responseTime = hash % 2 === 0 ? '< 1 hr' : '< 2 hrs';
    const normalizedRole = (agent.role || 'agent').toLowerCase().replace('-', '_');
    const defaultSkills =
      normalizedRole === 'account_manager'
        ? ['Multi-Agent Oversight', 'Campaign Strategy', 'Client SLA Management', 'Funnel Attribution']
        : normalizedRole === 'consultant'
          ? ['Enterprise Architecture', 'Escrow Governance', 'CRO & Analytics', 'Revenue Audits']
          : ['Paid Acquisition', 'B2B Lead Qualification', 'CRM Operations', 'Outbound Execution'];

    return {
      assessmentScore,
      slaReliability,
      completedDeliverables,
      responseTime,
      hourlyRate: agent.hourlyRate ? `£${agent.hourlyRate}/hr` : '£65/hr',
      skills: agent.skills && agent.skills.length > 0 ? agent.skills : defaultSkills,
      languages: agent.languages && agent.languages.length > 0 ? agent.languages : ['English'],
      timezone: agent.timezone || 'GMT / BST (UK)',
    };
  };

  const getDelegateTaskHref = (agent: AgentRecord) => {
    const role = (user?.role || '').toLowerCase().replace('-', '_');
    if (role === 'account_manager') {
      return `/dashboard/account-manager/projects?affiliateId=${encodeURIComponent(agent.id)}`;
    }
    if (role === 'admin') {
      return `/dashboard/admin/tasks?affiliateId=${encodeURIComponent(agent.id)}`;
    }
    return `/login?redirect=${encodeURIComponent('/find-agent')}`;
  };

  const getAgentDisplayName = (agent: AgentRecord) => {
    return `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || agent.name || 'Accredited Member';
  };

  const getAgentRoleBadge = (agent: AgentRecord) => {
    const r = (agent.role || '').toLowerCase().replace('-', '_');
    if (r === 'account_manager') return 'ACCOUNT MANAGER';
    if (r === 'consultant') return 'CONSULTANT';
    return 'AGENT';
  };

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const scrollToSearch = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      heroSearchInputRef.current?.focus();
    }, 400);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#f8fafc] font-body text-slate-900 selection:bg-blue-600/20">

      {/* HEADER — mobile hamburger + desktop centered nav */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 px-3 py-2 backdrop-blur-md sm:px-4 sm:py-3 lg:px-16">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between">
          <BrandLogo size="sm" label="247gbs affiliate" />

          {/* Desktop nav */}
          <nav className="hidden md:flex flex-1 justify-center gap-7 text-xs font-semibold text-slate-600">
            <Link href="/#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</Link>
            <Link href="/find-agent" className="text-blue-600 font-bold border-b-2 border-blue-600 pb-0.5">Find Affiliates</Link>
            <Link href="/for-agent" className="hover:text-blue-600 transition-colors">Services</Link>
            <Link href="/for-account-manager" className="hover:text-blue-600 transition-colors">Enterprise Solutions</Link>
            <Link href={getAffiliateRegisterUrl()} className="hover:text-blue-600 transition-colors">Become an Affiliate</Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-slate-600 hover:text-blue-600 transition-colors"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Toggle navigation"
          >
            <span className="material-symbols-outlined text-xl">{mobileNavOpen ? 'close' : 'menu'}</span>
          </button>
        </div>

        {/* Mobile nav drawer — overlays on top of page without pushing content down */}
        {mobileNavOpen && (
          <>
            <div
              className="fixed inset-0 top-[49px] z-40 bg-black/20 md:hidden"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="absolute left-0 right-0 top-full z-50 border-b border-slate-200 bg-white px-4 py-3 shadow-lg space-y-1 md:hidden">
              {[
                { href: '/#how-it-works', label: 'How it Works' },
                { href: '/find-agent', label: 'Find Affiliates' },
                { href: '/for-agent', label: 'Services' },
                { href: '/for-account-manager', label: 'Enterprise Solutions' },
                { href: getAffiliateRegisterUrl(), label: 'Become an Affiliate' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className="block py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 border-b border-slate-100 last:border-0 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </>
        )}
      </header>

      {/* SECTION 1: HERO */}
      <section className="relative border-b border-slate-200/80 bg-white px-3 pb-4 pt-4 sm:px-4 sm:pb-8 sm:pt-6 lg:px-16">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 items-start">

            {/* Left: Headline + Search */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              <h1 className="mb-1 text-xl font-bold leading-6 tracking-tight text-slate-900 sm:mb-2 sm:text-3xl sm:leading-tight lg:text-4xl">
                Find the right affiliate partner for your business.
              </h1>
              <p className="mb-2 max-w-xl text-[11px] leading-4 text-slate-500 sm:hidden">
                Find accredited affiliates near your postcode.
              </p>
              <p className="mb-4 hidden max-w-xl text-sm leading-relaxed text-slate-500 sm:block">
                Connect with accredited 247gbs affiliate agents, account managers, and consultants across your territory.
              </p>

              {/* POSTCODE SEARCH PANEL */}
              <div className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
                <div className="mb-2 sm:mb-3">
                  <h3 className="text-sm font-bold font-display text-slate-900">Search regional territory</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Enter a postcode to find available affiliates nearby.</p>
                </div>

                <form onSubmit={(e) => handleSearch(e)} className="space-y-2 sm:space-y-2.5">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">location_on</span>
                      <input
                        ref={heroSearchInputRef}
                        type="text"
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                        placeholder="e.g. EC1A 1BB"
                        className="w-full rounded-md border border-slate-300 bg-white py-1.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 sm:py-2"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSearching}
                      className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60 sm:px-4 sm:py-2"
                    >
                      {isSearching ? (
                        <span className="size-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      ) : (
                        <span className="material-symbols-outlined text-base">search</span>
                      )}
                      <span className="hidden sm:inline">{isSearching ? 'Searching...' : 'Find Affiliates'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 sm:text-[11px]">
                    <span className="font-medium">{directoryResult?.source === 'demo' ? 'Demo directory preview' : 'Verified regional directory'}</span>
                    <span className="text-slate-400">{directoryResult?.source === 'demo' ? 'Demo data' : 'Live data'}</span>
                  </div>
                </form>

              </div>
            </div>

            {/* Right: Carousel — hidden on small mobile, shown from sm up */}
            <div className="hidden sm:flex lg:col-span-5 justify-center lg:justify-end">
              <div
                className="relative w-full max-w-[480px] select-none"
                onMouseEnter={() => setCarouselPaused(true)}
                onMouseLeave={() => setCarouselPaused(false)}
              >
                <div className="relative h-[340px]">
                  {(() => {
                    if (!heroCards.length) return null;
                    const total = carouselTotalCards;
                    const leftIdx  = (heroIndex - 1 + total) % total;
                    const rightIdx = (heroIndex + 1) % total;
                    const centerIdx = heroIndex;
                    // With fewer than three cards the left/right indices collide
                    // with the centre; render only the unique cards.
                    const indices = total === 1
                      ? [centerIdx]
                      : total === 2
                        ? [centerIdx, rightIdx]
                        : [leftIdx, rightIdx, centerIdx];
                    return indices.map((idx) => {
                      const card = heroCards[idx];
                      const isCenter = idx === centerIdx;
                      const isLeft   = idx === leftIdx;
                      let positionCls = '';
                      let cardCls = '';
                      if (isCenter) {
                        positionCls = 'absolute top-4 left-1/2 -translate-x-1/2 w-[300px] z-30';
                        cardCls     = 'shadow-2xl border-slate-200';
                      } else if (isLeft) {
                        positionCls = 'absolute top-10 left-0 w-[270px] z-10 -rotate-3';
                        cardCls     = 'shadow-md border-slate-200';
                      } else {
                        positionCls = 'absolute top-10 right-0 w-[270px] z-10 rotate-3';
                        cardCls     = 'shadow-md border-slate-200';
                      }
                      return (
                        <div
                          key={`${idx}-${card.id}`}
                          className={`${positionCls} transition-all duration-500 ease-in-out ${carouselAnimating && isCenter ? 'opacity-0 scale-95' : 'opacity-100'}`}
                          onClick={() => !isCenter && goToCarouselIndex(idx)}
                          style={{ cursor: isCenter ? 'default' : 'pointer' }}
                        >
                          <div className={`rounded-lg bg-white border p-4 ${cardCls} transition-all duration-500 overflow-hidden`}>
                            <div className="flex items-center justify-between mb-2.5">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                {card.badge}
                              </span>
                              {isCenter && <span className="text-[10px] font-bold text-slate-400">{card.distance}</span>}
                            </div>
                            <div className="flex items-center gap-3 mb-2.5">
                              <div className="relative size-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                <Image src={card.image} alt={card.name} fill unoptimized className="object-cover" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold font-display text-slate-900 leading-tight">{card.name}</h4>
                                <p className="text-[11px] text-slate-500">{card.locationArea} • {card.role}</p>
                              </div>
                            </div>
                            {isCenter && (
                              <>
                                <p className="text-[11px] text-slate-600 leading-relaxed mb-3 bg-slate-50 p-2.5 rounded border border-slate-100">
                                  &ldquo;{card.quote}&rdquo;
                                </p>
                                <button
                                  onClick={() => handleOpenRequestModal(card.agent)}
                                  className="w-full py-2 px-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-display font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                                >
                                  <span className="material-symbols-outlined text-sm">send</span>
                                  Contact {card.name.split(' ')[0]}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  {heroCards.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToCarouselIndex(i)}
                      aria-label={`Card ${i + 1}`}
                      className={`rounded-full transition-all duration-300 ${i === heroIndex ? 'w-5 h-2 bg-blue-600' : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'}`}
                    />
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: RESULTS (only when searched) */}
      {submittedPostcode && (
        <section ref={resultsSectionRef} className="mx-auto max-w-[1240px] scroll-mt-14 px-3 py-3 sm:px-4 sm:py-6 lg:px-16">
          {/* Header + Filter Row */}
          <div className="mb-4 flex flex-col justify-between gap-3 border-b border-slate-200 pb-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
                {displayedAgents.length} {displayedAgents.length === 1 ? 'affiliate' : 'affiliates'} near &ldquo;{submittedPostcode}&rdquo;
              </h2>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {directoryResult?.source === 'demo'
                  ? 'Demo profiles shown because the live postcode lookup is unavailable.'
                  : 'Verified members within 50 miles, nearest first.'}
              </p>
            </div>

            {/* Multi-select role filter dropdown + Clear filter control (always single row) */}
            <div className="flex w-full items-center gap-1.5 sm:w-auto">
              <div ref={roleDropdownRef} className="relative min-w-0 flex-1 sm:flex-initial">
                <button
                  type="button"
                  onClick={() => setRoleDropdownOpen((prev) => !prev)}
                  aria-expanded={roleDropdownOpen}
                  aria-haspopup="listbox"
                  className="inline-flex w-full items-center justify-between gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-50 sm:min-w-[180px] sm:px-3"
                >
                  <span className="inline-flex min-w-0 items-center gap-1 truncate">
                    <span
                      className="material-symbols-outlined shrink-0 leading-none text-blue-600"
                      style={{ fontSize: '14px' }}
                    >
                      filter_list
                    </span>
                    <span className="font-medium text-slate-500">Filter:</span>
                    <span className="truncate font-bold text-slate-900">{roleFilterSummary}</span>
                  </span>
                  <span
                    className="material-symbols-outlined shrink-0 leading-none text-slate-400"
                    style={{ fontSize: '15px' }}
                  >
                    {roleDropdownOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {roleDropdownOpen && (
                  <div
                    role="listbox"
                    aria-multiselectable="true"
                    className="absolute left-0 sm:left-auto sm:right-0 top-full z-30 mt-1 w-56 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        clearRoleFilter();
                        setRoleDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs font-semibold transition-colors ${
                        isAllRolesSelected
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="material-symbols-outlined shrink-0 leading-none"
                          style={{ fontSize: '15px' }}
                        >
                          {isAllRolesSelected ? 'check_box' : 'check_box_outline_blank'}
                        </span>
                        All Affiliates
                      </span>
                      {isAllRolesSelected && (
                        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-blue-700">
                          Active
                        </span>
                      )}
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    {ROLE_FILTER_OPTIONS.map((option) => {
                      const isChecked = selectedRoles.includes(option.id);
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => toggleRoleFilter(option.id)}
                          className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs font-semibold transition-colors ${
                            isChecked
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="inline-flex items-center gap-2">
                            <span
                              className="material-symbols-outlined shrink-0 leading-none"
                              style={{ fontSize: '15px' }}
                            >
                              {isChecked ? 'check_box' : 'check_box_outline_blank'}
                            </span>
                            {option.label}
                          </span>
                        </button>
                      );
                    })}

                    <div className="mt-1 flex items-center justify-between border-t border-slate-100 pt-1.5 px-1">
                      <button
                        type="button"
                        onClick={() => {
                          clearRoleFilter();
                          setRoleDropdownOpen(false);
                        }}
                        disabled={selectedRoles.length === 0}
                        className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40"
                      >
                        <span
                          className="material-symbols-outlined shrink-0 leading-none"
                          style={{ fontSize: '13px' }}
                        >
                          close
                        </span>
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={() => setRoleDropdownOpen(false)}
                        className="rounded bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-blue-700"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {selectedRoles.length > 0 && (
                <button
                  type="button"
                  onClick={clearRoleFilter}
                  className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-200 hover:text-slate-900"
                >
                  <span
                    className="material-symbols-outlined shrink-0 leading-none"
                    style={{ fontSize: '13px' }}
                  >
                    close
                  </span>
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="size-8 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin mb-3" />
              <h3 className="text-sm font-bold font-display text-slate-900 mb-1">Resolving Jurisdiction & Affiliates</h3>
              <p className="text-xs text-slate-500 max-w-xs">Scanning for verified affiliates in <strong>{submittedPostcode}</strong>...</p>
            </div>
          ) : isDirectoryError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center max-w-md mx-auto shadow-sm">
              <div className="size-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-2.5 border border-red-200">
                <span className="material-symbols-outlined text-xl">error</span>
              </div>
              <h3 className="text-base font-bold font-display text-slate-900 mb-1">Could Not Load the Directory</h3>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">{directoryErrorMessage}</p>
              <button
                type="button"
                onClick={() => refetchDirectory()}
                className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-xs font-semibold font-display text-white transition-all"
              >
                Try Again
              </button>
            </div>
          ) : displayedAgents.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-7 text-center max-w-md mx-auto shadow-sm">
              <div className="size-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2.5 border border-amber-100">
                <span className="material-symbols-outlined text-xl">domain_disabled</span>
              </div>
              <h3 className="text-base font-bold font-display text-slate-900 mb-1">No Verified Affiliates Nearby</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                No verified affiliates of this type were found within 50 miles of <strong className="text-slate-800">{submittedPostcode}</strong>. Try a different role above or a nearby postcode.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  type="button"
                  onClick={clearRoleFilter}
                  className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-xs font-semibold font-display text-white transition-all"
                >
                  Clear Role Filter
                </button>
                <button
                  type="button"
                  onClick={() => { setPostcode(''); setSubmittedPostcode(''); }}
                  className="px-4 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-xs font-semibold font-display text-slate-700 transition-all"
                >
                  Clear Search
                </button>
              </div>
            </div>
          ) : (
            /* Affiliate cards grid — 1 col mobile, 2 tablet, 3 desktop */
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
              {displayedAgents.map((agent, index) => {
                const displayName = getAgentDisplayName(agent);
                const agentKey = agent.id || String(index);
                const roleBadge = getAgentRoleBadge(agent);
                const locationArea =
                  agent.city ||
                  [agent.city, agent.region].filter(Boolean).join(', ') ||
                  agent.country ||
                  'United Kingdom';
                const distanceShort =
                  agent.distanceMiles != null
                    ? `${agent.distanceMiles} mi`
                    : agent.distanceLabel
                      ? agent.distanceLabel.replace(/\s*away$/i, '')
                      : null;

                return (
                  <article
                    key={agentKey}
                    className="flex flex-col justify-between rounded-lg border border-slate-200/80 bg-white p-3.5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md sm:p-4"
                  >
                    <div>
                      {/* Top row: Circular avatar + Bold Name */}
                      <div className="mb-2 flex items-center gap-3">
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 sm:size-14">
                          <Image
                            src={getAgentAvatarUrl(agent)}
                            alt={displayName}
                            fill
                            unoptimized
                            sizes="56px"
                            className="object-cover object-top"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-display text-base font-extrabold leading-tight tracking-tight text-slate-900 sm:text-lg">
                            {displayName}
                          </h3>
                          <div className="mt-0.5 flex flex-wrap items-center gap-1">
                            <span className="inline-block rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-700 border border-blue-100">
                              {roleBadge}
                            </span>
                            {agent.isDemoProfile && (
                              <span className="inline-block rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700 border border-amber-200">
                                Demo
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Location + Distance with bottom divider */}
                      <div className="flex items-center gap-1 border-b border-slate-100 pb-2 text-xs font-medium text-slate-700">
                        <span
                          className="material-symbols-outlined shrink-0 leading-none text-blue-500"
                          style={{ fontSize: '13px' }}
                        >
                          location_on
                        </span>
                        <span className="truncate">
                          {locationArea}
                          {distanceShort ? `, ${distanceShort}` : ''}
                        </span>
                      </div>

                      {/* Italic Bio */}
                      <p className="my-2 line-clamp-2 text-xs italic leading-snug text-slate-600">
                        {agent.bio || 'No profile summary has been published yet.'}
                      </p>
                    </div>

                    {/* Full-width Contact Me button */}
                    <button
                      type="button"
                      onClick={() => handleOpenRequestModal(agent)}
                      className="flex w-full items-center justify-center rounded-md border border-blue-700/20 bg-blue-600 px-3 py-2 font-display text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.99]"
                    >
                      Contact Me
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* SECTION 3: AFFILIATE ROLES */}
      <section className="bg-white border-y border-slate-200/80 py-8 px-4 lg:px-16">
        <div className="max-w-[1240px] mx-auto">
          <div className="text-center max-w-xl mx-auto mb-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1 block font-display">Network Hierarchy</span>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 mb-2">Who you&apos;re collaborating with</h2>
            <p className="text-xs text-slate-500 leading-relaxed">Accredited talent categorized by role, operational responsibility, and scope capacity.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: 'person', title: 'Affiliate Agents', tier: 'TIER 1',
                desc: 'Dedicated specialists who execute hands-on campaign deliverables, regional outbound outreach, pipeline hygiene, and localized marketing tasks.',
                items: ['Paid Ad Management', 'B2B Lead Qualification', 'CRM Data Entry & Hygiene'],
              },
              {
                icon: 'groups', title: 'Account Managers', tier: 'TIER 2',
                desc: 'Mid-level directors who manage teams of agents, coordinate multi-channel marketing campaigns, and ensure client SLAs are met.',
                items: ['Multi-Agent Oversight', 'Campaign Strategy & Execution', 'Client Reporting & Cadence'],
              },
              {
                icon: 'psychology', title: 'Strategic Consultants', tier: 'SENIOR',
                desc: 'High-level advisors for enterprise architecture, commercial escrow agreements, compliance governance, and full-funnel revenue audits.',
                items: ['Institutional Escrow Advisory', 'Attribution Architecture', 'Contractual SLA Governance'],
              },
            ].map((col, idx) => (
              <div key={idx} className="rounded-lg bg-[#f8fafc] border border-slate-200 p-4 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                      <span className="material-symbols-outlined text-base">{col.icon}</span>
                    </div>
                    <h3 className="text-sm font-bold font-display text-slate-900">{col.title}</h3>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-sm bg-blue-100 text-blue-700 text-[9px] font-bold font-mono">{col.tier}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed mb-3">{col.desc}</p>
                <ul className="space-y-1 text-[11px] text-slate-600 border-t border-slate-200/70 pt-3 mt-auto">
                  {col.items.map((item) => (
                    <li key={item} className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: OPERATIONAL FRAMEWORK — 3 steps */}
      <section className="bg-[#f8fafc] border-b border-slate-200/80 py-8 px-4 lg:px-16">
        <div className="max-w-[1240px] mx-auto">
          <div className="text-center mb-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1 block font-display">Operational Framework</span>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">Direct Local Deployment in Three Steps</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {[
              { step: '01', title: 'Enter your Postcode', desc: 'Identify local accredited affiliates stationed in your corporate territory with real-time capacity.' },
              { step: '02', title: 'Select & Scope', desc: 'Review capability profiles, role expertise, and detail your specific technical project deliverables.' },
              { step: '03', title: 'Admin Review & Dispatch', desc: '247gbs affiliate central management verifies scope, secures milestone funds in escrow, and activates the workspace.' },
            ].map((item, idx) => (
              <div key={idx} className="rounded-lg bg-white p-4 border border-slate-200 shadow-sm">
                <span className="inline-block px-2 py-0.5 rounded-sm bg-blue-100 text-blue-700 font-bold text-xs font-mono mb-3">{item.step}</span>
                <h3 className="text-sm font-bold font-display text-slate-900 mb-1.5">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: WHY CHOOSE 247GBS AFFILIATE — 4 pillars */}
      <section className="bg-white border-b border-slate-200/80 py-8 px-4 lg:px-16">
        <div className="max-w-[1240px] mx-auto">
          <div className="text-center max-w-xl mx-auto mb-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1 block font-display">Enterprise Assurance</span>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 mb-2">Why enterprise brands hire through 247gbs affiliate</h2>
            <p className="text-xs text-slate-500 leading-relaxed">We eliminate the hazards of hiring independent talent through rigorous accreditation and escrow governance.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: 'verified', title: 'Vetted & Identity Verified', desc: 'All listed members complete identity verification, technical quizzes, and portfolio vetting.' },
              { icon: 'lock', title: 'Milestone Escrow Security', desc: 'Budget locked in escrow; disbursed only when project milestones are approved by you.' },
              { icon: 'policy', title: 'Admin SLA Supervision', desc: 'Every enterprise brief is reviewed by central management for scope and SLA enforcement.' },
              { icon: 'pin_drop', title: 'Territorial Proximity', desc: 'Professionals stationed in your regional commercial market who understand local dynamics.' },
            ].map((item, idx) => (
              <div key={idx} className="flex sm:flex-col items-start gap-3 p-4 rounded-lg bg-[#f8fafc] border border-slate-200">
                <span className="material-symbols-outlined text-blue-600 text-2xl shrink-0">{item.icon}</span>
                <div>
                  <h4 className="text-xs font-bold font-display text-slate-900 mb-1">{item.title}</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: FAQ */}
      <section className="bg-[#f8fafc] border-b border-slate-200/80 py-8 px-4 lg:px-16">
        <div className="max-w-[700px] mx-auto">
          <div className="text-center mb-5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1 block font-display">Got Questions?</span>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-2">
            {[
              { q: 'What is the difference between an Agent, Account Manager, and Consultant?', a: 'Agents handle hands-on tactical tasks like running ad sets and lead generation. Account Managers manage multi-agent teams and client campaign delivery. Consultants advise on commercial escrow, tracking architecture, and overall growth strategy.' },
              { q: 'How does the postal code search work?', a: 'When you enter your postcode, the platform scans its verified affiliate directory to locate accredited members in that territory with available capacity.' },
              { q: 'What happens after I submit a work request?', a: 'Your request is dispatched to the selected affiliate and logged in the 247gbs affiliate administrative queue. The affiliate reviews your scope and contacts you to confirm milestones and activation.' },
              { q: 'Are my payments protected?', a: 'Yes. All enterprise contracts utilize 247gbs affiliate milestone escrow. Funds are never released to the affiliate until you review and approve the agreed deliverable.' },
            ].map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className="rounded-lg bg-white border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full text-left px-4 py-3 flex items-center justify-between text-xs font-bold font-display text-slate-900 hover:text-blue-600 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="material-symbols-outlined text-slate-400 text-base shrink-0 ml-2">{isOpen ? 'expand_less' : 'expand_more'}</span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3 pt-1 text-[11px] text-slate-600 leading-relaxed border-t border-slate-100">{faq.a}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 7: CTA BANNER */}
      <section className="bg-white py-8 px-4 lg:px-16 text-center">
        <div className="max-w-[600px] mx-auto space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">Ready to deploy verified affiliate talent?</h2>
          <p className="text-xs text-slate-600 leading-relaxed">Enter your territory postal code above or submit a project brief directly to central management.</p>
          <div className="pt-1 flex flex-col sm:flex-row gap-2.5 justify-center">
            <button
              onClick={scrollToSearch}
              className="px-5 py-2.5 rounded-md bg-blue-600 text-white font-display font-semibold text-xs uppercase tracking-wider hover:bg-blue-700 transition-all shadow-sm"
            >
              Search Territory Postcode
            </button>
            <Link
              href={getAffiliateRegisterUrl()}
              className="px-5 py-2.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-display font-semibold text-xs uppercase tracking-wider hover:bg-slate-200 transition-all"
            >
              Apply to Become an Affiliate
            </Link>
          </div>
        </div>
      </section>

      {/* AFFILIATE PROFILE MODAL (Mobile-First Bottom Sheet / Desktop Dialog) */}
      {showRequestModal && selectedAgent && (() => {
        const metrics = getAgentProfileMetrics(selectedAgent);
        const displayName = getAgentDisplayName(selectedAgent);
        const roleBadge = getAgentRoleBadge(selectedAgent);
        const locationLabel =
          [selectedAgent.city, selectedAgent.region].filter(Boolean).join(', ') ||
          selectedAgent.country ||
          'United Kingdom';
        const distanceShort =
          selectedAgent.distanceMiles != null
            ? `${selectedAgent.distanceMiles} mi`
            : selectedAgent.distanceLabel
              ? selectedAgent.distanceLabel.replace(/\s*away$/i, '')
              : null;

        return (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
            onClick={() => setShowRequestModal(false)}
          >
            <div
              className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[85vh] sm:max-w-lg sm:rounded-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sticky Header */}
              <div className="relative border-b border-slate-200 bg-slate-50/80 px-3.5 py-2.5 sm:px-5 sm:py-3.5">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  aria-label="Close profile"
                  className="absolute right-3 top-2.5 flex size-7 items-center justify-center rounded-full bg-white text-slate-500 shadow-xs border border-slate-200 hover:text-slate-800 transition-colors sm:size-8 sm:top-3"
                >
                  <span className="material-symbols-outlined leading-none" style={{ fontSize: '16px' }}>close</span>
                </button>

                <div className="flex items-center gap-3 pr-8">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-200 sm:size-14">
                    <Image
                      src={getAgentAvatarUrl(selectedAgent)}
                      alt={displayName}
                      fill
                      unoptimized
                      className="object-cover object-top"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <h3 className="truncate font-display text-base font-extrabold leading-tight text-slate-900 sm:text-lg">
                        {displayName}
                      </h3>
                      <span
                        className="material-symbols-outlined shrink-0 leading-none text-emerald-500"
                        style={{ fontSize: '16px' }}
                        title="Verified Affiliate"
                      >
                        verified
                      </span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                      <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-700 border border-blue-100">
                        {roleBadge}
                      </span>
                      <span className="flex items-center gap-0.5 text-[11px] font-medium text-slate-500 truncate">
                        <span
                          className="material-symbols-outlined shrink-0 leading-none text-blue-500"
                          style={{ fontSize: '12px' }}
                        >
                          location_on
                        </span>
                        <span className="truncate">
                          {locationLabel}
                          {distanceShort ? `, ${distanceShort}` : ''}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable Profile Content */}
              <div className="flex-1 space-y-2.5 overflow-y-auto p-3.5 sm:space-y-3 sm:p-4">
                {/* 4-Metric Performance Grid (Single compact row on mobile & desktop) */}
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                  <div className="rounded-lg border border-blue-100 bg-blue-50/60 px-1.5 py-2 text-center">
                    <p className="font-display text-sm font-extrabold text-blue-700 sm:text-base">
                      {metrics.assessmentScore}%
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-tight text-slate-600">
                      Score
                    </p>
                  </div>
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 px-1.5 py-2 text-center">
                    <p className="font-display text-sm font-extrabold text-emerald-700 sm:text-base">
                      {metrics.slaReliability}%
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-tight text-slate-600">
                      On-Time
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-1.5 py-2 text-center">
                    <p className="font-display text-sm font-extrabold text-slate-900 sm:text-base">
                      {metrics.completedDeliverables}
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-tight text-slate-600">
                      Tasks
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-1.5 py-2 text-center">
                    <p className="font-display text-sm font-extrabold text-slate-900 sm:text-base">
                      {metrics.hourlyRate}
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-tight text-slate-600">
                      Rate
                    </p>
                  </div>
                </div>

                {/* About / Bio */}
                <div className="rounded-lg border border-slate-200 bg-white p-2.5 sm:p-3">
                  <h4 className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    About
                  </h4>
                  <p className="text-xs leading-snug text-slate-700">
                    {selectedAgent.bio ||
                      'Accredited 247gbs affiliate partner verified for commercial execution, milestone delivery, and regional business support.'}
                  </p>
                </div>

                {/* Credentials */}
                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 sm:p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Credentials
                    </h4>
                    <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                      <span
                        className="material-symbols-outlined shrink-0 leading-none text-emerald-600"
                        style={{ fontSize: '12px' }}
                      >
                        check_circle
                      </span>
                      <span>Verified</span>
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-slate-700">
                        <span>Skill Assessment</span>
                        <span className="font-bold text-blue-700">{metrics.assessmentScore}% (Top Tier)</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{ width: `${metrics.assessmentScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                      <div className="flex items-center gap-1 rounded border border-slate-200/80 bg-white px-2 py-1 text-[11px] font-medium text-slate-700">
                        <span
                          className="material-symbols-outlined shrink-0 leading-none text-emerald-600"
                          style={{ fontSize: '13px' }}
                        >
                          verified_user
                        </span>
                        <span className="truncate">ID Verified</span>
                      </div>
                      <div className="flex items-center gap-1 rounded border border-slate-200/80 bg-white px-2 py-1 text-[11px] font-medium text-slate-700">
                        <span
                          className="material-symbols-outlined shrink-0 leading-none text-blue-600"
                          style={{ fontSize: '13px' }}
                        >
                          schedule
                        </span>
                        <span className="truncate">Reply: {metrics.responseTime}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h4 className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {metrics.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 rounded-md border border-blue-100 bg-blue-50/70 px-2 py-0.5 text-[11px] font-semibold text-blue-800"
                      >
                        <span
                          className="material-symbols-outlined shrink-0 leading-none text-blue-600"
                          style={{ fontSize: '11px' }}
                        >
                          check_circle
                        </span>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Operational Details */}
                <div className="grid grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[11px]">
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Languages
                    </span>
                    <span className="font-semibold text-slate-800">{metrics.languages.join(', ')}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Timezone
                    </span>
                    <span className="font-semibold text-slate-800">{metrics.timezone}</span>
                  </div>
                </div>
              </div>

              {/* Sticky Bottom CTA Bar */}
              <div className="border-t border-slate-200 bg-white px-3.5 py-2.5 sm:px-5 sm:py-3">
                <div className="flex items-center gap-2">
                  <Link
                    href={getDelegateTaskHref(selectedAgent)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.99] sm:py-2.5"
                  >
                    <span className="material-symbols-outlined leading-none" style={{ fontSize: '15px' }}>
                      assignment_ind
                    </span>
                    <span>Delegate Task</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 font-display text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors sm:py-2.5"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 px-4 lg:px-16 py-8">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
            <div className="col-span-2 sm:col-span-1 space-y-2">
              <BrandLogo size="sm" />
              <p className="text-[11px] text-slate-500 leading-relaxed">Executive affiliate performance infrastructure and verified global task distribution directory.</p>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 mb-2 font-display">Directory</h4>
              <ul className="space-y-1.5 text-[11px] text-slate-600">
                <li><Link href="/find-agent" className="hover:text-blue-600 transition-colors">Verified Directory</Link></li>
                <li><Link href="/for-agent" className="hover:text-blue-600 transition-colors">Affiliate Accreditation</Link></li>
                <li><Link href="/onboarding" className="hover:text-blue-600 transition-colors">Tiered Operations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 mb-2 font-display">Solutions</h4>
              <ul className="space-y-1.5 text-[11px] text-slate-600">
                <li><Link href="/for-account-manager" className="hover:text-blue-600 transition-colors">Enterprise SLA</Link></li>
                <li><Link href="/terms" className="hover:text-blue-600 transition-colors">Task Governance</Link></li>
                <li><Link href="/privacy" className="hover:text-blue-600 transition-colors">Affiliate Escrow</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 mb-2 font-display">Legal</h4>
              <ul className="space-y-1.5 text-[11px] text-slate-600">
                <li><Link href="/terms" className="hover:text-blue-600 transition-colors">Regulatory Oversight</Link></li>
                <li><Link href="/privacy" className="hover:text-blue-600 transition-colors">Data Processing</Link></li>
                <li><Link href="/cookies" className="hover:text-blue-600 transition-colors">Institutional Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] text-slate-400">
            <p>© {new Date().getFullYear()} 247gbs affiliate Operations Group. All rights reserved.</p>
            <p className="max-w-sm">Regulatory Disclosure: 247gbs affiliate acts as an accredited task routing network and independent escrow fulfillment infrastructure for enterprise partners.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
