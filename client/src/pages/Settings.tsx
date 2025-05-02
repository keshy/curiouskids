import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Settings } from "@/components/AskMeBuddy";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  // Default settings values
  const [settings, setSettings] = useState<Settings>({
    textToSpeech: true,
    showImages: true,
    contentFilter: "standard",
    highContrastMode: false
  });

  // Redirect to login if user is not authenticated or is a guest
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (user.isGuest) {
      navigate("/");
      return;
    }
    
    // Load settings from localStorage if available
    const savedSettings = localStorage.getItem('brainspark-settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      } catch (err) {
        console.error("Error parsing saved settings:", err);
      }
    }
  }, [user, navigate]);

  // Handle saving the settings
  const handleSaveSettings = () => {
    // Save to localStorage
    localStorage.setItem('brainspark-settings', JSON.stringify(settings));
    
    // Show success toast
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
      duration: 3000,
    });
  };

  // Create decorative elements for a kid-friendly UI
  const renderStars = () => {
    return Array.from({ length: 8 }, (_, i) => (
      <div 
        key={i}
        className="absolute w-6 h-6 text-yellow-400"
        style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animation: `twinkle ${Math.random() * 3 + 2}s infinite`,
          transform: `rotate(${Math.random() * 45}deg)`,
        }}
      >
        ★
      </div>
    ));
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50 to-white overflow-hidden">
      {/* Decorative stars */}
      {renderStars()}
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 flex justify-between items-center bg-white p-5 rounded-xl shadow-md">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">User Preferences</h1>
          <Link href="/">
            <div className="bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full flex items-center cursor-pointer transition-all hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to BrainSpark
            </div>
          </Link>
        </div>

        {/* Settings Form */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="space-y-8">
            {/* Speech Settings Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Speech Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="text-to-speech" className="text-base font-medium">Enable Text-to-Speech</Label>
                    <p className="text-sm text-gray-500">BrainSpark will read answers out loud</p>
                  </div>
                  <Switch 
                    id="text-to-speech" 
                    checked={settings.textToSpeech}
                    onCheckedChange={(checked) => setSettings({...settings, textToSpeech: checked})}
                  />
                </div>
              </div>
            </div>

            {/* Visual Settings Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Visual Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-images" className="text-base font-medium">Show Images</Label>
                    <p className="text-sm text-gray-500">BrainSpark will include images with answers</p>
                  </div>
                  <Switch 
                    id="show-images" 
                    checked={settings.showImages}
                    onCheckedChange={(checked) => setSettings({...settings, showImages: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="high-contrast" className="text-base font-medium">High Contrast Mode</Label>
                    <p className="text-sm text-gray-500">Makes text easier to read</p>
                  </div>
                  <Switch 
                    id="high-contrast" 
                    checked={settings.highContrastMode}
                    onCheckedChange={(checked) => setSettings({...settings, highContrastMode: checked})}
                  />
                </div>
              </div>
            </div>

            {/* Content Filter Settings Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Content Filter</h2>
              
              <RadioGroup
                value={settings.contentFilter}
                onValueChange={(value) => setSettings({...settings, contentFilter: value as "strict" | "moderate" | "standard"})}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="strict" id="strict" />
                  <Label htmlFor="strict" className="text-base font-medium">Strict</Label>
                  <p className="text-sm text-gray-500 ml-2">Only child-friendly content with extra safety measures</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="moderate" />
                  <Label htmlFor="moderate" className="text-base font-medium">Moderate</Label>
                  <p className="text-sm text-gray-500 ml-2">Balanced content filtering for everyday use</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="standard" id="standard" />
                  <Label htmlFor="standard" className="text-base font-medium">Standard</Label>
                  <p className="text-sm text-gray-500 ml-2">Basic content filtering</p>
                </div>
              </RadioGroup>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <Button
                onClick={handleSaveSettings}
                className="w-full bg-primary hover:bg-blue-600 text-white py-3 rounded-lg font-bold text-lg transition-all hover:shadow-lg"
              >
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}