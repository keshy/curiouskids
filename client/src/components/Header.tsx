interface HeaderProps {
  onOpenSettings: () => void;
}

export default function Header({ onOpenSettings }: HeaderProps) {
  return (
    <header className="text-center mb-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">OptiBrain Prime</h1>
        <button 
          onClick={onOpenSettings}
          className="bg-white rounded-full p-3 shadow-md hover:bg-lightGray transition-colors button-press" 
          aria-label="Settings"
        >
          <i className="ri-settings-3-line text-gray-600 text-2xl"></i>
        </button>
      </div>
      <p className="text-xl text-gray-600 font-nunito">Ask me anything and I'll help you learn!</p>
    </header>
  );
}