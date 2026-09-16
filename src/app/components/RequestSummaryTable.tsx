import { useState } from 'react';
import { Trash2, Send, Download, Calendar } from 'lucide-react';
import { RequestItem } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import * as XLSX from 'xlsx';

interface RequestSummaryTableProps {
  items: RequestItem[];
  onRemoveItem: (index: number) => void;
  onSubmit: (submittedBy: string, drNumber: string, clientName: string) => void;
  onExport: (date: string) => void;
}

export function RequestSummaryTable({
  items,
  onRemoveItem,
  onSubmit,
  onExport,
}: RequestSummaryTableProps) {
  const [submittedBy, setSubmittedBy] = useState('');
  const [drNumber, setDrNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [orderDate, setOrderDate] = useState(() => {
    // Load saved order date from localStorage or default to today
    const saved = localStorage.getItem('wonderzyme_order_date');
    return saved || new Date().toISOString().split('T')[0];
  });

  const totalValue = items.reduce((sum, item) => sum + item.total, 0);

  // Save order date to localStorage whenever it changes
  const handleOrderDateChange = (newDate: string) => {
    setOrderDate(newDate);
    localStorage.setItem('wonderzyme_order_date', newDate);
  };

  const handleSubmit = () => {
    if (items.length === 0) {
      alert('Please add items to the request');
      return;
    }

    if (!submittedBy.trim()) {
      alert('Please enter your name');
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

    onSubmit(submittedBy, drNumber, clientName);
    setSubmittedBy('');
    setDrNumber('');
    setClientName('');
  };

  const handleExportCurrent = () => {
    if (items.length === 0) {
      alert('No items to export');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      items.map((item, index) => ({
        '#': index + 1,
        'Product Name': item.productName,
        Category: item.category,
        Size: item.size,
        'Qty Requested': item.quantity,
        'Unit Price': `₱${item.unitPrice.toFixed(2)}`,
        'Total Estimated Value': `₱${item.total.toFixed(2)}`,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Current Request');

    XLSX.writeFile(workbook, `Sample_Request_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportHistorical = () => {
    if (!orderDate) {
      alert('Please select a date');
      return;
    }

    onExport(orderDate);
  };

  return (
    <div className="bg-[#2d2d2d] rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Request Summary</h2>
        <Button
          onClick={handleExportCurrent}
          variant="outline"
          size="sm"
          className="border-gray-600 text-gray-300 hover:bg-[#1a1a1a] hover:text-white w-full sm:w-auto"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Current
        </Button>
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
        <div className="space-y-4 pt-4 border-t border-gray-700">
          <div>
            <Label htmlFor="submittedBy" className="text-gray-300 text-sm mb-2 block">
              Submitted By (Your Name)
            </Label>
            <Input
              id="submittedBy"
              type="text"
              placeholder="Enter your name..."
              value={submittedBy}
              onChange={(e) => setSubmittedBy(e.target.value)}
              className="bg-[#1a1a1a] border-gray-600 text-white placeholder:text-gray-500 focus:border-[#2d8659]"
            />
          </div>
          <div>
            <Label htmlFor="drNumber" className="text-gray-300 text-sm mb-2 block">
              DR Number
            </Label>
            <Input
              id="drNumber"
              type="text"
              placeholder="Enter DR number..."
              value={drNumber}
              onChange={(e) => setDrNumber(e.target.value)}
              className="bg-[#1a1a1a] border-gray-600 text-white placeholder:text-gray-500 focus:border-[#2d8659]"
            />
          </div>
          <div>
            <Label htmlFor="clientName" className="text-gray-300 text-sm mb-2 block">
              Client Name
            </Label>
            <Input
              id="clientName"
              type="text"
              placeholder="Enter client name..."
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="bg-[#1a1a1a] border-gray-600 text-white placeholder:text-gray-500 focus:border-[#2d8659]"
            />
          </div>
          <Button
            onClick={handleSubmit}
            className="w-full bg-[#2d8659] hover:bg-[#238b4d] text-white font-semibold py-3 text-lg"
          >
            <Send className="w-5 h-5 mr-2" />
            Submit Request
          </Button>
        </div>
      )}

      {/* Historical Export Section */}
      <div className="space-y-4 pt-6 border-t border-gray-700">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-[#2d8659]" />
          Export Historical Data
        </h3>
        <div>
          <Label htmlFor="orderDate" className="text-gray-300 text-sm mb-2 block">
            Select Date (exports only data from this specific date)
          </Label>
          <Input
            id="orderDate"
            type="date"
            value={orderDate}
            onChange={(e) => handleOrderDateChange(e.target.value)}
            className="bg-[#1a1a1a] border-gray-600 text-white focus:border-[#2d8659]"
          />
        </div>
        <Button
          onClick={handleExportHistorical}
          variant="outline"
          className="w-full border-[#2d8659] text-[#2d8659] hover:bg-[#2d8659] hover:text-white"
        >
          <Download className="w-5 h-5 mr-2" />
          Export for {orderDate || 'Selected Date'}
        </Button>
      </div>
    </div>
  );
}