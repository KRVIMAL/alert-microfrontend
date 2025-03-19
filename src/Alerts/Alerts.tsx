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
  const [selectedImei, setSelectedImei] = useState<string>('');
  const [imeiSearchTerm, setImeiSearchTerm] = useState('');
  const [isImeiDropdownOpen, setIsImeiDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        
        // This is sample data for demonstration, in production this would be an API call
        // For example: const response = await fetch('/api/alerts');
        // const data = await response.json();
        
        // Using the provided sample data for now
        const sampleAlert: Alert = {
          "_id": {
            "$oid": "67da9c609b745ab2909d7c0c"
          },
          "imei": "700070635323",
          "latitude": 28.516482,
          "source": "System",
          "value": "",
          "alertType": "battery",
          "deviceType": "traqloc508",
          "dateTime": "2025-03-19T10:28:13Z",
          "deviceTypeAlert": "traqloc508",
          "messageProperty": "0073",
          "packetType": "0200",
          "serialNo": "0014",
          "speed": 0,
          "alertMessage": "Low Battery Alert: Battery level is at 98.00%, below the threshold of 99.00%.",
          "altitude": 272,
          "bearing": 0,
          "headerIdentifier": "7e",
          "longitude": 77.16524,
          "statusBitDefinition": {
            "latitudeUnit": "North Latitude",
            "motionState": true,
            "shackleOpen": true,
            "activeSim": "SIM card 2",
            "connectionType": "Non",
            "gps": true,
            "gpsOn": true,
            "ignitionOn": false,
            "longitudeUnit": "East Longitude",
            "network": "2G",
            "sealOpen": true,
            "chargeStatus": "In-charging",
            "connection": false
          },
          "Additional Data": [
            {
              "MCC": "0194",
              "baseStation": [
                {
                  "LAC": "087e",
                  "MNC": "000a",
                  "RXL": "00",
                  "CELLID": "0928ad0b"
                }
              ]
            },
            {
              "dynamicPassword": "3331333431323134"
            },
            {
              "Unknown Message ID": "00002710"
            },
            {
              "batteryPercentage": 98,
              "batteryVoltage": 418
            },
            {
              "networkCsqSignalValue": 10
            },
            {
              "satellites": 24
            },
            {
              "Data": "404100590350734"
            },
            {
              "Data": "IMZCORP"
            },
            {
              "Data": "8991102405903507341F"
            }
          ],
          "alarmFlagBit": {
            "overSpeed": false,
            "shackleWireCut": false,
            "shellTampered": true,
            "gnssFailure": false,
            "gpsAntennaOpen": false,
            "mcuCommAbnormal": false,
            "motorStuckUnseal": false,
            "timeoutParking": false,
            "gpsAntennaShort": false,
            "lowBattery": false,
            "mainPowerFailure": false,
            "shackleDamaged": false
          }
        };

        // Create a few more sample alerts with different values for demonstration
        const additionalAlerts = [
          {
            ...sampleAlert,
        //     _id: { $oid: "67da9c609b745ab2909d7c0d" },
        //     imei: "700070635324",
        //     alertType: "tamper",
        //     alertMessage: "Tamper Alert: Device shell has been opened.",
        //     dateTime: "2025-03-19T09:45:00Z",
        //     "Additional Data": [
        //       ...sampleAlert["Additional Data"].map(data => {
        //         if (data.batteryPercentage !== undefined) {
        //           return { ...data, batteryPercentage: 45 };
        //         }
        //         return data;
        //       })
        //     ],
        //     alarmFlagBit: { ...sampleAlert.alarmFlagBit, shellTampered: true }
        //   },
        //   {
        //     ...sampleAlert,
        //     _id: { $oid: "67da9c609b745ab2909d7c0e" },
        //     imei: "700070635325",
        //     alertType: "gps",
        //     alertMessage: "GPS Signal Lost: Unable to acquire location data.",
        //     dateTime: "2025-03-19T08:30:00Z",
        //     latitude: 28.613939,
        //     longitude: 77.209021,
        //     "Additional Data": [
        //       ...sampleAlert["Additional Data"].map(data => {
        //         if (data.batteryPercentage !== undefined) {
        //           return { ...data, batteryPercentage: 72 };
        //         }
        //         return data;
        //       })
        //     ],
        //     alarmFlagBit: { ...sampleAlert.alarmFlagBit, gnssFailure: true }
        //   },
        //   {
        //     ...sampleAlert,
        //     _id: { $oid: "67da9c609b745ab2909d7c0f" },
        //     imei: "700070635323",
        //     alertType: "speed",
        //     alertMessage: "Speed Alert: Vehicle exceeding speed limit (85 km/h).",
        //     dateTime: "2025-03-18T22:15:00Z",
        //     speed: 85,
        //     "Additional Data": [
        //       ...sampleAlert["Additional Data"].map(data => {
        //         if (data.batteryPercentage !== undefined) {
        //           return { ...data, batteryPercentage: 65 };
        //         }
        //         return data;
        //       })
        //     ],
        //     alarmFlagBit: { ...sampleAlert.alarmFlagBit, overSpeed: true }
        //   },
        //   {
        //     ...sampleAlert,
        //     _id: { $oid: "67da9c609b745ab2909d7c10" },
        //     imei: "700070635326",
        //     alertType: "battery",
        //     alertMessage: "Critical Battery Alert: Battery level is at 12.00%, critical threshold reached.",
        //     dateTime: "2025-03-18T18:45:00Z",
        //     "Additional Data": [
        //       ...sampleAlert["Additional Data"].map(data => {
        //         if (data.batteryPercentage !== undefined) {
        //           return { ...data, batteryPercentage: 12 };
        //         }
        //         return data;
        //       })
        //     ],
        //     alarmFlagBit: { ...sampleAlert.alarmFlagBit, lowBattery: true }
        //   }
        }
        ];

        // Combine the sample alerts
        const allAlerts = [sampleAlert, ...additionalAlerts];
        setAlerts(allAlerts);
        setFilteredAlerts(allAlerts);
        
        setLoading(false);
      } catch (err) {
        setError("Failed to load alerts. Please try again later.");
        setLoading(false);
        console.error("Error fetching alerts:", err);
      }
    };

    fetchAlerts();
  }, []);

  // Filter alerts when filter criteria changes
  useEffect(() => {
    const filtered = alerts.filter(alert => {
      const matchesSearch = 
        alert.alertType.toLowerCase().includes(search.toLowerCase()) ||
        alert.alertMessage.toLowerCase().includes(search.toLowerCase()) ||
        alert.imei.toLowerCase().includes(search.toLowerCase());
      
      const alertDate = new Date(alert.dateTime);
      const matchesStartDate = startDate ? alertDate >= new Date(startDate) : true;
      const matchesEndDate = endDate ? alertDate <= new Date(endDate) : true;
      const matchesImei = selectedImei ? alert.imei === selectedImei : true;
      
      return matchesSearch && matchesStartDate && matchesEndDate && matchesImei;
    });
    
    setFilteredAlerts(filtered);
  }, [alerts, search, startDate, endDate, selectedImei]);

  // Get unique IMEIs for dropdown
  const uniqueImeis = Array.from(new Set(alerts.map(alert => alert.imei)));
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
        return (
          <span 
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              alert.alertType === 'battery' ? 'bg-yellow-100 text-yellow-800' : 
              alert.alertType === 'tamper' ? 'bg-red-100 text-red-800' : 
              'bg-green-100 text-green-800'
            }`}
          >
            {alert.alertType}
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
      accessor: 'deviceType',
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
                  const googleMapsUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyAaZ1M_ofwVoLohowruNhY0fyihH9NpcI0&q=${alert.latitude},${alert.longitude}&zoom=15`;
                  
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
        // Find battery data
        const batteryData = alert["Additional Data"].find(data => 
          data.batteryPercentage !== undefined
        );
        const batteryPercentage = batteryData?.batteryPercentage || 'N/A';
        
        return (
          <div className="flex items-center">
            <div className="h-2 w-16 bg-gray-200 rounded-full mr-2 overflow-hidden">
              <div 
                className={`h-full ${
                  typeof batteryPercentage === 'number' && batteryPercentage < 20 ? 'bg-red-500' : 
                  typeof batteryPercentage === 'number' && batteryPercentage < 50 ? 'bg-yellow-500' : 
                  'bg-green-500'
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
            keyExtractor={(alert) => alert._id.$oid}
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