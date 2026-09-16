import { useState } from 'react';
import { Trash2, Send } from 'lucide-react';
import { RequestItem } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface ClientRequestTableProps {
  items: RequestItem[];
  onRemoveItem: (index: number) => void;
  onSubmit: (submittedBy: string, clientName: string, deliveryAddress: string, deliveryDate: string, notes?: string) => void;
}

export function ClientRequestTable({
  items,
  onRemoveItem,
  onSubmit,
}: ClientRequestTableProps) {
  const [submittedBy, setSubmittedBy] = useState('');
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
      alert('Please enter your name');
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

    onSubmit(submittedBy, clientName, deliveryAddress, deliveryDate, notes);
    setSubmittedBy('');
    setClientName('');
    setDeliveryAddress('');
    setDeliveryDate('');
    setNotes('');
  };

  return (
    <div className="bg-[#2d2d2d] rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
      {items.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12">
          <div className="bg-[#1a1a1a] rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <span className="text-5xl">📦</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Items Yet</h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Start by searching for products in the section above. Once you add items, they'll appear here for review.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Request Summary</h2>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto border border-gray-700 rounded-lg">
            <table className="w-full">
              <thead className="bg-[#1a1a1a]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider border-b border-gray-700">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider border-b border-gray-700">
                    Product Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider border-b border-gray-700">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider border-b border-gray-700">
                    Size
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider border-b border-gray-700">
                    Qty Requested
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider border-b border-gray-700">
                    Unit Price
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider border-b border-gray-700">
                    Total Value
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider border-b border-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#2d2d2d]">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      No items added yet. Use the search form to add products.
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-700 hover:bg-[#1a1a1a] transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-300">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-white font-medium">
                        {item.productName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">{item.category}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{item.size}</td>
                      <td className="px-4 py-3 text-sm text-white text-right font-semibold">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300 text-right">
                        ₱{item.unitPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-white text-right font-semibold">
                        ₱{item.total.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => onRemoveItem(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {items.length > 0 && (
                <tfoot className="bg-[#1a1a1a] border-t-2 border-[#2d8659]">
                  <tr>
                    <td colSpan={6} className="px-4 py-3 text-right text-sm font-bold text-white">
                      Total Estimated Value:
                    </td>
                    <td className="px-4 py-3 text-right text-lg font-bold text-[#2d8659]">
                      ₱{totalValue.toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {items.length === 0 ? (
              <div className="bg-[#1a1a1a] rounded-lg p-6 text-center text-gray-500 text-sm">
                No items added yet. Use the search form to add products.
              </div>
            ) : (
              <>
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-white font-semibold text-sm mb-1">
                          {item.productName}
                        </div>
                        <div className="text-xs text-gray-400">
                          {item.category} • {item.size}
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveItem(index)}
                        className="text-red-400 hover:text-red-300 transition-colors ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <div className="text-gray-400 text-xs mb-1">Quantity</div>
                        <div className="text-white font-semibold">{item.quantity}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs mb-1">Unit Price</div>
                        <div className="text-gray-300">₱{item.unitPrice.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs mb-1">Total</div>
                        <div className="text-[#2d8659] font-semibold">₱{item.total.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="bg-[#1a1a1a] rounded-lg p-4 border-2 border-[#2d8659]">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold">Total Estimated Value:</span>
                    <span className="text-[#2d8659] font-bold text-lg">₱{totalValue.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Submit Section */}
          {items.length > 0 && (
            <div className="space-y-4 pt-6 mt-6 border-t-2 border-[#2d8659]">
              <div className="bg-[#2d8659]/10 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <Send className="w-5 h-5 text-[#2d8659]" />
                  Complete Your Request
                </h3>
                <p className="text-gray-400 text-sm">
                  Please fill in the details below to submit your sample request
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="submittedBy" className="text-gray-300 text-sm mb-2 block font-semibold">
                    👤 Your Name *
                  </Label>
                  <Input
                    id="submittedBy"
                    type="text"
                    placeholder="e.g., John Doe"
                    value={submittedBy}
                    onChange={(e) => setSubmittedBy(e.target.value)}
                    className="bg-[#1a1a1a] border-gray-600 text-white placeholder:text-gray-500 focus:border-[#2d8659] h-12 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="clientName" className="text-gray-300 text-sm mb-2 block font-semibold">
                    🏢 Client Name *
                  </Label>
                  <Input
                    id="clientName"
                    type="text"
                    placeholder="e.g., ABC Company"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="bg-[#1a1a1a] border-gray-600 text-white placeholder:text-gray-500 focus:border-[#2d8659] h-12 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="deliveryAddress" className="text-gray-300 text-sm mb-2 block font-semibold">
                    📍 Delivery Address *
                  </Label>
                  <Input
                    id="deliveryAddress"
                    type="text"
                    placeholder="e.g., 123 Main St, City, Country"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="bg-[#1a1a1a] border-gray-600 text-white placeholder:text-gray-500 focus:border-[#2d8659] h-12 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="deliveryDate" className="text-gray-300 text-sm mb-2 block font-semibold">
                    📅 Delivery Date *
                  </Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="bg-[#1a1a1a] border-gray-600 text-white placeholder:text-gray-500 focus:border-[#2d8659] h-12 text-base"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes" className="text-gray-300 text-sm mb-2 block font-semibold">
                  📝 Additional Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Add any special instructions, preferences, or comments about this request..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-[#1a1a1a] border-gray-600 text-white placeholder:text-gray-500 focus:border-[#2d8659] min-h-[100px] text-base resize-y"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Examples: Delivery time preferences, special handling instructions, etc.
                </p>
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-[#2d8659] to-[#238b4d] hover:from-[#238b4d] hover:to-[#2d8659] text-white font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Send className="w-5 h-5 mr-2" />
                Submit Request & Get PDF Receipt
              </Button>
              
              <p className="text-gray-500 text-xs text-center">
                * All fields are required
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}