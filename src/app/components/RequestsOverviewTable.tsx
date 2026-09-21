import { useState, useEffect } from 'react';
import { Calendar, User, FileText, Package, Database, RefreshCw, Download } from 'lucide-react';
import { Button } from './ui/button';
import { DownloadManagerModal } from './DownloadManagerModal';

interface RequestItem {
  productName: string;
  category: string;
  size: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface RequestRecord {
  id: string;
  timestamp: string;
  submittedBy: string;
  drNumber: string;
  clientName: string;
  items: RequestItem[];
  totalValue: number;
}

interface RequestsOverviewTableProps {
  apiBase: string;
  authToken: string;
  refreshTrigger: number;
  onManageDatabase?: () => void;
}

export function RequestsOverviewTable({ apiBase, authToken, refreshTrigger, onManageDatabase }: RequestsOverviewTableProps) {
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [refreshTrigger]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/requests/all`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-[#141824] rounded-lg border border-[#1e2433]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#f97316]/20 to-[#ea6a09]/20 border-b border-[#1e2433] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-7 h-7 text-[#f97316]" />
            <div>
              <h2 className="text-2xl font-bold text-white">All Submitted Requests</h2>
              <p className="text-sm text-gray-400">
                {requests.length} total request{requests.length !== 1 ? 's' : ''} • Auto-refreshes every 10 seconds
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onManageDatabase && (
              <Button
                onClick={onManageDatabase}
                variant="outline"
                size="sm"
                className="border-[#f97316] text-[#f97316] hover:bg-[#f97316]/20"
              >
                <Database className="w-4 h-4 mr-2" />
                Manage Database
              </Button>
            )}
            <Button
              onClick={fetchRequests}
              variant="outline"
              size="sm"
              className="border-[#f97316] text-[#f97316] hover:bg-[#f97316]/20 font-semibold"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => setShowDownloadModal(true)}
              variant="outline"
              size="sm"
              className="border-[#f97316] text-[#f97316] hover:bg-[#f97316]/20 font-semibold"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading && requests.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#f97316] mx-auto"></div>
              <p className="text-gray-400">Loading requests...</p>
            </div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <Database className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No requests submitted yet</p>
            <p className="text-gray-500 text-sm mt-2">Requests will appear here when clients submit them</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1e2433]">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Date & Time</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">DR Number</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Client Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Submitted By</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Items</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id} className="border-b border-[#1e2433]/50 hover:bg-gray-700/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <div>
                            <div className="font-medium">{formatDate(request.timestamp)}</div>
                            <div className="text-xs text-gray-500">{formatTime(request.timestamp)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-300 font-medium">
                            {request.drNumber || <span className="text-yellow-400 text-xs">Pending</span>}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-300 font-medium">{request.clientName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-400">{request.submittedBy}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-500" />
                          <div className="space-y-1">
                            {request.items.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="text-sm text-gray-300">
                                <span className="font-medium">{item.productName}</span>
                                <span className="text-gray-500"> ({item.size})</span>
                                <span className="text-[#f97316]"> x{item.quantity}</span>
                              </div>
                            ))}
                            {request.items.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{request.items.length - 2} more item{request.items.length - 2 !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-[#f97316] font-bold text-lg">
                          ₱{request.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="bg-[#08090e] rounded-lg p-4 border border-[#1e2433] space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#1e2433]">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="font-medium text-sm">{formatDate(request.timestamp)}</div>
                        <div className="text-xs text-gray-500">{formatTime(request.timestamp)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#f97316] font-bold">
                        ₱{request.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-400">DR:</span>
                      <span className="text-gray-300 font-medium">
                        {request.drNumber || <span className="text-yellow-400 text-xs">Pending</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-400">Client:</span>
                      <span className="text-gray-300 font-medium">{request.clientName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-400">Submitted By:</span>
                      <span className="text-gray-300">{request.submittedBy}</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="pt-2 border-t border-[#1e2433]">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-400 text-sm font-medium">Items:</span>
                    </div>
                    <div className="space-y-1 ml-6">
                      {request.items.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="text-sm text-gray-300">
                          <span className="font-medium">{item.productName}</span>
                          <span className="text-gray-500"> ({item.size})</span>
                          <span className="text-[#f97316]"> x{item.quantity}</span>
                        </div>
                      ))}
                      {request.items.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{request.items.length - 2} more item{request.items.length - 2 !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Download Manager Modal */}
      <DownloadManagerModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        requests={requests}
      />
    </div>
  );
}