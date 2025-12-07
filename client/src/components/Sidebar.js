import React from 'react';
import { PackageOpen } from 'lucide-react';
import { roleToRoutes } from '../utils/constants'; 
import ShopLogo from '../assets/shop-logo.png';

export const Sidebar = ({ currentPath, setPath, userRoleName }) => {
    const navItems = roleToRoutes[userRoleName] || [];

    return (
        <div className="w-64 bg-gray-800 text-white flex flex-col fixed inset-y-0 z-40 transition-transform duration-300 transform -translate-x-full md:translate-x-0">
            
            <div className="p-6 text-2xl font-bold border-b border-gray-700 flex items-center">
                <img 
                    src={ShopLogo}
                    alt="Store Management Logo" 
                    className="w-8 h-8 mr-3" 
                />

                <span className='text-yellow-400'>AuraStore</span>
            </div>
            
            <div className="p-4 text-sm bg-gray-700/50 text-gray-300 border-b border-gray-700">
                Vai trò: <span className="font-semibold text-white">{userRoleName || 'Guest'}</span>
            </div>
            
            <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <a
                        key={item.path}
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            setPath(item.path);
                        }} 
                        className={`flex items-center p-3 rounded-lg transition duration-200 ${
                            currentPath === item.path ? 'bg-yellow-600 shadow-md text-white font-semibold' : 'hover:bg-gray-700 text-gray-300'
                        }`}
                    >
                        <item.icon className="w-5 h-5 mr-3" /> 
                        {item.name}
                    </a>
                ))}
            </nav>
        </div>
    );
};