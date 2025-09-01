import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, User } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: string;
  full_name: string;
  username: string;
  bio: string;
  avatar_url: string;
}

interface SearchBarProps {
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ className = "" }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced search function
  useEffect(() => {
    const delayedSearch = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        await performSearch(searchQuery.trim());
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300); // 300ms delay

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    
    try {
      const { data, error } = await supabase
        .from("dev_profiles")
        .select("id, full_name, username, bio, avatar_url")
        .or(`full_name.ilike.%${query}%, username.ilike.%${query}%, bio.ilike.%${query}%`)
        .limit(5);

      if (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } else {
        setSearchResults(data || []);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    }
    
    setIsSearching(false);
  };

  const handleResultClick = (username: string) => {
    router.push(`/profile/${username}`);
    setShowResults(false);
    setSearchQuery("");
  };

  const handleInputFocus = () => {
    if (searchResults.length > 0) {
      setShowResults(true);
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleInputFocus}
          className="rounded-full bg-white/30 backdrop-blur-md border-none shadow-none focus-visible:ring-2 focus-visible:ring-blue-200 placeholder:text-gray-400 px-6 py-3 h-12 w-full text-base !outline-none pr-12"
          style={{ 
            boxShadow: "0 2px 16px 0 rgba(80, 72, 72, 0.04)", 
            background: "rgba(255,255,255,0.35)" 
          }}
        />
        <SearchIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto mb-2"></div>
              Searching...
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                Users ({searchResults.length})
              </div>
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleResultClick(user.username)}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {user.avatar_url ? (
                        <Image
                          src={user.avatar_url}
                          alt={user.full_name || user.username}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/empty-pic.webp";
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user.full_name || user.username}
                        </p>
                        <p className="text-sm text-gray-500">
                          @{user.username}
                        </p>
                      </div>
                      {user.bio && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : searchQuery.trim().length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              No users found for "{searchQuery}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;