import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useSpring, animated } from '@react-spring/web';
import { useInView as useInViewScroll } from 'react-intersection-observer';
import {
    Search,
    ShieldCheck,
    ShieldAlert,
    AlertTriangle,
    CheckCircle2,
    ArrowRight,
    Loader2,
    FileText,
    Globe,
    BarChart3,
    X,
    ArrowDown,
    Zap,
    TrendingUp,
    AlertCircle,
    RefreshCw,
    Sun,
    Moon,
    Sparkles
} from "lucide-react";
import {
    ingestText,
    extractClaims,
    getEvidence,
    verifyClaim
} from "../api/verinewsApi";

const MAX_CHARS = 10000;

// ============================================
// MOTION VARIANTS
// ============================================
const motionVariants = {
    fadeIn: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
    },
    fadeInUp: {
        initial: { opacity: 0, y: 40 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -40 }
    },
    staggerContainer: {
        animate: { transition: { staggerChildren: 0.1 } }
    },
    scaleIn: {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.8, opacity: 0 }
    },
    slideInRight: {
        initial: { x: 100, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: -100, opacity: 0 }
    }
};

// ============================================
// COMPONENTS
// ============================================

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4500);
        return () => clearTimeout(timer);
    }, [onClose]);

    const styles = {
        error: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-500/50 text-red-800 dark:text-red-200',
        warning: 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-500/50 text-amber-800 dark:text-amber-200',
        success: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-200'
    };

    return (
        <motion.div
            {...motionVariants.slideInRight}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl backdrop-blur-xl border ${styles[type] || styles.success}`}
            role="alert"
        >
            {type === 'error' ? <AlertTriangle size={20} /> : type === 'warning' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            <span className="font-medium text-sm">{message}</span>
            <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X size={16} /></button>
        </motion.div>
    );
};

const Skeleton = ({ className }) => (
    <div className={`relative overflow-hidden bg-gray-200 dark:bg-slate-700/50 rounded-lg ${className}`}>
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent" />
    </div>
);

const ConfidenceCircle = ({ score }) => {
    const circumference = 2 * Math.PI * 18;
    const offset = circumference - (score / 100) * circumference;
    const prefersReducedMotion = useReducedMotion();
    const color = score > 70 ? 'text-emerald-500' : score > 40 ? 'text-amber-500' : 'text-rose-500';

    return (
        <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
                <circle cx="28" cy="28" r="18" strokeWidth="4" fill="none" className="stroke-gray-200 dark:stroke-slate-700" />
                <motion.circle
                    cx="28" cy="28" r="18" strokeWidth="4" fill="none" strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={circumference}
                    className={`${color} stroke-current`}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={prefersReducedMotion ? { duration: 0 } : { duration: 1, ease: "easeOut" }}
                />
            </svg>
            <span className="absolute text-xs font-bold text-gray-700 dark:text-gray-200">{score}%</span>
        </div>
    );
};

const VerdictBadge = ({ verdict }) => {
    const isTrue = verdict?.toLowerCase().includes("true") || verdict?.toLowerCase().includes("supported");
    const isFalse = verdict?.toLowerCase().includes("false") || verdict?.toLowerCase().includes("contradicted");
    const prefersReducedMotion = useReducedMotion();

    const style = isTrue
        ? 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-400 dark:border-emerald-500/60 text-emerald-700 dark:text-emerald-300'
        : isFalse
            ? 'bg-rose-100 dark:bg-rose-900/40 border-rose-400 dark:border-rose-500/60 text-rose-700 dark:text-rose-300'
            : 'bg-amber-100 dark:bg-amber-900/40 border-amber-400 dark:border-amber-500/60 text-amber-700 dark:text-amber-300';

    return (
        <motion.div
            {...motionVariants.scaleIn}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-full border-2 shadow-md ${style}`}
        >
            {!prefersReducedMotion && isTrue && (
                <motion.span
                    className="absolute inset-0 rounded-full border-2 border-emerald-400/50"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            )}
            {isTrue ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
            <span className="text-sm font-bold uppercase tracking-wide">{verdict}</span>
        </motion.div>
    );
};

