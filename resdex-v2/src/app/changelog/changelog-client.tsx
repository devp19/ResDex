"use client";

import { useState, useMemo, useCallback, memo } from "react";
import { ChevronDown, ChevronUp, Search, Filter, Calendar, Tag, Zap, ExternalLink, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BlurFade } from "@/components/magicui/blur-fade";
import { TextAnimate } from "@/components/magicui/text-animate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useRouter } from "next/navigation";

type ChangelogEntry = {
	fileName: string;
	title: string;
	description: string;
	date: string; // ISO string
	version?: string;
	tags?: string[];
	features?: string[];
	bugFixes?: string[];
};

// Search and filter state
interface FilterState {
	search: string;
	selectedTags: string[];
	selectedVersions: string[];
	selectedYear: string;
	selectedQuarter: string;
}

// Date formatting utility
function formatDateToWords(dateString: string): string {
	// Check if it's already in long form (e.g., "January 15, 2025")
	if (dateString.includes(',')) {
		return dateString;
	}
	
	// Parse short form dates (e.g., "2025-01-15")
	const date = new Date(dateString);
	const months = [
		"January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December"
	];
	
	const month = months[date.getMonth()];
	const day = date.getDate();
	const year = date.getFullYear();
	
	// Add ordinal suffix
	const getOrdinalSuffix = (day: number) => {
		if (day >= 11 && day <= 13) return "th";
		switch (day % 10) {
			case 1: return "st";
			case 2: return "nd";
			case 3: return "rd";
			default: return "th";
		}
	};
	
	return `${month} ${day}${getOrdinalSuffix(day)}, ${year}`;
}

// Get quarter from date
function getQuarter(dateString: string): string {
	// Handle both long form (e.g., "January 15, 2025") and short form (e.g., "2025-01-15") dates
	const date = new Date(dateString);
	const year = date.getFullYear();
	const month = date.getMonth() + 1; // 0-indexed
	
	if (month >= 1 && month <= 3) return `Q1 ${year}`;
	if (month >= 4 && month <= 6) return `Q2 ${year}`;
	if (month >= 7 && month <= 9) return `Q3 ${year}`;
	return `Q4 ${year}`;
}

