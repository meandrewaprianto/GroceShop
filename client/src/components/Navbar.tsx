import { ArrowUpRightIcon, BikeIcon, ChevronDownIcon, HeartIcon, LogOutIcon, MapPinIcon, MenuIcon, PackageIcon, SearchIcon, ShieldIcon, ShoppingCartIcon, UserIcon, XIcon } from "lucide-react";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useNotification } from "../context/NotificationContext";
import { BellIcon, BellOffIcon } from "lucide-react";
import api from "../config/api";
import LanguageSwitcher from "./LanguageSwitcher";
import DarkModeToggle from "./DarkModeToggle";
import { formatPriceToIDR } from "../utils/formatCurrency";

interface Suggestion {
    id: string;
    name: string;
    image: string;
    price: number;
    unit: string;
    category: string;
}

const Navbar = () => {
    const { user, logout } = useAuth();
    const { wishlistCount } = useWishlist();
    const { isSubscribed, isSupported, subscribeToPush, unsubscribeFromPush } = useNotification();
    const { cartCount, setIsCartOpen } = useCart()
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const navigate = useNavigate();
    const searchRef = useRef<HTMLFormElement>(null);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const fetchSuggestions = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        try {
            const { data } = await api.get(`/products/search?q=${encodeURIComponent(query.trim())}&limit=5`);
            setSuggestions(data.suggestions || []);
            setShowSuggestions(data.suggestions?.length > 0);
            setSelectedIndex(-1);
        } catch {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            fetchSuggestions(value);
        }, 300);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            navigate(`/products/${suggestions[selectedIndex].id}`);
        } else if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
        setSearchQuery("");
        setShowSuggestions(false);
        setSuggestions([]);
    };

    const handleSuggestionClick = (id: string) => {
        navigate(`/products/${id}`);
        setSearchQuery("");
        setShowSuggestions(false);
        setSuggestions([]);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions || suggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, -1));
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Cleanup debounce timer
    useEffect(() => {
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, []);

    const handleLogout = () => {
        logout();
        setUserMenuOpen(false);
        navigate("/");
    }

    const highlightMatch = (text: string, query: string) => {
        if (!query.trim()) return text;
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, i) =>
            regex.test(part)
                ? <span key={i} className="font-semibold text-app-green">{part}</span>
                : part
        );
    };

    const { t } = useTranslation();

    return (
        <nav className="bg-white dark:bg-gray-900 sticky top-0 z-50 border-b border-app-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 gap-4">
                {/* LOGO */}
                <Link to='/' className="flex items-center gap-2 text-[22px] font-medium shrink-0">
                    <BikeIcon size={24} /> GroceShop
                </Link>

                <div className="w-full flex items-center justify-end gap-4 lg:gap-10">
                    {/* Nav Links - Desktop */}
                    <div className="hidden md:flex items-center gap-6 text-sm text-zinc-600 dark:text-zinc-400">
                        <Link to='/'>{t('nav.home')}</Link>
                        <Link to='/products'>{t('nav.products')}</Link>
                        <Link to='/deals' className="text-app-orange">{t('nav.deals')}</Link>
                    </div>

                    {/* Search with Autocomplete */}
                    <form onSubmit={handleSearchSubmit} className="hidden sm:flex flex-1 max-w-sm text-xs sm:text-sm" ref={searchRef}>
                        <div className="relative w-full">
                            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-zinc-500 dark:text-zinc-400" />
                            <input
                                type="text"
                                placeholder={t('nav.search')}
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onKeyDown={handleKeyDown}
                                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                                autoComplete="off"
                                className="w-full pl-8 p-2 bg-orange-50 dark:bg-gray-800 dark:text-slate-200 dark:placeholder:text-zinc-500 rounded-full ring ring-app-orange/15 focus:ring-app-orange/30 focus:outline-none" />

                            {/* Suggestions Dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-app-border overflow-hidden z-50 animate-fade-in">
                                    {suggestions.map((suggestion, index) => (
                                        <button
                                            key={suggestion.id}
                                            type="button"
                                            onClick={() => handleSuggestionClick(suggestion.id)}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                            className={`flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors ${index === selectedIndex ? 'bg-app-cream-dark' : 'hover:bg-app-cream-dark/50'
                                                }`}
                                        >
                                            <img
                                                src={suggestion.image}
                                                alt={suggestion.name}
                                                className="size-10 rounded-lg object-cover shrink-0 bg-app-cream"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-zinc-900 dark:text-slate-200 truncate">
                                                    {highlightMatch(suggestion.name, searchQuery)}
                                                </p>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                    {formatPriceToIDR(suggestion.price)} / {suggestion.unit}
                                                </p>
                                            </div>
                                            <span className="text-[10px] uppercase tracking-wider text-zinc-400 shrink-0 px-2 py-0.5 bg-app-cream dark:bg-gray-700 rounded-full">
                                                {suggestion.category}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </form>

                    {/* Right Actions */}
                    <div className="flex items-center gap-1">
                        {/* Dark Mode Toggle */}
                        <DarkModeToggle />
                        {/* Language Switcher */}
                        <LanguageSwitcher />

                        {/* Wishlist */}
                        <Link to="/wishlist" className="relative p-2 rounded-xl hidden sm:block">
                            <HeartIcon className="size-5 text-zinc-900 dark:text-slate-200" />
                            {wishlistCount > 0 && <span className="absolute -top-1 -right-1 size-4 bg-red-500 text-white text-[10px] rounded-full flex-center">{wishlistCount}</span>}
                        </Link>

                        {/* Cart */}
                        <button className="relative p-2 rounded-xl" onClick={() => setIsCartOpen(true)}>
                            <ShoppingCartIcon className="size-5 text-zinc-900 dark:text-slate-200" />
                            {cartCount > 0 && <span className="absolute -top-1 -right-1 size-4 bg-app-orange text-white text-[10px] rounded-full flex-center">{cartCount}</span>}
                        </button>

                        {/* User */}
                        <div className="relative">

                            {user ? (
                                <button className="flex items-center gap-2 p-2" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                                    <div className="size-7 rounded-full bg-green-950 dark:bg-app-green text-white dark:text-gray-900 flex-center">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <ChevronDownIcon className="size-3 text-zinc-500 dark:text-zinc-400" />
                                </button>
                            ) : (
                                <div className="flex-center gap-2">
                                    <Link to='/login' className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-white dark:text-gray-900 bg-green-950 dark:bg-app-green rounded-full hover:bg-green-950-light transition-colors">
                                        <UserIcon size={16} /> {t('nav.signIn')}
                                    </Link>
                                    {userMenuOpen ? <XIcon className="md:hidden" onClick={() => setUserMenuOpen(!userMenuOpen)} /> : <MenuIcon className="md:hidden" onClick={() => setUserMenuOpen(!userMenuOpen)} />}
                                </div>
                            )}

                            {userMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                                    <div className="absolute right-0 mt-2.5 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-app-border py-2 z-50 animate-fade-in">
                                        {user && (
                                            <div className="px-4 py-2 border-b border-app-border">
                                                <p className="text-sm font-medium text-zinc-900 dark:text-slate-100">{user?.name}</p>
                                                <p className="text-xs text-zinc-500">{user?.email}</p>
                                            </div>
                                        )}
                                        <div onClick={() => setUserMenuOpen(false)}>
                                            {!user && <Link to='/login' className="dropdown-link"><UserIcon size={16} /> {t('nav.signIn')}</Link>}
                                            {user && <Link to='/wishlist' className="dropdown-link"><HeartIcon size={16} /> {t('nav.wishlist')}</Link>}
                                            {user && <Link to='/orders' className="dropdown-link"><PackageIcon size={16} /> {t('nav.myOrders')}</Link>}
                                            {user && <Link to='/addresses' className="dropdown-link"><MapPinIcon size={16} /> {t('nav.addresses')}</Link>}

                                            <Link to="/products" className="dropdown-link md:hidden"><ArrowUpRightIcon size={16} /> {t('nav.products')}</Link>
                                            <Link to="/deals" className="dropdown-link md:hidden"><ArrowUpRightIcon size={16} /> {t('nav.deals')}</Link>

                                            {user?.isAdmin && (
                                                <Link to="/admin/products" className="dropdown-link"><ShieldIcon size={16} className="text-app-orange-dark" />
                                                    <span className="text-app-orange-dark">{t('nav.adminPanel')}</span>
                                                </Link>
                                            )}

                                            {user && isSupported && (
                                                <div className="border-t border-app-border pt-1">
                                                    <button
                                                        onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 dark:text-slate-300 hover:bg-zinc-50 dark:hover:bg-gray-800 w-full transition-colors">
                                                        {isSubscribed ? <BellOffIcon size={16} /> : <BellIcon size={16} />}
                                                        {isSubscribed ? "Disable Notifications" : "Enable Notifications"}
                                                    </button>
                                                </div>
                                            )}
                                            {user && (
                                                <div className="border-t border-app-border pt-1">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-app-error hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-colors">
                                                        <LogOutIcon size={16} /> {t('nav.logout')}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </nav>
    )
}

export default Navbar
