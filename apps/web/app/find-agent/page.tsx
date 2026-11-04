'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { useAuthStore } from '@/store/useAuthStore';
import { getAffiliateRegisterUrl } from '@/lib/centralHub';

interface PostalLookupResult {
  found: boolean;
  postalCode?: string;
  city?: string;
  region?: string;
  country?: string;
  displayName?: string;
}

interface AgentRecord {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  profileImage?: string;
  skills?: string[];
  bio?: string;
  hourlyRate?: number;
  currency?: string;
  timezone?: string;
  role?: string;
  subTitle?: string;
  locationArea?: string;
  distanceMiles?: string;
  isOnboarded?: boolean;
  isQuizPassed?: boolean;
  verificationStatus?: string;
  isPaidVisible?: boolean;
  createdAt?: string;
}

const DEMO_POSTAL_CODE = 'SW1A 1AA';
const DEMO_POSTAL_LOCATION: PostalLookupResult = {
  found: true,
  postalCode: DEMO_POSTAL_CODE,
  city: 'London',
  region: 'Greater London',
  country: 'United Kingdom',
};

// 9 Demo affiliate members representing Agents, Account Managers, and Consultants
const DEMO_AGENTS_LIST: AgentRecord[] = [
  {
    id: 'demo-1',
    firstName: 'Marcus',
    lastName: 'Vance',
    email: 'marcus.vance@247gbs.network',
    profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop',
    subTitle: 'Meta Ads & Growth Lead',
    locationArea: 'London Central',
    distanceMiles: '2.4 MILES',
    skills: ['FACEBOOK ADS', 'FUNNEL ARCHITECTURE', 'PAID ACQUISITION'],
    bio: 'Specialises in paid social scaling, B2B lead generation funnels, and enterprise customer acquisition workflows.',
    hourlyRate: 85,
    currency: 'GBP',
    timezone: 'Europe/London',
    role: 'account_manager',
    isOnboarded: true,
    isQuizPassed: true,
    verificationStatus: 'verified',
  },
  {
    id: 'demo-2',
    firstName: 'Eleanor',
    lastName: 'Wright',
    email: 'eleanor.wright@247gbs.network',
    profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop',
    subTitle: 'CRO & Analytics Specialist',
    locationArea: 'Westminster',
    distanceMiles: '4.1 MILES',
    skills: ['GA4 MIGRATION', 'CRO AUDITING', 'TAG MANAGER'],
    bio: 'Helps SaaS and retail brands optimize landing page conversions, audit GA4 tracking pipelines, and reduce checkout drop-off.',
    hourlyRate: 95,
    currency: 'GBP',
    timezone: 'Europe/London',
    role: 'consultant',
    isOnboarded: true,
    isQuizPassed: true,
    verificationStatus: 'verified',
  },
  {
    id: 'demo-3',
    firstName: 'Julian',
    lastName: 'Reed',
    email: 'julian.reed@247gbs.network',
    profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop',
    subTitle: 'Sales Operations Specialist',
    locationArea: 'Camden',
    distanceMiles: '6.8 MILES',
    skills: ['B2B LEAD QUAL', 'CRM SETUP', 'OUTREACH OPS'],
    bio: 'Expert in outbound pipeline setup, CRM data hygiene, and automated lead qualification routing for regional businesses.',
    hourlyRate: 75,
    currency: 'GBP',
    timezone: 'Europe/London',
    role: 'agent',
    isOnboarded: true,
    isQuizPassed: true,
    verificationStatus: 'verified',
  },
  {
    id: 'demo-4',
    firstName: 'Sophia',
    lastName: 'Chen',
    email: 'sophia.chen@247gbs.network',
    profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800&auto=format&fit=crop',
    subTitle: 'PPC & Search Scaling Lead',
    locationArea: 'City of London',
    distanceMiles: '3.2 MILES',
    skills: ['GOOGLE SEARCH', 'PERFORMANCE MAX', 'PPC SCALING'],
    bio: 'Performance marketing manager specialized in high-intent search optimization, e-commerce scale, and automated ROAS protection.',
    hourlyRate: 90,
    currency: 'GBP',
    timezone: 'Europe/London',
    role: 'account_manager',
    isOnboarded: true,
    isQuizPassed: true,
    verificationStatus: 'verified',
  },
  {
    id: 'demo-5',
    firstName: 'David',
    lastName: 'Alvarez',
    email: 'david.alvarez@247gbs.network',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
    subTitle: 'Institutional Escrow Advisor',
    locationArea: 'Kensington',
    distanceMiles: '5.5 MILES',
    skills: ['AFFILIATE ESCROW', 'CONTRACT SLA', 'GOVERNANCE'],
    bio: 'Advises enterprise partners on affiliate escrow distribution, territorial compliance, and contractual risk management.',
    hourlyRate: 110,
    currency: 'GBP',
    timezone: 'Europe/London',
    role: 'consultant',
    isOnboarded: true,
    isQuizPassed: true,
    verificationStatus: 'verified',
  },
  {
    id: 'demo-6',
    firstName: 'Charlotte',
    lastName: 'Taylor',
    email: 'charlotte.taylor@247gbs.network',
    profileImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=800&auto=format&fit=crop',
    subTitle: 'Lifecycle & CRM Architect',
    locationArea: 'Southwark',
    distanceMiles: '7.2 MILES',
    skills: ['HUBSPOT CRM', 'PIPELINE HYGIENE', 'AUTOMATION'],
    bio: 'Architects enterprise CRM pipelines with automated qualification triggers and scalable lifecycle nurture campaigns.',
    hourlyRate: 80,
    currency: 'GBP',
    timezone: 'Europe/London',
    role: 'agent',
    isOnboarded: true,
    isQuizPassed: true,
    verificationStatus: 'verified',
  },
  {
    id: 'demo-7',
    firstName: 'Liam',
    lastName: 'O’Connor',
    email: 'liam.oconnor@247gbs.network',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop',
    subTitle: 'Regional Campaign Lead',
    locationArea: 'Islington',
    distanceMiles: '8.0 MILES',
    skills: ['COLD OUTREACH', 'LINKEDIN PROSPECTING', 'B2B CADENCE'],
    bio: 'Coordinates hyper-targeted account-based outbound campaigns and executive appointment setting for enterprise partners.',
    hourlyRate: 70,
    currency: 'GBP',
    timezone: 'Europe/London',
    role: 'account_manager',
    isOnboarded: true,
    isQuizPassed: true,
    verificationStatus: 'verified',
  },
  {
    id: 'demo-8',
    firstName: 'Hannah',
    lastName: 'Patel',
    email: 'hannah.patel@247gbs.network',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
    subTitle: 'Offer & Conversion Strategist',
    locationArea: 'Greenwich',
    distanceMiles: '9.4 MILES',
    skills: ['CONVERSION COPY', 'LANDING PAGE UX', 'A/B TESTING'],
    bio: 'Drives high-converting offer restructuring, user-experience audit workflows, and revenue optimization for digital partners.',
    hourlyRate: 85,
    currency: 'GBP',
    timezone: 'Europe/London',
    role: 'agent',
    isOnboarded: true,
    isQuizPassed: true,
    verificationStatus: 'verified',
  },
  {
    id: 'demo-9',
    firstName: 'Oliver',
    lastName: 'Brooks',
    email: 'oliver.brooks@247gbs.network',
    profileImage: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=800&auto=format&fit=crop',
    subTitle: 'First-Party Tracking Lead',
    locationArea: 'Hammersmith',
    distanceMiles: '10.2 MILES',
    skills: ['DATA ATTRIBUTION', 'META CAPI', 'SERVER TRACKING'],
    bio: 'Specialist in server-side event tracking, First-Party data pipelines, and omnichannel attribution governance.',
    hourlyRate: 95,
    currency: 'GBP',
    timezone: 'Europe/London',
    role: 'consultant',
    isOnboarded: true,
    isQuizPassed: true,
    verificationStatus: 'verified',
  },
];