const AnimatedBackground = () => {
    const prefersReducedMotion = useReducedMotion();

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Gradient Orbs */}
            <motion.div
                className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full blur-3xl bg-gradient-to-br from-cyan-400/20 via-purple-500/20 to-pink-500/20 dark:from-cyan-600/30 dark:via-purple-700/20 dark:to-pink-600/20"
                animate={prefersReducedMotion ? {} : { scale: [1, 1.1, 1], x: [0, 50, 0], y: [0, 30, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
                className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full blur-3xl bg-gradient-to-tl from-pink-400/20 via-fuchsia-500/20 to-violet-500/20 dark:from-pink-600/20 dark:via-fuchsia-700/20 dark:to-violet-600/20"
                animate={prefersReducedMotion ? {} : { scale: [1, 1.15, 1], x: [0, -50, 0], y: [0, -30, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
            />

            {/* Floating Particles */}
            {!prefersReducedMotion && [...Array(15)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-purple-400 dark:bg-cyan-400"
                    style={{ left: `${5 + i * 6}%`, top: `${10 + (i % 5) * 20}%` }}
                    animate={{ y: [0, -40, 0], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 6 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
                />
            ))}

            {/* Grid */}
            <div
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                style={{
                    backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                    transform: 'perspective(500px) rotateX(60deg)',
                    transformOrigin: 'center top'
                }}
            />
        </div>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function Home() {
    // Theme
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = saved ? saved === 'dark' : prefersDark;
        setIsDark(shouldBeDark);
        document.documentElement.classList.toggle('dark', shouldBeDark);
    }, []);

    const toggleTheme = () => {
        const newValue = !isDark;
        setIsDark(newValue);
        localStorage.setItem('theme', newValue ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', newValue);
    };

    // State
    const [text, setText] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [claims, setClaims] = useState([]);
    const [selectedClaimId, setSelectedClaimId] = useState(null);
    const [evidenceCache, setEvidenceCache] = useState({});
    const [verdictCache, setVerdictCache] = useState({});
    const [loadingEvidence, setLoadingEvidence] = useState(false);
    const [toast, setToast] = useState(null);

    const claimsListRef = useRef(null);
    const prefersReducedMotion = useReducedMotion();
    const [heroRef, heroInView] = useInViewScroll({ threshold: 0.3, triggerOnce: true });
    const [claimsRef, claimsInView] = useInViewScroll({ threshold: 0.2, triggerOnce: true });

    const showToast = (message, type = 'success') => setToast({ message, type });

    const handleAnalyze = async () => {
        if (!text.trim()) {
            showToast("Please enter some text to analyze", "warning");
            return;
        }

        if (text.length > MAX_CHARS) {
            showToast(`Text exceeds limit of ${MAX_CHARS} characters`, "warning");
            return;
        }

        setIsAnalyzing(true);
        setClaims([]);
        setSelectedClaimId(null);
        setEvidenceCache({});
        setVerdictCache({});

        try {
            const ingestRes = await ingestText(text);
            const claimsRes = await extractClaims(ingestRes.content);
            const claimsObj = claimsRes.claims.map((txt, idx) => ({ id: idx, text: txt }));
            setClaims(claimsObj);

            if (claimsObj.length === 0) {
                showToast("No verifiable claims found.", "warning");
            } else {
                showToast(`Found ${claimsObj.length} claim(s). Click one to verify.`);
            }
        } catch (error) {
            console.error(error);
            showToast("Analysis failed. Please try again.", "error");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSelectClaim = async (claim) => {
        setSelectedClaimId(claim.id);
        if (verdictCache[claim.id]) return;

        setLoadingEvidence(true);
        try {
            const evidenceRes = await getEvidence(claim.text);
            const evList = evidenceRes.evidence || [];
            setEvidenceCache(prev => ({ ...prev, [claim.id]: evList }));

            const verifyRes = await verifyClaim(claim.text, evList);
            setVerdictCache(prev => ({ ...prev, [claim.id]: verifyRes }));
        } catch (error) {
            console.error(error);
            showToast("Verification failed.", "error");
        } finally {
            setLoadingEvidence(false);
        }
    };

    // Keyboard nav
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (claims.length === 0) return;
            const currentIndex = claims.findIndex(c => c.id === selectedClaimId);
            if (e.key === 'ArrowDown' && currentIndex < claims.length - 1) {
                e.preventDefault();
                handleSelectClaim(claims[currentIndex + 1]);
            } else if (e.key === 'ArrowUp' && currentIndex > 0) {
                e.preventDefault();
                handleSelectClaim(claims[currentIndex - 1]);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [claims, selectedClaimId]);

    const currentClaim = claims.find(c => c.id === selectedClaimId);
    const currentEvidence = currentClaim ? evidenceCache[currentClaim.id] : null;
    const currentVerdict = currentClaim ? verdictCache[currentClaim.id] : null;

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-violet-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <AnimatedBackground />

            {/* NAVBAR */}
            <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-gray-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                <ShieldCheck className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    VeriNews
                                </h1>
                                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">AI Fact-Checker</p>
                            </div>
                        </div>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors border border-gray-200 dark:border-slate-700"
                            aria-label="Toggle theme"
                        >
                            <motion.div
                                initial={false}
                                animate={{ rotate: isDark ? 0 : 180 }}
                                transition={{ duration: 0.3 }}
                            >
                                {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-indigo-600" />}
                            </motion.div>
                        </button>
                    </div>
                </div>
            </nav>

            <main className="relative z-10">
                {/* HERO */}
                <motion.section
                    ref={heroRef}
                    className="py-16 sm:py-24 text-center"
                    initial="initial"
                    animate={heroInView ? "animate" : "initial"}
                    variants={motionVariants.staggerContainer}
                >
                    <div className="max-w-4xl mx-auto px-4 sm:px-6">
                        <motion.div variants={motionVariants.fadeInUp} transition={{ duration: 0.6 }}>
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700 mb-6">
                                <Sparkles size={14} /> Enterprise AI Verification
                            </span>
                        </motion.div>

                        <motion.h2
                            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6"
                            variants={motionVariants.fadeInUp}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            <span className="bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Verify News with AI Precision
                            </span>
                        </motion.h2>

                        <motion.p
                            className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8"
                            variants={motionVariants.fadeInUp}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            Paste any article. Our AI extracts claims, finds evidence, and delivers instant fact-check verdicts.
                        </motion.p>

                        <motion.button
                            onClick={() => document.getElementById('analysis')?.scrollIntoView({ behavior: 'smooth' })}
                            className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                            variants={motionVariants.fadeInUp}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            Start Analyzing <ArrowDown size={16} className="animate-bounce" />
                        </motion.button>
                    </div>
                </motion.section>

                {/* ANALYSIS SECTION */}
                <section id="analysis" className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">

                            {/* LEFT COLUMN */}
                            <motion.div
                                className="space-y-6"
                                ref={claimsRef}
                                initial="initial"
                                animate={claimsInView ? "animate" : "initial"}
                                variants={motionVariants.staggerContainer}
                            >
                                {/* Input Card */}
                                <motion.div
                                    className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xl p-6"
                                    variants={motionVariants.fadeInUp}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                                            <FileText size={16} /> Source Text
                                        </h3>
                                        {text && (
                                            <button onClick={() => setText("")} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                                Clear
                                            </button>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <textarea
                                            value={text}
                                            onChange={(e) => setText(e.target.value)}
                                            placeholder="Paste news article text here..."
                                            maxLength={MAX_CHARS}
                                            className="w-full h-40 p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition"
                                        />
                                        <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white/50 dark:bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm pointer-events-none">
                                            {text.length}/{MAX_CHARS}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleAnalyze}
                                        disabled={isAnalyzing || !text.trim()}
                                        className={`w-full mt-4 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${isAnalyzing || !text.trim()
                                            ? 'bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02]'
                                            }`}
                                    >
                                        {isAnalyzing ? <><Loader2 size={18} className="animate-spin" /> Analyzing...</> : <><Search size={18} /> Analyze Content</>}
                                    </button>
                                </motion.div>

                                {/* Claims List */}
                                <motion.div
                                    className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xl p-6 min-h-[400px]"
                                    variants={motionVariants.fadeInUp}
                                    transition={{ delay: 0.1 }}
                                    ref={claimsListRef}
                                    tabIndex={0}
                                >
                                    <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-4">
                                        <BarChart3 size={16} /> Detected Claims
                                        {claims.length > 0 && (
                                            <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                                                {claims.length}
                                            </span>
                                        )}
                                    </h3>

                                    <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                        <AnimatePresence mode="popLayout">
                                            {isAnalyzing ? (
                                                [1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)
                                            ) : claims.length > 0 ? (
                                                claims.map((claim, idx) => (
                                                    <motion.button
                                                        key={claim.id}
                                                        onClick={() => handleSelectClaim(claim)}
                                                        className={`w-full text-left p-4 rounded-xl border transition-all ${selectedClaimId === claim.id
                                                            ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-300 dark:border-purple-600 shadow-lg'
                                                            : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow'
                                                            }`}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <span className="shrink-0 px-2 py-0.5 text-[10px] font-bold rounded bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300">
                                                                {idx + 1}
                                                            </span>
                                                            <p className={`text-sm leading-relaxed ${selectedClaimId === claim.id ? 'text-purple-700 dark:text-purple-200 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                                                                {claim.text}
                                                            </p>
                                                            <ArrowRight size={16} className={`shrink-0 mt-0.5 transition ${selectedClaimId === claim.id ? 'text-purple-500 translate-x-1' : 'text-gray-400 opacity-0 group-hover:opacity-100'}`} />
                                                        </div>
                                                    </motion.button>
                                                ))
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-500">
                                                    <Search size={40} className="mb-3 opacity-30" />
                                                    <p className="font-medium">No claims yet</p>
                                                    <p className="text-sm">Enter text above to start</p>
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* RIGHT COLUMN - Results */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xl min-h-[680px] flex flex-col overflow-hidden">
                                {!currentClaim ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-8">
                                        <motion.div
                                            animate={prefersReducedMotion ? {} : { scale: [1, 1.1, 1] }}
                                            transition={{ duration: 3, repeat: Infinity }}
                                        >
                                            <ShieldCheck size={64} className="mb-4 opacity-30" />
                                        </motion.div>
                                        <p className="text-lg font-medium">Select a claim to verify</p>
                                        <p className="text-sm mt-1">AI analysis will appear here</p>
                                    </div>
                                ) : (
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={selectedClaimId}
                                            className="flex flex-col h-full"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                        >
                                            {/* Header */}
                                            <div className="p-6 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-2">
                                                        <p className="text-xs font-mono uppercase tracking-wide text-gray-500 dark:text-gray-400">Verification Result</p>
                                                        {loadingEvidence ? <Skeleton className="h-10 w-32" /> : currentVerdict ? <VerdictBadge verdict={currentVerdict.verdict} /> : (
                                                            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                                                                <Loader2 size={16} className="animate-spin" />
                                                                <span className="font-medium">Verifying...</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] uppercase text-gray-500 dark:text-gray-400 mb-1">Confidence</p>
                                                        {loadingEvidence ? <Skeleton className="w-14 h-14 rounded-full" /> : <ConfidenceCircle score={currentVerdict ? 87 : 0} />}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                                {/* Claim */}
                                                <div>
                                                    <h4 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">Claim</h4>
                                                    <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700">
                                                        <p className="text-sm italic text-purple-800 dark:text-purple-200">"{currentClaim.text}"</p>
                                                    </div>
                                                </div>

                                                {/* Analysis */}
                                                <div>
                                                    <h4 className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">
                                                        <ShieldCheck size={14} className="text-purple-500" /> AI Analysis
                                                    </h4>
                                                    {loadingEvidence ? (
                                                        <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-11/12" /><Skeleton className="h-4 w-10/12" /></div>
                                                    ) : currentVerdict ? (
                                                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                                                            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{currentVerdict.reason}</p>
                                                        </div>
                                                    ) : null}
                                                </div>

                                                {/* Evidence */}
                                                <div>
                                                    <h4 className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">
                                                        <Globe size={14} className="text-emerald-500" /> Evidence
                                                        {currentEvidence?.length > 0 && <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">{currentEvidence.length}</span>}
                                                    </h4>

                                                    <div className="space-y-3">
                                                        {loadingEvidence ? (
                                                            [1, 2].map(i => <Skeleton key={i} className="h-24 w-full" />)
                                                        ) : currentEvidence?.length > 0 ? (
                                                            currentEvidence.map((ev, i) => (
                                                                <motion.a
                                                                    key={i}
                                                                    href={ev.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="block p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition group"
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: i * 0.1 }}
                                                                >
                                                                    <div className="flex items-start gap-3">
                                                                        <span className="shrink-0 px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                                                                            {i + 1}
                                                                        </span>
                                                                        <div className="flex-1 min-w-0">
                                                                            <h5 className="font-medium text-sm text-emerald-700 dark:text-emerald-300 truncate">{ev.title}</h5>
                                                                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">{ev.snippet || "Click to view source"}</p>
                                                                            <span className="text-[10px] text-gray-400 mt-1 block truncate">{new URL(ev.url).hostname}</span>
                                                                        </div>
                                                                        <ArrowRight size={14} className="shrink-0 text-gray-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition" />
                                                                    </div>
                                                                </motion.a>
                                                            ))
                                                        ) : !loadingEvidence && (
                                                            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                                                                <Globe size={32} className="mx-auto mb-2 opacity-30" />
                                                                <p className="text-sm">No evidence found</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="relative z-10 py-8 text-center border-t border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        VeriNews © {new Date().getFullYear()} • AI-Powered Fact Verification
                    </p>
                </footer>
            </main>

            <AnimatePresence>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </AnimatePresence>
        </div>
    );
}