// Custom Dropdown Component
const CustomDropdown = memo(function CustomDropdown({ 
	value, 
	onChange, 
	options, 
	placeholder, 
	label 
}: { 
	value: string; 
	onChange: (value: string) => void; 
	options: string[]; 
	placeholder: string; 
	label: string; 
}) {
	const [isOpen, setIsOpen] = useState(false);

	const handleSelect = useCallback((option: string) => {
		onChange(option);
		// Add a small delay to allow the selection animation to complete
		setTimeout(() => setIsOpen(false), 100);
	}, [onChange]);

	const handleToggle = useCallback(() => {
		setIsOpen(prev => !prev);
	}, []);

	return (
		<div className="relative">
			<label className="block text-xs text-gray-500 mb-2">{label}</label>
			<button
				type="button"
				onClick={handleToggle}
				className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
			>
				<span className={`transition-colors duration-200 ${value ? "text-gray-900" : "text-gray-500"}`}>
					{value || placeholder}
				</span>
				<motion.div
					animate={{ rotate: isOpen ? 180 : 0 }}
					transition={{ duration: 0.3, ease: "easeInOut" }}
				>
					<ChevronDown className="h-4 w-4 text-gray-500" />
				</motion.div>
			</button>
			
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: -8, scale: 0.95, height: 0 }}
						animate={{ 
							opacity: 1, 
							y: 0, 
							scale: 1,
							height: "auto"
						}}
						exit={{ 
							opacity: 0, 
							y: -8, 
							scale: 0.95,
							height: 0
						}}
						transition={{ 
							duration: 0.3, 
							ease: "easeInOut",
							opacity: { duration: 0.25 },
							y: { duration: 0.3 },
							scale: { duration: 0.3 },
							height: { duration: 0.3 }
						}}
						className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden"
						style={{ maxHeight: "12rem" }}
					>
						<div className="overflow-y-auto" style={{ maxHeight: "12rem" }}>
							{options.map((option, index) => (
								<motion.button
									key={option}
									type="button"
									onClick={() => handleSelect(option)}
									initial={{ opacity: 0, x: -10 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ 
										delay: index * 0.015,
										duration: 0.2,
										ease: "easeOut"
									}}
									className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center justify-between group transition-colors duration-150"
								>
									<span className="text-sm text-gray-900">{option}</span>
									<motion.div
										initial={{ scale: 0 }}
										animate={{ scale: value === option ? 1 : 0 }}
										transition={{ duration: 0.2, ease: "easeOut" }}
									>
										<Check className="h-4 w-4 text-blue-500" />
									</motion.div>
								</motion.button>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
});

// Filter Modal Component - moved outside to prevent recreation
const FilterModal = memo(({ 
	isOpen, 
	onClose, 
	filters, 
	onSearchChange, 
	onTagToggle, 
	onYearChange,
	onQuarterChange,
	onClearFilters, 
	allTags,
	availableYears,
	availableQuarters
}: {
	isOpen: boolean;
	onClose: () => void;
	filters: FilterState;
	onSearchChange: (value: string) => void;
	onTagToggle: (tag: string) => void;
	onYearChange: (year: string) => void;
	onQuarterChange: (quarter: string) => void;
	onClearFilters: () => void;
	allTags: string[];
	availableYears: string[];
	availableQuarters: string[];
}) => (
	<AnimatePresence>
		{isOpen && (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
				onClick={onClose}
			>
				<motion.div
					initial={{ scale: 0.95, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					exit={{ scale: 0.95, opacity: 0 }}
					className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
					onClick={(e) => e.stopPropagation()}
				>
					{/* Modal Header */}
					<div className="flex items-center justify-between p-6 border-b border-gray-200">
						<h2 className="text-xl font-semibold text-gray-900" style={{ fontFamily: "Satoshi-Medium, sans-serif" }}>
							Filter Changelog
						</h2>
						<button
							onClick={onClose}
							className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
						>
							<X className="h-5 w-5 text-gray-500" />
						</button>
					</div>

					{/* Modal Content */}
					<div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
						{/* Search */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Search
							</label>
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
								<Input
									placeholder="Search changelog entries..."
									value={filters.search}
									onChange={(e) => onSearchChange(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>

						{/* Tags */}
						{allTags.length > 0 && (
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-3">
									Tags
								</label>
								<div className="flex flex-wrap gap-2">
									{allTags.map(tag => (
										<Button
											key={tag}
											variant={filters.selectedTags.includes(tag) ? "default" : "outline"}
											size="sm"
											onClick={() => onTagToggle(tag)}
											className="h-8"
										>
											<Tag className="h-3 w-3 mr-1" />
											{tag}
										</Button>
									))}
								</div>
							</div>
						)}

						{/* Year and Quarter Selection */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-3">
								Time Period
							</label>
							<div className="grid grid-cols-2 gap-4">
								<CustomDropdown
									value={filters.selectedYear}
									onChange={onYearChange}
									options={availableYears}
									placeholder="Select Year"
									label="Year"
								/>
								<CustomDropdown
									value={filters.selectedQuarter}
									onChange={onQuarterChange}
									options={availableQuarters}
									placeholder="Select Quarter"
									label="Quarter"
								/>
							</div>
						</div>
					</div>

					{/* Modal Footer */}
					<div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
						<Button
							variant="outline"
							onClick={onClearFilters}
						>
							Clear All Filters
						</Button>
						<Button onClick={onClose}>
							Apply Filters
						</Button>
					</div>
				</motion.div>
			</motion.div>
		)}
	</AnimatePresence>
));

// Search Component - isolated to prevent re-renders
const SearchInput = memo(function SearchInput({ 
	value, 
	onChange 
}: { 
	value: string; 
	onChange: (value: string) => void; 
}) {
	return (
		<div className="relative flex-1">
			<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
			<Input
				placeholder="Search changelog entries..."
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="pl-10 h-12 text-base"
			/>
		</div>
	);
});

// Hero Section - memoized to prevent re-renders
const HeroSection = memo(function HeroSection() {
	return (
		<BlurFade delay={0.1} inView>
			<div className="text-center mb-16">
				{/* Hero Image */}
				<div className="mb-7">
					<Image
						src="/beige-logo.png"
						alt="ResDex Changelog"
						width={70}
						height={70}
						className="mx-auto rounded-2xl"
					/>
				</div>
				<TextAnimate
					animation="fadeIn"
					by="line"
					as="h1"
					className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
					style={{ fontFamily: "Satoshi-Bold, sans-serif" }}
				>
					Changelog
				</TextAnimate>
				<TextAnimate
					animation="fadeIn"
					by="line"
					as="p"
					className="text-xl text-gray-600 max-w-2xl mx-auto"
					style={{ fontFamily: "Satoshi-Regular, sans-serif" }}
				>
					Stay updated with the latest features, improvements, and fixes.
				</TextAnimate>
			</div>
		</BlurFade>
	);
});

// Search and Filters Section - memoized to prevent re-renders
const SearchAndFiltersSection = memo(function SearchAndFiltersSection({ 
	searchValue, 
	onSearchChange, 
	onModalOpen, 
	activeFilterCount 
}: { 
	searchValue: string; 
	onSearchChange: (value: string) => void; 
	onModalOpen: () => void; 
	activeFilterCount: number; 
}) {
	return (
		<BlurFade delay={0.2} inView>
			<div className="mb-12">
				<div className="flex flex-col lg:flex-row gap-4">
					{/* Search Bar */}
					<SearchInput
						value={searchValue}
						onChange={onSearchChange}
					/>
					{/* Filter Button */}
					<Button
						variant="outline"
						onClick={onModalOpen}
						className="h-12 relative"
					>
						<Filter className="h-4 w-4 mr-2" />
						Filters
						{activeFilterCount > 0 && (
							<span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
								{activeFilterCount}
							</span>
						)}
					</Button>
				</div>
			</div>
		</BlurFade>
	);
});

const Section = memo(function Section({ title, items, icon: Icon }: { title: string; items?: string[]; icon?: any }) {
	const [isExpanded, setIsExpanded] = useState(false);
	
	if (!items || items.length === 0) return null;
	
	return (
		<motion.div 
			className="group rounded-xl border border-gray-200 bg-white/50 p-4 hover:bg-white transition-colors cursor-pointer"
			initial={false}
			animate={{ height: "auto" }}
			onClick={() => setIsExpanded(!isExpanded)}
		>
			<div className="flex w-full items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					{Icon && <Icon className="h-4 w-4 text-gray-600" />}
					<span className="text-sm font-semibold text-gray-900" style={{ fontFamily: "Satoshi-Medium, sans-serif" }}>
						{title}
					</span>
					<span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
						{items.length}
					</span>
				</div>
				<motion.div
					animate={{ rotate: isExpanded ? 180 : 0 }}
					transition={{ duration: 0.2 }}
				>
					<ChevronDown className="h-4 w-4 text-gray-500" />
				</motion.div>
			</div>
			<AnimatePresence>
				{isExpanded && (
					<motion.ul
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3, ease: "easeInOut" }}
						className="mt-3 space-y-2 overflow-hidden"
					>
						{items.map((item, idx) => (
							<motion.li
								key={idx}
								initial={{ x: -10, opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								transition={{ delay: idx * 0.05 }}
								className="flex items-start gap-2 text-sm text-gray-700 pl-6"
								style={{ fontFamily: "Satoshi-Regular, sans-serif" }}
							>
								<span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-400 flex-shrink-0" />
								<span>{item}</span>
							</motion.li>
						))}
					</motion.ul>
				)}
			</AnimatePresence>
		</motion.div>
	);
});

interface ChangelogClientProps {
	entries: ChangelogEntry[];
}

export const ChangelogClient = memo(function ChangelogClient({ entries }: ChangelogClientProps) {
	const [filters, setFilters] = useState<FilterState>({
		search: "",
		selectedTags: [],
		selectedVersions: [],
		selectedYear: "All Years",
		selectedQuarter: "All Quarters"
	});
	const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
	
	// Get the latest quarter to open by default
	const latestQuarter = useMemo(() => {
		if (entries.length === 0) return null;
		const latestEntry = entries[0]; // entries are already sorted by date descending
		return getQuarter(latestEntry.date);
	}, [entries]);
	
	const [expandedQuarters, setExpandedQuarters] = useState<Set<string>>(
		latestQuarter ? new Set([latestQuarter]) : new Set()
	);
	const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
	const router = useRouter();

	// Get unique tags and versions for filters
	const allTags = useMemo(() => {
		const tags = new Set<string>();
		entries.forEach(entry => {
			entry.tags?.forEach(tag => tags.add(tag));
		});
		return Array.from(tags).sort();
	}, [entries]);

	// Get available years and quarters
	const availableYears = useMemo(() => {
		const years = new Set<string>();
		entries.forEach(entry => {
			const year = new Date(entry.date).getFullYear().toString();
			years.add(year);
		});
		const sortedYears = Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
		return ["All Years", ...sortedYears];
	}, [entries]);

	const availableQuarters = useMemo(() => {
		const quarters = new Set<string>();
		entries.forEach(entry => {
			const quarter = getQuarter(entry.date);
			quarters.add(quarter);
		});
		const sortedQuarters = Array.from(quarters).sort((a, b) => {
			const [qA, yearA] = a.split(' ');
			const [qB, yearB] = b.split(' ');
			if (yearA !== yearB) return parseInt(yearB) - parseInt(yearA);
			return parseInt(qB.slice(1)) - parseInt(qA.slice(1));
		});
		return ["All Quarters", ...sortedQuarters];
	}, [entries]);

	// Filter entries based on search and filters
	const filteredEntries = useMemo(() => {
		return entries.filter(entry => {
			// Search filter
			if (filters.search) {
				const searchLower = filters.search.toLowerCase();
				const matchesSearch = 
					entry.title.toLowerCase().includes(searchLower) ||
					entry.description.toLowerCase().includes(searchLower) ||
					entry.features?.some(f => f.toLowerCase().includes(searchLower)) ||
					entry.bugFixes?.some(f => f.toLowerCase().includes(searchLower));
				if (!matchesSearch) return false;
			}

			// Tag filter
			if (filters.selectedTags.length > 0) {
				const hasMatchingTag = entry.tags?.some(tag => filters.selectedTags.includes(tag));
				if (!hasMatchingTag) return false;
			}

			// Year filter
			if (filters.selectedYear && filters.selectedYear !== "All Years") {
				const entryYear = new Date(entry.date).getFullYear().toString();
				if (entryYear !== filters.selectedYear) return false;
			}

			// Quarter filter
			if (filters.selectedQuarter && filters.selectedQuarter !== "All Quarters") {
				const entryQuarter = getQuarter(entry.date);
				if (entryQuarter !== filters.selectedQuarter) return false;
			}

			return true;
		});
	}, [entries, filters]);

	// Group entries by quarter
	const entriesByQuarter = useMemo(() => {
		const grouped: { [key: string]: ChangelogEntry[] } = {};
		filteredEntries.forEach(entry => {
			const quarter = getQuarter(entry.date);
			if (!grouped[quarter]) {
				grouped[quarter] = [];
			}
			grouped[quarter].push(entry);
		});
		
		// Sort quarters by year and quarter (newest first)
		const sortedQuarters = Object.keys(grouped).sort((a, b) => {
			const [qA, yearA] = a.split(' ');
			const [qB, yearB] = b.split(' ');
			if (yearA !== yearB) return parseInt(yearB) - parseInt(yearA);
			return parseInt(qB.slice(1)) - parseInt(qA.slice(1));
		});
		
		return sortedQuarters.map(quarter => ({
			quarter,
			entries: grouped[quarter].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		}));
	}, [filteredEntries]);

	const toggleEntryExpansion = useCallback((fileName: string) => {
		setExpandedEntries(prev => {
			const newSet = new Set(prev);
			if (newSet.has(fileName)) {
				newSet.delete(fileName);
			} else {
				newSet.add(fileName);
			}
			return newSet;
		});
	}, []);

	const toggleQuarterExpansion = useCallback((quarter: string) => {
		setExpandedQuarters(prev => {
			const newSet = new Set(prev);
			if (newSet.has(quarter)) {
				newSet.delete(quarter);
			} else {
				newSet.add(quarter);
			}
			return newSet;
		});
	}, []);

	const handleClick = useCallback(() => {
		router.push("/waitlist");
	}, [router]);

	const handleSearchChange = useCallback((value: string) => {
		setFilters(prev => ({ ...prev, search: value }));
	}, []);

	const handleTagToggle = useCallback((tag: string) => {
		setFilters(prev => ({
			...prev,
			selectedTags: prev.selectedTags.includes(tag)
				? prev.selectedTags.filter(t => t !== tag)
				: [...prev.selectedTags, tag]
		}));
	}, []);

	const handleYearChange = useCallback((year: string) => {
		setFilters(prev => ({
			...prev,
			selectedYear: year,
			selectedQuarter: "" // Reset quarter when year changes
		}));
	}, []);

	const handleQuarterChange = useCallback((quarter: string) => {
		setFilters(prev => ({
			...prev,
			selectedQuarter: quarter
		}));
	}, []);

	const handleClearFilters = useCallback(() => {
		setFilters({
			search: "",
			selectedTags: [],
			selectedVersions: [],
			selectedYear: "All Years",
			selectedQuarter: "All Quarters"
		});
	}, []);

	const handleModalClose = useCallback(() => {
		setIsFilterModalOpen(false);
	}, []);

	const handleModalOpen = useCallback(() => {
		setIsFilterModalOpen(true);
	}, []);

	// Count active filters
	const activeFilterCount = useMemo(() => {
		let count = 0;
		if (filters.search) count++;
		if (filters.selectedTags.length > 0) count++;
		if (filters.selectedVersions.length > 0) count++;
		if (filters.selectedYear && filters.selectedYear !== "All Years") count++;
		if (filters.selectedQuarter && filters.selectedQuarter !== "All Quarters") count++;
		return count;
	}, [filters]);


	return (
		<div className="min-h-screen bg-white">
			{/* Filter Modal */}
			<FilterModal
				isOpen={isFilterModalOpen}
				onClose={handleModalClose}
				filters={filters}
				onSearchChange={handleSearchChange}
				onTagToggle={handleTagToggle}
				onYearChange={handleYearChange}
				onQuarterChange={handleQuarterChange}
				onClearFilters={handleClearFilters}
				allTags={allTags}
				availableYears={availableYears}
				availableQuarters={availableQuarters}
			/>
			
			{/* Navigation */}
			<nav className="relative z-10 flex items-center py-6 px-8 w-full max-w-7xl mx-auto">
				{/* Logo */}
				<div className="flex items-center gap-2 flex-shrink-0">
					<Image
						src="/beige-logo.png"
						alt="ResDex Logo"
						width={32}
						height={32}
					/>
					<span className="ml-1 text-xl font-semibold">ResDex</span>
				</div>
				{/* Nav Links - centered absolutely */}
				<div
					className="hidden md:flex gap-6 bg-gray-50 rounded-full px-4 py-2 text-sm font-medium absolute left-1/2 -translate-x-1/2"
					style={{ fontFamily: "GellixMedium, sans-serif" }}
				>
					<a
						href="/"
						className="px-3 py-2 rounded-full hover:bg-gray-100 transition"
					>
						Home
					</a>
					<a
						href="/digest"
						className="px-3 py-2 rounded-full hover:bg-gray-100 transition"
					>
						Digest
					</a>
					<a
						href="/about"
						className="px-3 py-2 rounded-full hover:bg-gray-100 transition"
					>
						About
					</a>
					<a
						href="/changelog"
						className="px-3 py-2 rounded-full hover:bg-gray-100 transition text-black bg-white shadow"
					>
						Changelog
					</a>
				</div>
				{/* Right side: Discord + Wallet */}
				<div className="flex items-center gap-2 flex-shrink-0 ml-auto">
					<button
						onClick={async () => {
							const pw = prompt("Enter developer password:");
							if (!pw) return;
							try {
								const res = await fetch("/api/admin", {
									method: "POST",
									headers: { "Content-Type": "application/json" },
									body: JSON.stringify({ password: pw }),
								});
								if (res.ok) {
									localStorage.setItem("devAccess", "true");
									alert("Access granted! Redirecting to signup page...");
									router.push("/signup");
								} else {
									alert("Incorrect password!");
								}
							} catch (err) {
								alert("Something went wrong.");
							}
						}}
						className="rounded-full p-2 hover:bg-gray-100 transition"
					>
						<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
							<circle cx="12" cy="12" r="10" fill="#23272A" />
							<path
								d="M8.5 15.5C8.5 15.5 9.5 16 12 16C14.5 16 15.5 15.5 15.5 15.5"
								stroke="#fff"
								strokeWidth="1.5"
								strokeLinecap="round"
							/>
							<ellipse cx="9.5" cy="12" rx="1" ry="1.5" fill="#fff" />
							<ellipse cx="14.5" cy="12" rx="1" ry="1.5" fill="#fff" />
						</svg>
					</button>
					<button
						onClick={handleClick}
						className="rounded-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black font-medium transition"
						style={{
							fontFamily: "GellixMedium, sans-serif",
							cursor: "pointer",
						}}
					>
						Join Waitlist ↗
					</button>
				</div>
			</nav>

			{/* Hero Section with Image */}
			<section className="relative py-24 px-4 sm:px-6 lg:px-8">
				<div className="max-w-7xl mx-auto">
					<HeroSection />

					{/* Search and Filters */}
					<SearchAndFiltersSection
						searchValue={filters.search}
						onSearchChange={handleSearchChange}
						onModalOpen={handleModalOpen}
						activeFilterCount={activeFilterCount}
					/>

					{/* GitHub-style Quarterly Layout */}
					<BlurFade delay={0.3} inView>
						<div className="space-y-16">
							{entriesByQuarter.map(({ quarter, entries: quarterEntries }, quarterIndex) => {
								const isQuarterExpanded = expandedQuarters.has(quarter);
								
								return (
								<motion.div
									key={quarter}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: quarterIndex * 0.1 }}
									className="space-y-8"
								>
										{/* Collapsible Quarter Header */}
										<button
											onClick={() => toggleQuarterExpansion(quarter)}
											className="w-full group hover:bg-gray-50 rounded-xl p-4 transition-colors"
										>
									<div className="flex items-center gap-4">
										<div className="h-px bg-gray-300 flex-1" />
											<div className="flex items-center gap-3">
												<h2 className="text-2xl font-bold text-gray-900 group-hover:text-gray-700" style={{ fontFamily: "Satoshi-Bold, sans-serif" }}>
											{quarter}
										</h2>
												<motion.div
													animate={{ rotate: isQuarterExpanded ? 180 : 0 }}
													transition={{ duration: 0.2 }}
													className="text-gray-500"
												>
													<ChevronDown className="h-5 w-5" />
												</motion.div>
											</div>
										<div className="h-px bg-gray-300 flex-1" />
									</div>
										</button>

										{/* Collapsible Quarter Entries */}
										<AnimatePresence>
											{isQuarterExpanded && (
												<motion.div
													initial={{ height: 0, opacity: 0 }}
													animate={{ height: "auto", opacity: 1 }}
													exit={{ height: 0, opacity: 0 }}
													transition={{ duration: 0.3, ease: "easeInOut" }}
													className="space-y-6 overflow-hidden"
												>
										{quarterEntries.map((entry, index) => {
											const isExpanded = expandedEntries.has(entry.fileName);
											
											return (
												<motion.div
													key={entry.fileName}
													initial={{ opacity: 0, x: -20 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ delay: index * 0.05 }}
													className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
												>
													{/* Entry Header - Clickable area */}
													<div 
														className="p-6 cursor-pointer"
														onClick={() => toggleEntryExpansion(entry.fileName)}
													>
														<div className="flex items-start justify-between mb-4">
															<div className="flex-1">
																<div className="flex items-center gap-3 mb-2">
																	<h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: "Satoshi-Medium, sans-serif" }}>
																		{entry.title}
																	</h3>
																</div>
																<p className="text-gray-600 mb-3 text-sm" style={{ fontFamily: "Satoshi-Regular, sans-serif" }}>
																	{entry.description}
																</p>
																<div className="flex items-center gap-4 text-sm text-gray-500">
																	<div className="flex items-center gap-1">
																		<Calendar className="h-4 w-4" />
																		{formatDateToWords(entry.date)}
																	</div>
																	{entry.version && (
																		<div className="flex items-center gap-1">
																			<span className="bg-black text-white text-xs font-semibold px-2 py-1 rounded-sm">
																				v{entry.version}
																			</span>
																		</div>
																	)}
																</div>
															</div>
															<Button
																variant="ghost"
																size="sm"
																onClick={(e) => {
																	e.stopPropagation();
																	toggleEntryExpansion(entry.fileName);
																}}
																className="ml-4"
															>
																{isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
															</Button>
														</div>

														{/* Tags */}
														{entry.tags && entry.tags.length > 0 && (
															<div className="flex flex-wrap gap-2 mb-4">
																{entry.tags.map(tag => (
																	<span
																		key={tag}
																		className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-md"
																	>
																		{tag}
																	</span>
																))}
															</div>
														)}
													</div>

													{/* Expandable Content */}
													<AnimatePresence>
														{isExpanded && (
															<motion.div
																initial={{ height: 0, opacity: 0 }}
																animate={{ height: "auto", opacity: 1 }}
																exit={{ height: 0, opacity: 0 }}
																transition={{ duration: 0.3, ease: "easeInOut" }}
																className="border-t border-gray-100 bg-gray-50/50"
															>
																<div className="p-6 space-y-4">
																	<Section title="Features" items={entry.features} icon={Zap} />
																	<Section title="Bug Fixes" items={entry.bugFixes} icon={Filter} />
																</div>
															</motion.div>
														)}
													</AnimatePresence>
												</motion.div>
											);
										})}
												</motion.div>
											)}
										</AnimatePresence>
								</motion.div>
								);
							})}
						</div>
					</BlurFade>
				</div>
			</section>

		</div>
	);
});