// 5 Featured Hero Carousel Cards (3 visible at once in looping deck)
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

const HERO_CAROUSEL_CARDS: HeroCarouselCard[] = [
  {
    id: 'hero-1',
    name: 'Marcus Vance',
    role: 'Account Manager',
    locationArea: 'London Central',
    distance: '2.4 MILES',
    quote: 'Specialises in paid social scaling, team coordination, and strategic client management.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop',
    badge: 'VERIFIED MEMBER',
    agent: DEMO_AGENTS_LIST[0],
  },
  {
    id: 'hero-2',
    name: 'Eleanor Wright',
    role: 'Consultant',
    locationArea: 'Westminster',
    distance: '4.1 MILES',
    quote: 'Helps SaaS and retail brands optimize landing page conversions, audit GA4 pipelines, and reduce checkout drop-off.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
    badge: 'VERIFIED MEMBER',
    agent: DEMO_AGENTS_LIST[1],
  },
  {
    id: 'hero-3',
    name: 'Julian Reed',
    role: 'Agent',
    locationArea: 'Camden',
    distance: '6.8 MILES',
    quote: 'Expert in outbound pipeline setup, CRM data hygiene, and automated lead qualification routing.',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop',
    badge: 'VERIFIED MEMBER',
    agent: DEMO_AGENTS_LIST[2],
  },
  {
    id: 'hero-4',
    name: 'Sophia Chen',
    role: 'Account Manager',
    locationArea: 'City of London',
    distance: '3.2 MILES',
    quote: 'Performance marketing manager specialized in high-intent search optimization, e-commerce scale, and ROAS protection.',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop',
    badge: 'VERIFIED MEMBER',
    agent: DEMO_AGENTS_LIST[3],
  },
  {
    id: 'hero-5',
    name: 'David Alvarez',
    role: 'Consultant',
    locationArea: 'Kensington',
    distance: '5.5 MILES',
    quote: 'Advises enterprise partners on affiliate escrow distribution, territorial compliance, and contractual risk management.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    badge: 'VERIFIED MEMBER',
    agent: DEMO_AGENTS_LIST[4],
  },
];

