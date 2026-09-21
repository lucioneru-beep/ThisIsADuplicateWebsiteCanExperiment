import { useState } from 'react';
import { Trash2, Send } from 'lucide-react';
import { RequestItem } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface AdminRequestCartProps {
  items: RequestItem[];
  onRemoveItem: (index: number) => void;
  onSubmit: (submittedBy: string, drNumber: string, clientName: string, deliveryAddress: string, deliveryDate: string, notes?: string) => void;
}

export function AdminRequestCart({
  items,
  onRemoveItem,
  onSubmit,
}: AdminRequestCartProps) {
  const [submittedBy, setSubmittedBy] = useState('');
  const [drNumber, setDrNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');

  const totalValue = items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = () => {
    if (items.length === 0) {
      alert('Please add items to the request');
      return;
    }

    if (!submittedBy.trim()) {
      alert('Please enter submitted by name');
      return;
    }

    if (!drNumber.trim()) {
      alert('Please enter DR number');
      return;
    }

    if (!clientName.trim()) {
      alert('Please enter client name');
      return;
    }

    if (!deliveryAddress.trim()) {
      alert('Please enter delivery address');
      return;
    }

    if (!deliveryDate.trim()) {
      alert('Please enter delivery date');
      return;
    }

    onSubmit(submittedBy, drNumber, clientName, deliveryAddress, deliveryDate, notes);
    setSubmittedBy('');
    setDrNumber('');
    setClientName('');
    setDeliveryAddress('');
    setDeliveryDate('');
    setNotes('');
  };

  return (
    <div className="bg-[#141824] rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
      {items.length === 0 ? (
        /* Empty State */
        <div className="text-center py-8">
          <div className="bg-[#08090e] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📦</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Current Request Cart</h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Add products using the search form above. Items will appear here for submission.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h2 className="text-xl font-bold text-white">Current Request ({items.length} item{items.length !== 1 ? 's' : ''})</h2>
          </div>

          {/* Request Items Table */}
          <div className="overflow-x-auto border border-[#1e2433] rounded-lg">
            <table className="w-full">
              <thead className="bg-[#08090e]">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider border-b border-[#1e2433]">
                    #
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider border-b border-[#1e2433]">
                    Product
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider border-b border-[#1e2433]">
                    Size
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider border-b border-[#1e2433]">
                    Qty
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider border-b border-[#1e2433]">
                    Price
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider border-b border-[#1e2433]">
                    Total
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider border-b border-[#1e2433]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#141824]">
                {items.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-[#1e2433] hover:bg-[#08090e] transition-colors"
                  >
                    <td className="px-3 py-2 text-sm text-gray-300">{index + 1}</td>
                    <td className="px-3 py-2 text-sm text-white font-medium">
                      {item.productName}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-300">{item.size}</td>
                    <td className="px-3 py-2 text-sm text-white text-right font-semibold">
                      {item.quantity}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-300 text-right">
                      ₱{item.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-sm text-white text-right font-semibold">
                      ₱{item.total.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => onRemoveItem(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#08090e] border-t-2 border-[#f97316]">
                <tr>
                  <td colSpan={5} className="px-3 py-2 text-right text-sm font-bold text-white">
                    Total Estimated Value:
                  </td>
                  <td className="px-3 py-2 text-right text-lg font-bold text-[#f97316]">
                    ₱{totalValue.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Submission Form */}
          <div className="bg-[#08090e] rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white mb-3">Request Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="submittedBy" className="text-gray-300 mb-2 block">
                  Submitted By
                </Label>
                <Input
                  id="submittedBy"
                  placeholder="Your name"
                  value={submittedBy}
                  onChange={(e) => setSubmittedBy(e.target.value)}
                  className="bg-[#141824] border-gray-600 text-white placeholder:text-gray-500"
                />
              </div>
              <div>
                <Label htmlFor="drNumber" className="text-gray-300 mb-2 block">
                  DR Number
                </Label>
                <Input
                  id="drNumber"
                  placeholder="DR-12345"
                  value={drNumber}
                  onChange={(e) => setDrNumber(e.target.value)}
                  className="bg-[#141824] border-gray-600 text-white placeholder:text-gray-500"
                />
              </div>
              <div>
                <Label htmlFor="clientName" className="text-gray-300 mb-2 block">
                  Client Name
                </Label>
                <Input
                  id="clientName"
                  placeholder="Client name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="bg-[#141824] border-gray-600 text-white placeholder:text-gray-500"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="deliveryAddress" className="text-gray-300 mb-2 block">
                  Delivery Address
                </Label>
                <Input
                  id="deliveryAddress"
                  placeholder="Complete delivery address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="bg-[#141824] border-gray-600 text-white placeholder:text-gray-500"
                />
              </div>
              <div>
                <Label htmlFor="deliveryDate" className="text-gray-300 mb-2 block">
                  Delivery Date
                </Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="bg-[#141824] border-gray-600 text-white placeholder:text-gray-500"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes" className="text-gray-300 mb-2 block">
                Additional Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Add special instructions, preferences, or comments..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-[#141824] border-gray-600 text-white placeholder:text-gray-500 min-h-[100px] resize-y"
              />
            </div>
            <Button
              onClick={handleSubmit}
              className="w-full bg-[#f97316] hover:bg-[#ea6a09] text-white font-semibold py-3"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Request
            </Button>
          </div>
        </>
      )}
    </div>
  );
}