import { RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

interface InventoryResetButtonProps {
  onReset: () => void;
  apiBase: string;
  authToken: string;
}

export function InventoryResetButton({ onReset, apiBase, authToken }: InventoryResetButtonProps) {
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset the inventory to initial values? This will restore all stock levels but will NOT delete any submitted requests.')) {
      return;
    }

    try {
      setResetting(true);
      const response = await fetch(`${apiBase}/admin/reset-inventory`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to reset inventory');
      }

      toast.success('Inventory reset successfully!');
      onReset(); // Refresh the inventory data
    } catch (error) {
      console.error('Error resetting inventory:', error);
      toast.error('Failed to reset inventory. Please try again.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <Button
      onClick={handleReset}
      disabled={resetting}
      variant="outline"
      size="sm"
      className="border-gray-600 text-gray-400 hover:bg-[#1a1a1a] hover:text-white hover:border-[#2d8659] flex-1 sm:flex-initial"
    >
      <RefreshCw className={`w-4 h-4 sm:mr-2 ${resetting ? 'animate-spin' : ''}`} />
      <span className="hidden sm:inline">{resetting ? 'Resetting...' : 'Reset Inventory'}</span>
      <span className="sm:hidden">{resetting ? '...' : 'Reset'}</span>
    </Button>
  );
}