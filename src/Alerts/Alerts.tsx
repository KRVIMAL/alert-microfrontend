import React, { useState, useEffect } from 'react';
import { FiSearch, FiCalendar } from 'react-icons/fi';
import { Alert } from '../types';
import CustomTable, { Column } from './components/CustomTable';

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedImei, setSelectedImei] = useState<any>(700070635323);
  const [imeiSearchTerm, setImeiSearchTerm] = useState('');
  const [isImeiDropdownOpen, setIsImeiDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        // Construct the API URL with any filter parameters
        const startDateParam = '2025-03-19T10:55:06Z';
        const endDateParam = '2025-03-20T07:54:08Z';
        const imeiValue = '700070635323';
        
        const apiUrl = `http://localhost:3000/alert?startDate=${encodeURIComponent(startDateParam)}&endDate=${encodeURIComponent(endDateParam)}&imei=${encodeURIComponent(imeiValue)}`;
        
        const response = await fetch(apiUrl);
        
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
        } else {
          console.error('Unexpected API response structure:', responseData);
          throw new Error('Unexpected API response structure');
        }
        
        setLoading(false);
      } catch (err) {
        setError("Failed to load alerts. Please try again later.");
        setLoading(false);
        console.error("Error fetching alerts:", err);
      }
    };
    
    fetchAlerts();
  }, [startDate, endDate, selectedImei]);

  useEffect(() => {
    if (!alerts.length) return;
    
    const filtered = alerts.filter(alert => {
      const matchesSearch = 
        (alert.alertType && alert.alertType.toLowerCase().includes(search.toLowerCase())) ||
        (alert.alertMessage && alert.alertMessage.toLowerCase().includes(search.toLowerCase())) ||
        (alert.imei && alert.imei.toLowerCase().includes(search.toLowerCase()));
      
      const alertDate = new Date(alert.dateTime);
      const matchesStartDate = startDate ? alertDate >= new Date(startDate) : true;
      const matchesEndDate = endDate ? alertDate <= new Date(endDate) : true;
      const matchesImei = selectedImei ? alert.imei === selectedImei.toString() : true;
      
      return matchesSearch && matchesStartDate && matchesEndDate && matchesImei;
    });
    
    setFilteredAlerts(filtered);
  }, [alerts, search, startDate, endDate, selectedImei]);

  // Get unique IMEIs for dropdown
  const uniqueImeis = Array.from(new Set(alerts?.map(alert => alert.imei)));
  const filteredImeis = uniqueImeis?.filter(imei => 
    imei?.toLowerCase()?.includes(imeiSearchTerm?.toLowerCase())
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
    setSearch('');
    setStartDate('');
    setEndDate('');
    setSelectedImei('');
    setImeiSearchTerm('');
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
      
      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        <>
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
                <div className="flex items-center min-w-[150px]">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      placeholder="Start Date"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex items-center min-w-[150px]">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      placeholder="End Date"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
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
                          onClick={() => handleImeiSelect('')}
                        >
                          All IMEIs
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
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-white bg-gray-500 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
          
          {/* Table Component */}
          <CustomTable
            data={filteredAlerts}
            columns={columns}
            keyExtractor={(alert:any) => alert._id}
            loading={loading}
            pagination={true}
            itemsPerPageOptions={[10, 25, 50, 100]}
            defaultItemsPerPage={10}
            searchable={false} // We're using our custom search instead
            emptyMessage="No alerts found matching your filters."
            loadingMessage="Loading alerts..."
            className="mb-6"
          />
        </>
      )}
    </div>
  );
};

export default Alerts;