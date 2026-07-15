import React from 'react';
import {
    Search,
    ShoppingCart,
    Filter,
    ChevronDown,
    Star,
    Info,
    Sparkles,
    Zap,
    TrendingUp,
    LayoutGrid,
    List,
    Heart
} from 'lucide-react';

const PRODUCTS = [
    { id: 1, name: 'Steelcase Gesture Chair', category: 'Ergonomic Seating', price: 1240, rating: 4.9, image: 'office chair', aiBadge: 'Best Seller', aiReason: 'Highest durability rating in regional trials', availability: 'In Stock' },
    { id: 2, name: 'Herman Miller Embody', category: 'Executive Seating', price: 1895, rating: 5.0, image: 'modern office chair', aiBadge: 'AI Recommended', aiReason: 'Optimized for high-posture employees (8+ hours)', availability: '2-3 weeks' },
    { id: 3, name: 'Logitech MX Master 3S', category: 'Peripherals', price: 99, rating: 4.8, image: 'computer mouse', aiBadge: 'Efficiency+', aiReason: 'Preferred by 92% of power users in your org', availability: 'In Stock' },
    { id: 4, name: 'Dell UltraSharp 32" 4K', category: 'Displays', price: 1049, rating: 4.7, image: 'computer monitor', aiBadge: 'Value Pick', aiReason: 'Best price-to-performance ratio for creative roles', availability: 'Limited' },
];

export default function SpecializedCatalog() {
    return (
        <div className="bg-background text-foreground font-sans flex selection:bg-primary selection:text-primary-foreground">
            <main className="flex-1 p-8 space-y-8 max-w-[1600px] mx-auto w-full">
                {/* Banner */}
                <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background border border-primary/20 p-12 flex flex-col md:flex-row items-center gap-12 group">
                    <div className="flex-1 space-y-6">
                        <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/30 animate-pulse">
                            <Sparkles size={14} />
                            Regional Refresh Active
                        </div>
                        <h2 className="text-5xl font-black tracking-tighter leading-none">
                            Smart-Selection <br />
                            <span className="text-primary italic">Enabled for West Office</span>
                        </h2>
                        <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-xl">
                            We've analyzed your regional tax overhead and employee ergonomics data to curate a list of assets that minimize shipping time and maximize productivity outputs.
                        </p>
                        <div className="flex gap-4">
                            <button className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-primary/30 hover:scale-[1.05] transition-all flex items-center gap-3">
                                View Full Curated List
                                <Zap size={18} className="fill-current" />
                            </button>
                            <button className="bg-muted hover:bg-muted/80 px-8 py-4 rounded-2xl font-black text-sm transition-all">
                                Compare with Standard
                            </button>
                        </div>
                    </div>
                    <div className="w-1/3 aspect-[4/3] bg-muted/20 border border-border/50 rounded-3xl relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
                        <div className="absolute inset-0 flex items-center justify-center p-8 opacity-20">
                            <TrendingUp size={200} strokeWidth={1} className="text-primary" />
                        </div>
                        <div className="absolute top-8 left-8 bg-background/80 backdrop-blur-md p-4 rounded-2xl border border-border shadow-xl space-y-2 animate-in slide-in-from-left-4 duration-1000">
                            <div className="flex items-center gap-2 text-primary font-black text-xs">
                                <Zap size={14} fill="currentColor" />
                                8.2% Savings Predicted
                            </div>
                            <div className="flex gap-1 h-3 items-end">
                                {[4, 7, 5, 9, 6, 8, 10].map((h, i) => (
                                    <div key={i} className="w-1.5 bg-primary/60 rounded-full" style={{ height: `${h * 10}%` }} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters bar */}
                <div className="flex items-center justify-between border-b border-border/40 pb-6">
                    <div className="flex items-center gap-6">
                        <button className="flex items-center gap-2 text-sm font-bold text-foreground">
                            <Filter size={18} />
                            All Categories
                            <ChevronDown size={16} className="text-muted-foreground" />
                        </button>
                        <div className="w-px h-4 bg-border/40" />
                        <p className="text-sm text-muted-foreground font-medium">84 Specialized Assets Found</p>
                    </div>
                    <div className="flex items-center gap-2 bg-muted/40 p-1 rounded-xl border border-border/40">
                        <button className="p-2 bg-background rounded-lg shadow-sm">
                            <LayoutGrid size={18} className="text-primary" />
                        </button>
                        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                            <List size={18} className="text-muted-foreground" />
                        </button>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {PRODUCTS.map(product => (
                        <div key={product.id} id="catalog-item-card" className="group flex flex-col bg-muted/10 border border-border/40 rounded-[32px] overflow-hidden hover:border-primary/50 transition-all cursor-pointer shadow-lg hover:shadow-primary/5">
                            <div className="aspect-[5/4] bg-muted/30 relative flex items-center justify-center p-12 overflow-hidden">
                                <div className="w-full h-full opacity-10 group-hover:scale-110 transition-transform duration-700 flex items-center justify-center">
                                    <LayoutGrid size={120} strokeWidth={0.5} />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-muted/40 to-transparent" />

                                <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/80 backdrop-blur-md border border-border/50 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-opacity-transform">
                                    <Heart size={20} />
                                </button>

                                <div className="absolute top-4 left-4 flex flex-col gap-2">
                                    <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20">
                                        <Sparkles size={12} fill="currentColor" />
                                        {product.aiBadge}
                                    </div>
                                </div>

                                <div className="absolute bottom-4 left-4 right-4 bg-background/60 backdrop-blur-sm border border-white/5 p-3 rounded-2xl opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                    <p className="text-[10px] font-bold text-primary flex items-center gap-2">
                                        <Info size={12} />
                                        AI Insight
                                    </p>
                                    <p className="text-[11px] font-medium leading-tight mt-1 text-foreground/80 italic">
                                        "{product.aiReason}"
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 space-y-4 flex-1 flex flex-col">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{product.category}</p>
                                    <h4 className="text-lg font-bold group-hover:text-primary transition-colors leading-tight">{product.name}</h4>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                        <Star size={14} className="text-yellow-500 fill-current" />
                                        <span className="text-xs font-bold">{product.rating}</span>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-tighter ${product.availability === 'In Stock' ? 'text-green-500' : 'text-orange-500'}`}>
                                        • {product.availability}
                                    </span>
                                </div>

                                <div className="pt-4 flex items-center justify-between mt-auto">
                                    <span className="text-2xl font-black">${product.price.toLocaleString()}</span>
                                    <button className="w-12 h-12 rounded-2xl bg-muted border border-border/50 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:scale-110 active:scale-95 transition-all group-hover:border-primary/50">
                                        <ShoppingCart size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

        </div>
    );
}
