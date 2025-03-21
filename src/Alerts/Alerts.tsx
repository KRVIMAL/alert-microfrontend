import React, { useState, useEffect } from 'react';
import { FiSearch, FiCalendar } from 'react-icons/fi';
import CustomTable, { Column } from './components/CustomTable';

// Define Alert type
interface Alert {
  _id: string;
  imei: string;
  dateTime: string;
  alertType: string;
  alertMessage: string;
  deviceTypeAlert: string;
  latitude: number;
  longitude: number;
  "Additional Data": Array<{
    batteryPercentage?: number;
    [key: string]: any;
  }>;
  source:string;
  value:string;
}

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [noDataMessage, setNoDataMessage] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  
  // Filters
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('2025-03-21T07:38:13Z');
  const [endDate, setEndDate] = useState('2025-03-21T08:35:44Z');
  const [selectedImei, setSelectedImei] = useState<string>('');
  const [imeiSearchTerm, setImeiSearchTerm] = useState('');
  const [isImeiDropdownOpen, setIsImeiDropdownOpen] = useState(false);
  const [uniqueImeis, setUniqueImeis] = useState<string[]>([]);

  // Function to format date for datetime-local input
  const formatDateForInput = (date: Date): string => {
    return date.toISOString().slice(0, 16);
  };

  // Set default dates (current day and next day)
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setStartDate(formatDateForInput(now));
    setEndDate(formatDateForInput(tomorrow));
  }, []);

  const fetchAlerts = async (page = currentPage, limit = itemsPerPage) => {
    if (!startDate || !endDate || !selectedImei) {
      return; // Don't fetch until all required filters are set
    }
    
    setIsInitialLoad(false);
    try {
      setLoading(true);
      setNoDataMessage(null);
      setError(null);
      
      // Construct the API URL with filter parameters and pagination
      const startDateParam = new Date(startDate).toISOString();
      const endDateParam = new Date(endDate).toISOString();
      const imeiValue = selectedImei;
      
      const apiUrl = `http://localhost:3000/alert?startDate=${encodeURIComponent(startDateParam)}&endDate=${encodeURIComponent(endDateParam)}&imei=${encodeURIComponent(imeiValue)}&page=${page}&limit=${limit}`;
      
      const response = await fetch(apiUrl);
      
      if (response.status === 404) {
        const errorData = await response.json();
        setNoDataMessage(errorData.message || "No data found for the selected criteria");
        setAlerts([]);
        setFilteredAlerts([]);
        setTotalRecords(0);
        setLoading(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const responseData = await response.json();
      if (responseData.success && Array.isArray(responseData.data)) {
        const processedData = responseData.data.map((alert: any) => ({
          ...alert,
          "Additional Data": alert["Additional Data"] || []
        }));
        
        setAlerts(processedData);
        setFilteredAlerts(processedData);
        
        // Set total records for pagination
        if (responseData.meta && responseData.meta.total) {
          setTotalRecords(responseData.meta.total);
        } else {
          // If meta data is not provided, use the length of the current data
          setTotalRecords(processedData.length);
        }
        
        // Extract unique IMEIs from the data if we need to populate the dropdown
        if (uniqueImeis.length === 0 || page === 1) {
          // Only update IMEIs list on first page or if list is empty
          const imeis = Array.from(new Set(processedData.map((alert: Alert) => alert.imei)));
          if (imeis.length > 0) {
            setUniqueImeis(imeis as string[]);
          }
        }
      } else {
        console.error('Unexpected API response structure:', responseData);
        throw new Error('Unexpected API response structure');
      }
      
      setLoading(false);
    } catch (err) {
      const error = err as Error;
      setError(`Failed to load alerts: ${error.message}`);
      setLoading(false);
      console.error("Error fetching alerts:", error);
    }
  };

  // Fetch data when filters change or pagination changes
  useEffect(() => {
    if (!isInitialLoad && startDate && endDate && selectedImei) {
      // Reset to page 1 when filters change
      setCurrentPage(1);
      fetchAlerts(1, itemsPerPage);
    }
  }, [startDate, endDate, selectedImei, isInitialLoad]);
  
  // Handle page or items per page changes
  useEffect(() => {
    if (!isInitialLoad && startDate && endDate && selectedImei) {
      fetchAlerts(currentPage, itemsPerPage);
    }
  }, [currentPage, itemsPerPage]);

  // Filter alerts based on search term
  useEffect(() => {
    if (!alerts.length) return;
    
    const filtered = alerts.filter(alert => {
      const matchesSearch = 
        (alert.alertType && alert.alertType.toLowerCase().includes(search.toLowerCase())) ||
        (alert.alertMessage && alert.alertMessage.toLowerCase().includes(search.toLowerCase())) ||
        (alert.imei && alert.imei.toLowerCase().includes(search.toLowerCase()));
      
      return matchesSearch;
    });
    
    setFilteredAlerts(filtered);
  }, [alerts, search]);

  // Get filtered IMEIs for dropdown
  const filteredImeis = uniqueImeis.filter(imei => 
    imei.toLowerCase().includes(imeiSearchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleImeiSelect = (imei: string) => {
    setSelectedImei(imei);
    setIsImeiDropdownOpen(false);
  };

  const clearFilters = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setSearch('');
    setStartDate(formatDateForInput(now));
    setEndDate(formatDateForInput(tomorrow));
    setSelectedImei('');
    setImeiSearchTerm('');
    setIsInitialLoad(true);
    setAlerts([]);
    setFilteredAlerts([]);
    setNoDataMessage(null);
    setError(null);
    setCurrentPage(1);
    setItemsPerPage(10);
    setTotalRecords(0);
  };

  const applyFilters = () => {
    setCurrentPage(1); // Reset to first page when applying new filters
    fetchAlerts(1, itemsPerPage);
  };

  // Define table columns
  const columns: Column<Alert>[] = [
    {
      header: 'IMEI',
      accessor: 'imei',
      className: 'whitespace-nowrap font-medium text-gray-900'
    },
    {
      header: 'Date & Time',
      accessor: (alert) => formatDate(alert.dateTime),
      className: 'whitespace-nowrap'
    },
    {
      header: 'Alert Type',
      accessor: (alert) => {
        const alertTypeString = String(alert.alertType || '');
        return (
          <span 
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              alertTypeString.includes('battery') ? 'bg-yellow-100 text-yellow-800' : 
              alertTypeString.includes('tamper') || alertTypeString.includes('unsealed') ? 'bg-red-100 text-red-800' : 
              alertTypeString.includes('sealed') ? 'bg-green-100 text-green-800' :
              'bg-blue-100 text-blue-800'
            }`}
          >
            {alertTypeString}
          </span>
        );
      }
    },
    {
      header: 'Source',
      accessor: 'source',
      className: 'whitespace-nowrap'
    }, 
     {
      header: 'Value',
      accessor: 'value',
      className: 'whitespace-nowrap'
    },
    {
      header: 'Alert Message',
      accessor: 'alertMessage',
      className: 'max-w-md truncate'
    },
    {
      header: 'Device Type',
      accessor: 'deviceTypeAlert',
      className: 'whitespace-nowrap'
    },
    {
      header: 'Location',
      accessor: (alert) => {
        return (
          <div className="flex items-center justify-center">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                // Use a URL that will show a marker by using the map embed URL
                const apiKey = 'AIzaSyAaZ1M_ofwVoLohowruNhY0fyihH9NpcI0';
                const googleMapsUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${alert.latitude},${alert.longitude}&zoom=15`;
                
                // For a more consistent experience, open in a new window with specific dimensions
                const mapWindow = window.open('', '_blank', 'width=800,height=600');
                
                if (mapWindow) {
                  mapWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <title>Location: ${alert.latitude.toFixed(6)}, ${alert.longitude.toFixed(6)}</title>
                        <style>
                          body, html { margin: 0; padding: 0; height: 100%; }
                          iframe { width: 100%; height: 100%; border: none; }
                        </style>
                      </head>
                      <body>
                        <iframe
                          src="${googleMapsUrl}"
                          allowfullscreen>
                        </iframe>
                      </body>
                    </html>
                  `);
                } else {
                  // Fallback if popup is blocked
                  window.open(`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}&z=15`, '_blank');
                }
              }}
              className="p-2 text-blue-600 hover:text-blue-800 focus:outline-none"
              title={`${alert.latitude.toFixed(6)}, ${alert.longitude.toFixed(6)}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        );
      },
      className: 'whitespace-nowrap'
    },
    {
      header: 'Battery',
      accessor: (alert) => {
        // Default to 'N/A' if Additional Data is missing or doesn't have battery info
        let batteryPercentage:any = 'N/A';
        
        // Try to find battery percentage in the alert message if it contains it
        if (alert.alertMessage && alert.alertMessage.includes('Battery') && alert.alertType === 'battery') {
          const match = alert.alertMessage.match(/Battery level is at (\d+\.\d+)%/);
          if (match && match[1]) {
            batteryPercentage = parseFloat(match[1]);
          }
        }
        
        // Try to get battery percentage from Additional Data if it exists
        if (alert["Additional Data"] && Array.isArray(alert["Additional Data"])) {
          const batteryData = alert["Additional Data"].find(data => 
            data.batteryPercentage !== undefined
          );
          if (batteryData?.batteryPercentage !== undefined) {
            batteryPercentage = batteryData.batteryPercentage;
          }
        }
        
        return (
          <div className="flex items-center">
            <div className="h-2 w-16 bg-gray-200 rounded-full mr-2 overflow-hidden">
              <div 
                className={`h-full ${
                  typeof batteryPercentage === 'number' && batteryPercentage < 20 ? 'bg-red-500' : 
                  typeof batteryPercentage === 'number' && batteryPercentage < 50 ? 'bg-yellow-500' : 
                  typeof batteryPercentage === 'number' ? 'bg-green-500' : 'bg-gray-300'
                }`}
                style={{ width: `${typeof batteryPercentage === 'number' ? batteryPercentage : 0}%` }}
              ></div>
            </div>
            <span>{batteryPercentage}{typeof batteryPercentage === 'number' ? '%' : ''}</span>
          </div>
        );
      }
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Device Alerts</h1>
        <p className="text-gray-600">Monitor and manage device alerts from your fleet</p>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {/* Custom Filters */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search alerts..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center min-w-[220px]">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="text-gray-400" />
                </div>
                <input
                  type="datetime-local"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={startDate}
                  onChange={(e) => {
                    const newStartDate = e.target.value;
                    setStartDate(newStartDate);
                    
                    // If end date is before start date, update it
                    if (endDate && new Date(endDate) < new Date(newStartDate)) {
                      // Set end date to start date + 1 day
                      const nextDay = new Date(newStartDate);
                      nextDay.setDate(nextDay.getDate() + 1);
                      setEndDate(formatDateForInput(nextDay));
                    }
                  }}
                />
              </div>
            </div>
            
            <div className="flex items-center min-w-[220px]">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="text-gray-400" />
                </div>
                <input
                  type="datetime-local"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate} // This prevents selecting a date before the start date
                />
              </div>
            </div>
            
            {/* IMEI Dropdown */}
            <div className="relative min-w-[180px]">
              <button
                type="button"
                className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex justify-between items-center"
                onClick={() => setIsImeiDropdownOpen(!isImeiDropdownOpen)}
              >
                <span>{selectedImei || "Select IMEI"}</span>
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {isImeiDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                  <div className="sticky top-0 z-10 bg-white p-2">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search IMEI..."
                      value={imeiSearchTerm}
                      onChange={(e) => setImeiSearchTerm(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="pt-1">
                    <div
                      className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 text-gray-900"
                      onClick={() => handleImeiSelect('700070635323')}
                    >
                      700070635323
                    </div>
                    {filteredImeis.map((imei) => (
                      <div
                        key={imei}
                        className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 text-gray-900"
                        onClick={() => handleImeiSelect(imei)}
                      >
                        {imei}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={applyFilters}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Apply Filters
            </button>
            
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-white bg-gray-500 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* No Data Message */}
      {noDataMessage && !error && !loading && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{noDataMessage}</span>
        </div>
      )}
      
      {/* Initial State Message */}
      {isInitialLoad && !error && !loading && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">Please select date range and IMEI to view alerts.</span>
        </div>
      )}
      
      {/* Table Component */}
      <div className="overflow-x-auto">
        <CustomTable
          data={filteredAlerts}
          columns={columns}
          keyExtractor={(alert) => alert._id}
          loading={loading}
          pagination={true}
          itemsPerPageOptions={[10, 25, 50, 100]}
          defaultItemsPerPage={itemsPerPage}
          currentPage={currentPage}
          totalRecords={totalRecords}
          onPageChange={(page) => setCurrentPage(page)}
          onItemsPerPageChange={(limit) => {
            setItemsPerPage(limit);
            setCurrentPage(1); // Reset to first page when changing items per page
          }}
          searchable={false} // We're using our custom search instead
          emptyMessage={noDataMessage || (isInitialLoad ? "Select filters to view data" : "No alerts found matching your filters.")}
          loadingMessage="Loading alerts..."
          className="mb-6"
        />
      </div>
    </div>
  );
};

export default Alerts;