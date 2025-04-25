import { Link } from "wouter";
import UserMenu from "./UserMenu";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  onOpenSettings: () => void;
}

export default function Header({ onOpenSettings }: HeaderProps) {
  const { user } = useAuth();
  
  return (
    <header className="text-center mb-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">BrainSpark</h1>
        <div className="flex items-center space-x-3">
          <Link href="/history">
            <div
              className="bg-gradient-to-r from-indigo-100 to-blue-100 rounded-full p-3 shadow-md hover:from-indigo-200 hover:to-blue-200 transition-colors button-press cursor-pointer border border-indigo-200"
              aria-label="View History"
              title="View History"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 text-indigo-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
          </Link>
          
          <button 
            onClick={onOpenSettings}
            className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-full p-3 shadow-md hover:from-purple-200 hover:to-pink-200 transition-colors button-press border border-purple-200" 
            aria-label="Settings"
            title="Parent Settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-purple-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
          
          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
      
      <div className="flex items-center justify-center mt-1">
        <p className="text-xl text-gray-700 font-nunito">Ask me anything and I'll help you learn!</p>
        
        {/* Show guest badge if applicable */}
        {user?.isGuest && (
          <div className="ml-3 bg-gradient-to-r from-yellow-300 to-orange-300 text-xs font-bold text-gray-800 px-2 py-1 rounded-full flex items-center">
            <span>Guest Mode</span>
            <Link href="/login">
              <button className="ml-1 text-xs text-blue-800 underline">Upgrade</button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}