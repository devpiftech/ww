
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

interface NoticeBarProps {
  showNotice: boolean;
  onDismiss: () => void;
}

const NoticeBar: React.FC<NoticeBarProps> = ({ showNotice, onDismiss }) => {
  if (!showNotice) return null;
  
  return (
    <div className="bg-muted/20 border border-casino-gold/30 rounded-lg p-4 mb-12 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Bell className="h-5 w-5 text-casino-gold" />
        <p className="text-sm text-muted-foreground">
          <span className="text-white font-semibold">WayneWagers</span> is a social casino - play for fun with virtual coins only. No real money gambling.
        </p>
      </div>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={onDismiss}
      >
        Dismiss
      </Button>
    </div>
  );
};

export default NoticeBar;
