import React from 'react';
import { Search, ShoppingCart, Menu, Star, Truck, ShieldCheck } from 'lucide-react';

// --- PHẦN KHẮC PHỤC LỖI IMPORT ẢNH ---
// Do môi trường chạy thử không có file ảnh của bạn, tôi dùng link ảnh mẫu online.
// KHI CHẠY Ở MÁY BẠN: Hãy bỏ comment (//) 3 dòng import dưới và xóa 3 dòng const url mẫu đi nhé.

 import ShopLogo from '../assets/shop-logo-konen.png'; 
 import GatewayHero from '../assets/gateway-hero.jpg'; 
 import WingedLogo from '../assets/shop-logo-konen-bochu.png'; 


export const GatewayScreen = ({ setPath }) => {
    return (
        <div className="relative w-full h-screen bg-black text-white font-sans overflow-hidden selection:bg-[#E2B657] selection:text-black">
            
            {/* =========================================
               1. BACKGROUND IMAGE
               ========================================= */}
            <div className="absolute inset-0 z-0">
                <img 
                    src={GatewayHero} 
                    alt="Background" 
                    className="w-full h-full object-cover"
                />
                {/* Lớp phủ làm tối để chữ nổi bật */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/10 to-black/65"></div>
                {/* Hiệu ứng hạt noise nhẹ */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            </div>

            {/* =========================================
               2. HEADER / NAVBAR
               ========================================= */}
            <header className="absolute top-0 left-0 w-full z-50 flex items-center justify-between px-4 py-4 md:px-12">
                <div className="flex items-center gap-3">
                    <img src={ShopLogo} alt="Logo" className="w-10 h-10 md:w-10 md:h-10 object-contain brightness-0 invert drop-shadow-md" />
                    <span className="text-xl md:text-2xl font-bold tracking-wide text-gray-100 uppercase">Aura Store</span>
                    
                </div>
                
                

                <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide text-gray-300">
                    <span 
                        onClick={() => setPath('/')}
                        className="text-[#E2B657] cursor-pointer border-b border-[#E2B657] pb-1 hover:text-white transition-colors duration-300"
                    >
                        Trang chủ
                    </span>
                    <span 
                        onClick={() => setPath('/shop')}
                        className="hover:text-white cursor-pointer transition-colors duration-300"
                    >
                        Sản phẩm
                    </span>
                    <span 
                        onClick={() => setPath('/about')}
                        className="hover:text-white cursor-pointer transition-colors duration-300"
                    >
                        Về chúng tôi
                    </span>
                    <span 
                        onClick={() => setPath('/contact')}
                        className="hover:text-white cursor-pointer transition-colors duration-300"
                    >
                        Liên hệ
                    </span>
                </nav>

           
            </header>

            {/* =========================================
               3. HERO CONTENT (CENTER)
               ========================================= */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-2 text-center">
                
                {/* --- LOGO CÁNH KIM CƯƠNG (Dùng ảnh thật) --- */}
               <div className="relative mb-6 -mt-16 md:-mt-20 group">
                        
                        {/* Lớp 1: Hào quang lớn mờ ảo (Ambient Glow) */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[#E2B657]/20 rounded-full blur-[60px] animate-pulse pointer-events-none"></div>
                        
                        {/* Lớp 2: Vòng sáng trung tâm (Core Glow) */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#FDB931]/30 rounded-full blur-[40px] mix-blend-screen pointer-events-none"></div>

                        {/* Lớp 3: Điểm sáng chói lọi ngay sau logo (Highlight) */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-400/20 rounded-full blur-[20px] mix-blend-color-dodge pointer-events-none"></div>

                        {/* ẢNH LOGO CHÍNH (Đã chỉnh nhỏ gọn hơn) */}
                        {/* w-16 md:w-32 lg:w-48: Kích thước ~3/4 so với bản gốc */}
                        <img 
                            src={WingedLogo} 
                            alt="Aura Winged Logo" 
                            className="relative z-10 w-16 md:w-32 lg:w-48 h-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] animate-float"
                        />
                        
                        {/* Hiệu ứng các hạt sao lấp lánh (Sparkles) */}
                        <div className="absolute -top-4 -right-2 w-1 h-1 bg-white blur-[0.5px] rounded-full animate-ping shadow-[0_0_10px_white]"></div>
                        <div className="absolute bottom-4 -left-2 w-1 h-1 bg-[#FDB931] blur-[0.5px] rounded-full animate-pulse shadow-[0_0_10px_#FDB931]"></div>
                        <div className="absolute top-0 -left-4 w-1 h-1 bg-white blur-[0.5px] rounded-full animate-bounce delay-700"></div>
                    </div>
                {/* --- TEXT CONTENT --- */}
                <h3 className="text-sm md:text-lg font-light tracking-[0.3em] text-white/80 uppercase mb-3 animate-fade-in-up">
                    Chào mừng đến với
                </h3>

                <h1 className="text-5xl md:text-7xl lg:text-7xl font-black uppercase tracking-widest mb-6 scale-y-110">
    {/* Container: relative để định vị lớp phủ, group để bắt sự kiện hover */}
    <span className="relative group block w-fit mx-auto cursor-pointer select-none">
        
        {/* --- LỚP 1: CHỮ GỐC (MÀU VÀNG GOLD) --- */}
        <span className="
            relative z-10
            bg-clip-text text-transparent 
            bg-gradient-to-b from-[#e4d9b4] via-[#e5c24f] to-[#886600] 
            drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]
        ">
            Aura Store
        </span>

        {/* --- LỚP 2: DẢI SÁNG (SHINE OVERLAY) --- */}
        {/* Lớp này nằm đè lên lớp 1 (absolute inset-0), cũng cắt theo hình chữ (bg-clip-text) */}
        <span className="
            absolute inset-0 z-20
            bg-clip-text text-transparent
            
            /* Tạo dải sáng trắng mờ ở giữa, 2 bên trong suốt */
            bg-gradient-to-r from-transparent via-white/90 to-transparent
            bg-no-repeat
            
            /* Kích thước background rộng gấp đôi chữ để có chỗ chạy */
            bg-[length:200%_100%]
            
            /* Vị trí ban đầu: Nằm ẩn bên trái (-100%) */
            bg-[position:-100%_0]
            
            /* Khi Hover: Chạy sang bên phải (200%) */
            group-hover:bg-[position:200%_0]
            
            /* Thời gian chạy: 0.7s */
            transition-[background-position] duration-700 ease-in-out
        "
        aria-hidden="true">
            Aura Store
        </span>
        
    </span>
</h1>
                <p className="max-w-2xl text-gray-300 text-lg md:text-xl font-light mb-10 leading-relaxed tracking-wide">
                    Điểm đến mua sắm <span className="text-[#E2B657] font-medium">tin cậy</span> & <br className="md:hidden" /> Hệ thống quản lý <span className="text-[#E2B657] font-medium">chuyên nghiệp</span>
                </p>

                {/* --- BUTTONS --- */}
                <div className="flex flex-col sm:flex-row gap-5 w-full justify-center items-center">
                    <button
                        onClick={() => setPath('/shop')}
                        className="group relative overflow-hidden px-10 py-4 bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-black font-bold text-sm uppercase tracking-[0.15em] rounded-full shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_35px_rgba(212,175,55,0.6)] hover:scale-105 transition-all duration-300 min-w-[240px]"
                    >
                        <span className="relative z-10">Khám phá ngay</span>
                        <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                    </button>

                    <button
                        onClick={() => setPath('/login')}
                        className="px-10 py-4 bg-transparent border border-white/30 text-white font-bold text-sm uppercase tracking-[0.15em] rounded-full hover:bg-white/10 hover:border-white hover:scale-105 backdrop-blur-sm transition-all duration-300 min-w-[240px]"
                    >
                        Đăng nhập
                    </button>
                </div>
            </div>

            {/* =========================================
               4. FOOTER BADGES
               ========================================= */}
            <div className="absolute bottom-6 md:bottom-10 left-0 w-full z-20">
                <div className="flex flex-wrap justify-center items-center gap-3 md:gap-8 px-4 opacity-90">
                    <FooterBadge icon={ShieldCheck} text="Uy tín 100%" />
                    <div className="hidden md:block w-px h-6 bg-white/20"></div>
                    <FooterBadge icon={Star} text="Chất lượng cao" />
                    <div className="hidden md:block w-px h-6 bg-white/20"></div>
                    <FooterBadge icon={Truck} text="Giao siêu tốc" />
                </div>
            </div>

        </div>
    );
};

const FooterBadge = ({ icon: Icon, text }) => (
    <div className="flex items-center gap-3 px-6 py-2 rounded-full border border-white/10 bg-black/40 backdrop-blur-md hover:bg-black/60 transition-colors cursor-default hover:border-yellow-500 hover:shadow-lg">
        <Icon className="w-5 h-5 text-[#E2B657]" />
        <span className="text-gray-300 text-xs md:text-sm font-medium uppercase tracking-wider">{text}</span>
    </div>
);