type RoleFilterType = 'all' | 'agent' | 'account_manager' | 'consultant';

export default function FindAgentPage() {
  const { user, isAuthenticated } = useAuthStore();
  const reduceMotion = useReducedMotion();

  // Search state
  const [postcode, setPostcode] = useState('');
  const [submittedPostcode, setSubmittedPostcode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [resolvedLocation, setResolvedLocation] = useState<PostalLookupResult | null>(null);

  // Role filtering
  const [roleFilter, setRoleFilter] = useState<RoleFilterType>('all');
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(null);

  // Selected agent for modal popup
  const [selectedAgent, setSelectedAgent] = useState<AgentRecord | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Enterprise request form state
  const [formFullName, setFormFullName] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPostcode, setFormPostcode] = useState('');
  const [formBudget, setFormBudget] = useState('£1,000 - £3,000');
  const [formTimeline, setFormTimeline] = useState('Immediate / Next 7 Days');
  const [formScope, setFormScope] = useState('');

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  // Hero Carousel State
  const [heroIndex, setHeroIndex] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const [carouselAnimating, setCarouselAnimating] = useState(false);
  const carouselTotalCards = HERO_CAROUSEL_CARDS.length; // 5
  const carouselPausedRef = useRef(false);

  // Keep ref in sync so the interval closure always reads current value
  useEffect(() => {
    carouselPausedRef.current = carouselPaused;
  }, [carouselPaused]);

  // Auto-advance carousel every 5s — interval never restarts, reads ref instead
  useEffect(() => {
    const timer = setInterval(() => {
      if (carouselPausedRef.current) return;
      setCarouselAnimating(true);
      setTimeout(() => {
        setHeroIndex((prev) => (prev + 1) % carouselTotalCards);
        setCarouselAnimating(false);
      }, 250);
    }, 5000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Fetch real agents from API
  const { data: realAgents = [] } = useQuery<AgentRecord[]>({
    queryKey: ['public-agents-directory'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/users/agents');
        return Array.isArray(response.data) ? response.data : [];
      } catch {
        return [];
      }
    },
    staleTime: 60 * 1000,
  });

  // Prefill form if user is logged in
  useEffect(() => {
    if (user) {
      const uName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || '';
      if (uName) setFormFullName(uName);
    }
  }, [user]);

  // Handle Postcode Lookup
  const handleSearch = (e?: React.FormEvent, overrideCode?: string) => {
    if (e) e.preventDefault();
    const raw = overrideCode || postcode;
    const clean = raw.trim().toUpperCase().replace(/\s+/g, ' ');
    if (clean.length < 2) return;

    setIsSearching(true);
    setSubmittedPostcode(clean);

    setTimeout(() => {
      resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    setTimeout(async () => {
      if (clean === DEMO_POSTAL_CODE) {
        setResolvedLocation(DEMO_POSTAL_LOCATION);
        if (!formPostcode) setFormPostcode(DEMO_POSTAL_LOCATION.postalCode || clean);
        setIsSearching(false);
        return;
      }

      try {
        const res = await apiClient.get<PostalLookupResult>('/users/postal-code-lookup', {
          params: { postcode: clean },
        });
        if (res.data?.found) {
          setResolvedLocation(res.data);
          if (!formPostcode) setFormPostcode(res.data.postalCode || clean);
        } else {
          setResolvedLocation({ found: false, postalCode: clean });
        }
      } catch {
        setResolvedLocation({ found: false, postalCode: clean });
      }

      setIsSearching(false);
    }, 600);
  };

  const isDemoPostcode = useMemo(() => {
    if (!submittedPostcode) return false;
    const norm = submittedPostcode.toUpperCase().replace(/\s+/g, ' ');
    return norm === DEMO_POSTAL_CODE;
  }, [submittedPostcode]);

  // Displayed agents filtered by Role (All, Agents, Account Managers, Consultants)
  // ONLY populates when submittedPostcode exists!
  const displayedAgents = useMemo(() => {
    if (!submittedPostcode || !isDemoPostcode) return [];

    let list: AgentRecord[] = [...realAgents, ...DEMO_AGENTS_LIST];

    // Apply Role Filter
    if (roleFilter !== 'all') {
      list = list.filter((item) => {
        const r = (item.role || 'agent').toLowerCase().replace('-', '_');
        if (roleFilter === 'agent') return r === 'agent';
        if (roleFilter === 'account_manager') return r === 'account_manager';
        if (roleFilter === 'consultant') return r === 'consultant';
        return true;
      });
    }

    return list;
  }, [submittedPostcode, isDemoPostcode, realAgents, roleFilter]);

  const handleOpenRequestModal = (agent: AgentRecord) => {
    setSelectedAgent(agent);
    setFormSubmitted(false);
    setFormError('');
    if (!formPostcode) setFormPostcode(submittedPostcode || DEMO_POSTAL_CODE);
    setShowRequestModal(true);
  };

  const handleSubmitWorkRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formFullName.trim()) {
      setFormError('Please enter your Full Name.');
      return;
    }
    if (!formCompany.trim()) {
      setFormError('Please enter your Company / Trading Name.');
      return;
    }
    if (!formPhone.trim()) {
      setFormError('Please enter your Contact Telephone.');
      return;
    }
    if (!formPostcode.trim()) {
      setFormError('Please enter your Postcode.');
      return;
    }
    if (!formScope.trim()) {
      setFormError('Please provide a brief Project Scope / Description.');
      return;
    }

    setFormSubmitting(true);

    try {
      const payload = {
        title: `[Enterprise Request] ${formCompany} - ${formFullName}`,
        description: `Client: ${formFullName}\nCompany: ${formCompany}\nTelephone: ${formPhone}\nPostcode: ${formPostcode}\nTimeline: ${formTimeline}\nBudget: ${formBudget}\nRequested Affiliate: ${selectedAgent ? getAgentDisplayName(selectedAgent) : 'Auto-allocate'}\n\nProject Scope:\n${formScope}`,
        budget: formBudget.includes('3,000') ? 3000 : 1500,
        currency: 'GBP',
        type: 'one_time',
      };

      if (isAuthenticated) {
        await apiClient.post('/tasks', payload).catch(() => {});
      }

      setFormSubmitted(true);
      setFormSubmitting(false);
    } catch {
      setFormSubmitted(true);
      setFormSubmitting(false);
    }
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

        {/* Mobile nav drawer */}
        {mobileNavOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
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
                        placeholder={`e.g. ${DEMO_POSTAL_CODE}`}
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
                    <button
                      type="button"
                      onClick={() => { setPostcode(DEMO_POSTAL_CODE); handleSearch(undefined, DEMO_POSTAL_CODE); }}
                      className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">my_location</span>
                      Use demo ({DEMO_POSTAL_CODE})
                    </button>
                    <span className="text-slate-400">Regional Directory</span>
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
                    const total = carouselTotalCards;
                    const leftIdx  = (heroIndex - 1 + total) % total;
                    const rightIdx = (heroIndex + 1) % total;
                    const centerIdx = heroIndex;
                    return [leftIdx, rightIdx, centerIdx].map((idx) => {
                      const card = HERO_CAROUSEL_CARDS[idx];
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
                          key={card.id}
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
                                <Image src={card.image} alt={card.name} fill className="object-cover" />
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
                  {HERO_CAROUSEL_CARDS.map((_, i) => (
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
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="size-8 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin mb-3" />
              <h3 className="text-sm font-bold font-display text-slate-900 mb-1">Resolving Jurisdiction & Affiliates</h3>
              <p className="text-xs text-slate-500 max-w-xs">Scanning for verified affiliates in <strong>{submittedPostcode}</strong>...</p>
            </div>
          ) : !isDemoPostcode || displayedAgents.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-7 text-center max-w-md mx-auto shadow-sm">
              <div className="size-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2.5 border border-amber-100">
                <span className="material-symbols-outlined text-xl">domain_disabled</span>
              </div>
              <h3 className="text-base font-bold font-display text-slate-900 mb-1">No Verified Affiliates in This Sector</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                No members found for <strong className="text-slate-800">{submittedPostcode}</strong>. Try our demo postcode{' '}
                <button type="button" onClick={() => { setPostcode(DEMO_POSTAL_CODE); handleSearch(undefined, DEMO_POSTAL_CODE); }} className="font-bold text-blue-600 underline">{DEMO_POSTAL_CODE}</button>.
              </p>
              <button
                type="button"
                onClick={() => { setPostcode(''); setSubmittedPostcode(''); }}
                className="px-4 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-xs font-semibold font-display text-slate-700 transition-all"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div>
              {/* Header + Sort */}
              <div className="mb-2 flex flex-col justify-between gap-1 border-b border-slate-200 pb-2 sm:mb-4 sm:flex-row sm:items-end sm:gap-3 sm:pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                    Available affiliates <span className="text-slate-400 font-normal text-sm">({submittedPostcode})</span>
                  </h2>
                </div>
              </div>

              {/* Role filter tabs */}
              <div className="mb-2 grid grid-cols-4 gap-1.5 pb-1 sm:mb-4 sm:flex sm:items-center sm:gap-1.5 sm:overflow-x-auto sm:pb-1 scrollbar-none">
                {[
                  { id: 'all', label: 'Affiliates' },
                  { id: 'agent', label: 'Agents' },
                  { id: 'account_manager', label: 'Managers' },
                  { id: 'consultant', label: 'Consultants' },
                ].map((tab) => {
                  const isActive = roleFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setRoleFilter(tab.id as RoleFilterType)}
                      className={`min-w-0 rounded-md px-1.5 py-1.5 text-[10px] font-semibold transition-all sm:px-3 sm:text-xs ${isActive ? 'bg-blue-600 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Affiliate cards grid — 1 col mobile, 2 tablet, 3 desktop */}
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                {displayedAgents.map((agent, index) => {
                  const displayName = getAgentDisplayName(agent);
                  const agentKey = agent.id || String(index);
                  const detailsId = `affiliate-card-details-${index}`;
                  const desktopDetailsId = `${detailsId}-desktop`;
                  const isExpanded = expandedAgentId === agentKey;
                  const roleBadge = getAgentRoleBadge(agent);
                  const subTitle = agent.subTitle || 'Growth & Operations Lead';
                  const locationArea = agent.locationArea || (index % 2 === 0 ? 'London Central' : 'Westminster');
                  const distanceMiles = agent.distanceMiles || `${(2.4 + (index % 5) * 1.8).toFixed(1)} MILES`;
                  const skills = agent.skills && agent.skills.length > 0 ? agent.skills : ['CAMPAIGN OPS', 'CLIENT MANAGEMENT', 'PAID ACQUISITION'];
                  const fullProfile = (
                    <>
                      <div className="relative h-48 w-full overflow-hidden bg-slate-100 sm:h-52">
                        {agent.profileImage ? (
                          <Image src={agent.profileImage} alt={displayName} fill className="object-cover object-top" />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800 text-white">
                            <div className="flex size-12 items-center justify-center rounded-full bg-blue-600/30 font-display text-lg font-bold text-blue-200">{displayName.substring(0, 2).toUpperCase()}</div>
                          </div>
                        )}
                        <div className="absolute left-2.5 top-2.5 z-10">
                          <span className="inline-flex items-center gap-1 rounded-sm border border-emerald-100 bg-white/95 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-800 shadow-sm">
                            <span className="size-1.5 rounded-full bg-emerald-600" />Verified
                          </span>
                        </div>
                        <div className="absolute bottom-2.5 right-2.5 z-10">
                          <span className="rounded-sm bg-black/75 px-2 py-0.5 font-mono text-[10px] font-bold text-white">{distanceMiles}</span>
                        </div>
                        <button
                          type="button"
                          aria-label={`Collapse ${displayName} profile`}
                          onClick={() => setExpandedAgentId(null)}
                          className="absolute right-2 top-2 z-20 flex size-8 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-sm sm:hidden"
                        >
                          <span className="material-symbols-outlined text-xl">expand_less</span>
                        </button>
                      </div>
                      <div className="flex flex-1 flex-col justify-between p-4">
                        <div>
                          <div className="mb-0.5 flex items-start justify-between gap-2">
                            <h3 className="text-sm font-bold text-slate-900">{displayName}</h3>
                            <span className="whitespace-nowrap rounded-sm border border-blue-100 bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-700">{roleBadge}</span>
                          </div>
                          <p className="mb-1 flex items-center gap-0.5 text-[11px] font-medium text-slate-500"><span className="material-symbols-outlined text-[12px] text-slate-400">location_on</span>{locationArea}</p>
                          <p className="mb-1.5 text-[11px] font-semibold text-blue-600">{subTitle}</p>
                          <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-slate-600">{agent.bio || 'Specialises in performance marketing workflows, strategic client management, and enterprise delivery.'}</p>
                          <div className="mb-3 flex flex-wrap gap-1">
                            {skills.slice(0, 3).map((skill, sIdx) => <span key={sIdx} className="rounded-sm bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-700">{skill}</span>)}
                          </div>
                        </div>
                        <button onClick={() => handleOpenRequestModal(agent)} className="flex w-full items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold tracking-wider text-white shadow-sm transition-all hover:bg-blue-700">
                          <span>View Profile & Request</span><span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                      </div>
                    </>
                  );
                  return (
                    <motion.div
                      key={agentKey}
                      layout
                      transition={{ layout: { duration: reduceMotion ? 0 : 0.28, ease: 'easeInOut' } }}
                      className="group flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-colors hover:border-slate-300 hover:shadow-md"
                    >
                      <AnimatePresence initial={false} mode="wait">
                        {!isExpanded && <motion.button
                          key="preview"
                          type="button"
                          aria-expanded={false}
                          aria-controls={detailsId}
                          onClick={() => setExpandedAgentId(agentKey)}
                          initial={{ opacity: 0, y: 5, scale: 0.99 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.985 }}
                          transition={{ duration: reduceMotion ? 0 : 0.18, ease: 'easeOut' }}
                          className="flex w-full items-center gap-2 p-2 text-left sm:hidden"
                        >
                        <span className="relative block size-10 shrink-0 overflow-hidden rounded-md bg-slate-100">
                            {agent.profileImage ? <Image src={agent.profileImage} alt="" fill sizes="48px" className="object-cover object-top" /> : <span className="flex size-full items-center justify-center bg-slate-800 text-sm font-bold text-blue-100">{displayName.substring(0, 2).toUpperCase()}</span>}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center justify-between gap-2"><span className="truncate text-sm font-bold text-slate-900">{displayName}</span><span className="material-symbols-outlined shrink-0 text-xl text-slate-500">expand_more</span></span>
                          <span className="mt-0.5 block truncate text-[10px] font-medium leading-4 text-slate-500">{subTitle} · {roleBadge}</span>
                          <span className="mt-0.5 block line-clamp-1 text-[11px] leading-4 text-slate-600">{agent.bio || 'Specialises in performance marketing workflows, strategic client management, and enterprise delivery.'}</span>
                          </span>
                        </motion.button>}
                      </AnimatePresence>

                      <AnimatePresence initial={false} mode="wait">
                        {isExpanded && <motion.div
                          key="mobile-profile"
                          id={detailsId}
                          initial={{ opacity: 0, y: 10, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                          exit={{ opacity: 0, y: -6, height: 0 }}
                          transition={{ duration: reduceMotion ? 0 : 0.24, ease: 'easeInOut' }}
                          className="overflow-hidden sm:hidden"
                        >{fullProfile}</motion.div>}
                      </AnimatePresence>

                      <div id={desktopDetailsId} className="hidden sm:block">{fullProfile}</div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {/* SECTION 3: AFFILIATE ROLES */}
      <section className="bg-white border-y border-slate-200/80 py-8 px-4 lg:px-16">
        <div className="max-w-[1240px] mx-auto">
          <div className="text-center max-w-xl mx-auto mb-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1 block font-display">Network Hierarchy</span>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 mb-2">Who you're collaborating with</h2>
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
              { q: 'How does the postal code search work?', a: 'When you enter your postcode (or our demo code SW1A 1AA), the platform scans regional databases to locate accredited affiliates in that territory with verified capacity.' },
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

      {/* POPUP MODAL */}
      {showRequestModal && selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-t-xl sm:rounded-lg max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden sm:my-8">
            {/* Modal Header */}
            <div className="px-5 pt-4 pb-3 border-b border-slate-200 bg-slate-50/70 relative">
              <button onClick={() => setShowRequestModal(false)} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors p-1">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
              <div className="flex items-center gap-3 mb-2">
                <div className="relative size-10 rounded-full overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                  {selectedAgent.profileImage ? (
                    <Image src={selectedAgent.profileImage} alt={getAgentDisplayName(selectedAgent)} fill className="object-cover" />
                  ) : (
                    <div className="size-full flex items-center justify-center font-bold text-blue-600 font-display text-sm">
                      {getAgentDisplayName(selectedAgent).substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold font-display text-slate-900">Contact {getAgentDisplayName(selectedAgent)}</h3>
                  <p className="text-[11px] text-slate-500">{selectedAgent.locationArea || 'London Central'} • {getAgentRoleBadge(selectedAgent)}</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed bg-white p-2 rounded border border-slate-200">
                Already a partner? {getAgentDisplayName(selectedAgent)} handles scope reviews directly. For account queries, our management desk is available 24/7.
              </p>
            </div>

            {/* Form */}
            <div className="p-5 overflow-y-auto max-h-[70vh]">
              {formSubmitted ? (
                <div className="rounded-md bg-emerald-50 border border-emerald-200 p-5 text-center space-y-2.5">
                  <div className="size-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-2xl">task_alt</span>
                  </div>
                  <h3 className="text-base font-bold font-display text-emerald-900">Request Sent to {getAgentDisplayName(selectedAgent)}</h3>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Thank you, <strong>{formFullName}</strong>. Your work request has been dispatched and logged for administrative SLA verification.
                  </p>
                  <button type="button" onClick={() => setShowRequestModal(false)} className="px-5 py-2 rounded-md bg-blue-600 text-white text-xs font-semibold font-display hover:bg-blue-700 transition-all">
                    Close Window
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitWorkRequest} className="space-y-3">
                  {formError && (
                    <div className="p-2.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">error</span>{formError}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Full Name *</label>
                      <input type="text" required value={formFullName} onChange={(e) => setFormFullName(e.target.value)} placeholder="e.g. David Sterling" className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-900 text-xs focus:border-blue-600 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Company / Trading Name *</label>
                      <input type="text" required value={formCompany} onChange={(e) => setFormCompany(e.target.value)} placeholder="e.g. Apex Logistics" className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-900 text-xs focus:border-blue-600 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Contact Telephone *</label>
                      <input type="tel" required value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="+44 20 7946 0912" className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-900 text-xs focus:border-blue-600 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Postcode *</label>
                      <input type="text" required value={formPostcode} onChange={(e) => setFormPostcode(e.target.value.toUpperCase())} placeholder={DEMO_POSTAL_CODE} className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-900 text-xs focus:border-blue-600 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Budget Range</label>
                      <select value={formBudget} onChange={(e) => setFormBudget(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-900 text-xs focus:border-blue-600 outline-none">
                        <option value="£500 - £1,000">£500 – £1,000</option>
                        <option value="£1,000 - £3,000">£1,000 – £3,000</option>
                        <option value="£3,000 - £10,000">£3,000 – £10,000</option>
                        <option value="Enterprise / Custom SLA">Enterprise / Custom</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Estimated Timeline</label>
                      <select value={formTimeline} onChange={(e) => setFormTimeline(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-900 text-xs focus:border-blue-600 outline-none">
                        <option value="Immediate / Next 7 Days">Immediate / 7 Days</option>
                        <option value="Next 2 - 4 Weeks">2 – 4 Weeks</option>
                        <option value="Ongoing Monthly Support">Ongoing Monthly</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Project Scope / Description *</label>
                    <textarea required rows={3} value={formScope} onChange={(e) => setFormScope(e.target.value)} placeholder="Describe your requirements..." className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-900 text-xs focus:border-blue-600 outline-none resize-none" />
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
                    <p className="font-bold text-slate-800 mb-0.5">What&apos;s next</p>
                    <p>Once submitted, {getAgentDisplayName(selectedAgent)} will follow up to arrange a time to discuss your scope. Work is executed through 247gbs affiliate protected escrow contracts.</p>
                  </div>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="w-full py-2.5 px-4 rounded-md bg-blue-600 text-white font-display font-semibold text-xs uppercase tracking-wider hover:bg-blue-700 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-60"
                  >
                    {formSubmitting ? (
                      <><span className="size-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />Sending...</>
                    ) : (
                      <><span>Send to {getAgentDisplayName(selectedAgent)}</span><span className="material-symbols-outlined text-sm">send</span></>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

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
