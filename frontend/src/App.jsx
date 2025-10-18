import React, { useState, useEffect } from 'react';
import { 
  Search, Upload, Download, Filter, Users, BarChart3, X, 
  ChevronRight, Calendar, Ship, MapPin, Database, FileText,
  Printer, RefreshCw, SlidersHorizontal, CheckSquare, Square, User
} from 'lucide-react';
import Login from './Login';
import { authAPI, passengerAPI } from './services/api';

// Info Card Component
const InfoCard = ({ label, value }) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
    <p className="text-sm text-gray-900">{value || 'N/A'}</p>
  </div>
);

// Category Details Component
const PassengerCategoryDetails = ({ passengerId }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await passengerAPI.fetchPassenger(passengerId);
        setDetails(data);
      } catch (error) {
        console.error('Error loading passenger details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [passengerId]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="animate-spin mx-auto mb-2 text-gray-400" size={24} />
        <p className="text-sm text-gray-500">Loading detailed information...</p>
      </div>
    );
  }

  if (!details) return null;

  return (
    <>
      {/* Laborer Info */}
      {details.laborer_info && (
        <div className="border-t pt-6">
          <h4 className="text-lg font-bold text-blue-900 mb-4">💼 Laborer Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <InfoCard label="Certificate of Residence No" value={details.laborer_info.cert_residence_no} />
            <InfoCard label="Return Certificate No" value={details.laborer_info.return_cert_no} />
            <InfoCard label="US Residence City" value={details.laborer_info.us_residence_city} />
            <InfoCard label="US Residence State" value={details.laborer_info.us_residence_state} />
            <InfoCard label="Departure Port (US)" value={details.laborer_info.departure_port_us} />
            <InfoCard label="Departure Date (US)" value={details.laborer_info.departure_date_us} />
            <div className="col-span-2">
              <InfoCard label="Claim Basis" value={details.laborer_info.claim_basis} />
            </div>
            <InfoCard label="Overtime Certificate" value={details.laborer_info.overtime_certificate} />
          </div>
        </div>
      )}

      {/* Merchant Info */}
      {details.merchant_info && (
        <div className="border-t pt-6">
          <h4 className="text-lg font-bold text-green-900 mb-4">🏪 Merchant Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <InfoCard label="Registered Certificate No" value={details.merchant_info.registered_cert_no} />
            <InfoCard label="Return Date to China" value={details.merchant_info.return_date_china} />
            <InfoCard label="Steamship Name" value={details.merchant_info.steamship_name} />
            <InfoCard label="Firm Name" value={details.merchant_info.firm_name} />
            <InfoCard label="Firm Address" value={details.merchant_info.firm_address} />
            <InfoCard label="Firm City" value={details.merchant_info.firm_city} />
            <InfoCard label="Members Count" value={details.merchant_info.members_count} />
            <InfoCard label="Years as Member" value={details.merchant_info.years_member} />
            <InfoCard label="Capital Invested" value={details.merchant_info.capital_invested} />
          </div>
        </div>
      )}

      {/* Transit Info */}
      {details.transit_info && (
        <div className="border-t pt-6">
          <h4 className="text-lg font-bold text-yellow-900 mb-4">🚂 Transit Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <InfoCard label="Cause of Departure" value={details.transit_info.cause_departure} />
            </div>
            <InfoCard label="US Residence" value={details.transit_info.us_residence} />
            <InfoCard label="US Occupation" value={details.transit_info.us_occupation} />
            <InfoCard label="Registered" value={details.transit_info.registered} />
            <InfoCard label="Registration Certificate No" value={details.transit_info.registration_cert_no} />
          </div>
        </div>
      )}

      {/* Wife/Child Info */}
      {details.wifechild_info && (
        <div className="border-t pt-6">
          <h4 className="text-lg font-bold text-pink-900 mb-4">👨‍👩‍👧 Wife/Child Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <InfoCard label="Husband or Father" value={details.wifechild_info.husband_or_father} />
            <InfoCard label="Residence Address" value={details.wifechild_info.residence_husband_father_address} />
            <InfoCard label="Residence State" value={details.wifechild_info.residence_husband_father_state} />
            <InfoCard label="Marriage Date" value={details.wifechild_info.marriage_date} />
            <InfoCard label="Marriage Place" value={details.wifechild_info.marriage_place} />
            <InfoCard label="First and Only Wife" value={details.wifechild_info.first_and_only_wife} />
            <div className="col-span-2">
              <InfoCard label="Witnesses" value={details.wifechild_info.witnesses} />
            </div>
            <InfoCard label="Children Names" value={details.wifechild_info.children_names} />
            <InfoCard label="Mother Name" value={details.wifechild_info.mother_name} />
            <InfoCard label="Brothers Names" value={details.wifechild_info.brothers_names} />
            <InfoCard label="Sisters Names" value={details.wifechild_info.sisters_names} />
          </div>
        </div>
      )}

      {/* Exempt Info */}
      {details.exempt_info && (
        <div className="border-t pt-6">
          <h4 className="text-lg font-bold text-purple-900 mb-4">🎓 Exempt Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <InfoCard label="Official Title" value={details.exempt_info.official_title} />
            <InfoCard label="Last Occupation" value={details.exempt_info.last_occupation} />
            <InfoCard label="Occupation Place" value={details.exempt_info.occupation_place} />
            <InfoCard label="Intended Occupation" value={details.exempt_info.intended_occupation} />
            <InfoCard label="Intended Residence" value={details.exempt_info.intended_residence} />
            <InfoCard label="Intended Duration" value={details.exempt_info.intended_duration} />
            <InfoCard label="Study Subject" value={details.exempt_info.study_subject} />
            <InfoCard label="School Name" value={details.exempt_info.school_name} />
          </div>
        </div>
      )}
    </>
  );
};
const PassengerDatabase = () => {
  // 认证状态
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // 数据状态
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [advancedSearch, setAdvancedSearch] = useState({
    name_individual: '',
    name_family: '',
    naid: '',
    ship_name: '',
    passenger_id: ''
  });
  const [filters, setFilters] = useState({
    categories: [],
    sex: '',
    arrival_port: '',
    departure_port: '',
    pob_country: '',
    passenger_class: '',
    start_date: '',
    end_date: ''
  });
  const [showFilters, setShowFilters] = useState(true);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const [uploadProgress, setUploadProgress] = useState('');
  const [availableFilters, setAvailableFilters] = useState({
    ports: [],
    departurePorts: [],
    countries: [],
    classes: []
  });

  const categoryOptions = [
    { value: 'laborer', label: 'Laborer', color: 'blue' },
    { value: 'merchant', label: 'Merchant', color: 'green' },
    { value: 'transit', label: 'Transit', color: 'yellow' },
    { value: 'wifechild', label: 'Wife/Child', color: 'pink' },
    { value: 'exempt', label: 'Exempt', color: 'purple' },
    { value: 'none', label: 'No Category', color: 'gray' }
  ];

  // 检查认证状态
  useEffect(() => {
    const checkAuth = () => {
      if (authAPI.isAuthenticated()) {
        const user = authAPI.getUser();
        setIsAuthenticated(true);
        setCurrentUser(user);
      }
    };
    checkAuth();
  }, []);

  // 加载数据
  useEffect(() => {
    if (isAuthenticated) {
      loadPassengers();
      loadStatistics();
      loadFilterOptions();
    }
  }, [searchTerm, filters, advancedSearch, isAuthenticated]);

  const handleLoginSuccess = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await authAPI.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  // 如果未登录，显示登录页面
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const loadPassengers = async () => {
    setLoading(true);
    try {
      const searchParams = {
        search: searchTerm,
        category: filters.categories.join(','),
        sex: filters.sex,
        arrival_port: filters.arrival_port,
        pob_country: filters.pob_country,
        passenger_class: filters.passenger_class,
        start_date: filters.start_date,
        end_date: filters.end_date,
        ...advancedSearch
      };
      
      Object.keys(searchParams).forEach(key => {
        if (!searchParams[key]) delete searchParams[key];
      });

      const data = await passengerAPI.fetchPassengers(searchParams);
      setPassengers(data.results || data);
    } catch (error) {
      console.error('Error loading passengers:', error);
    }
    setLoading(false);
  };

  const loadStatistics = async () => {
    try {
      const data = await passengerAPI.fetchStatistics();
      setStatistics(data);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const data = await passengerAPI.fetchPassengers({ page_size: 1000 });
      const allPassengers = data.results || data;
      
      const ports = [...new Set(allPassengers.map(p => p.arrival_port).filter(Boolean))].sort();
      const departurePorts = [...new Set(allPassengers.map(p => p.departure_port).filter(Boolean))].sort();
      const countries = [...new Set(allPassengers.map(p => p.pob_country).filter(Boolean))].sort();
      const classes = [...new Set(allPassengers.map(p => p.passenger_class).filter(Boolean))].sort();
      
      setAvailableFilters({ ports, departurePorts, countries, classes });
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const handleCategoryToggle = (category) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      categories: [],
      sex: '',
      arrival_port: '',
      departure_port: '',
      pob_country: '',
      passenger_class: '',
      start_date: '',
      end_date: ''
    });
    setAdvancedSearch({
      name_individual: '',
      name_family: '',
      naid: '',
      ship_name: '',
      passenger_id: ''
    });
    setSearchTerm('');
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadProgress('Uploading...');
    
    try {
      await passengerAPI.uploadFile(file);
      setUploadProgress('Upload successful!');
      setTimeout(() => {
        setShowUpload(false);
        setUploadProgress('');
        loadPassengers();
        loadStatistics();
      }, 1500);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await passengerAPI.exportCSV({ 
        search: searchTerm, 
        ...filters 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `passengers_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting CSV');
    }
  };

  const categoryColors = {
    laborer: 'bg-blue-100 text-blue-800 border-blue-200',
    merchant: 'bg-green-100 text-green-800 border-green-200',
    transit: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    wifechild: 'bg-pink-100 text-pink-800 border-pink-200',
    exempt: 'bg-purple-100 text-purple-800 border-purple-200',
    none: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const activeFiltersCount = 
    filters.categories.length + 
    (filters.sex ? 1 : 0) + 
    (filters.arrival_port ? 1 : 0) +
    (filters.departure_port ? 1 : 0) +
    (filters.pob_country ? 1 : 0) +
    (filters.passenger_class ? 1 : 0) +
    (filters.start_date ? 1 : 0) +
    (filters.end_date ? 1 : 0) +
    Object.values(advancedSearch).filter(v => v).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Professional Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Database className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">National Archives Research Database</h1>
                <p className="text-sm text-gray-600">Historical Passenger Records Management System</p>
              </div>
            </div>

            {/* Right Side: User Menu and Action Buttons */}
            <div className="flex items-center gap-3">
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
                >
                  <User size={18} className="text-gray-600" />
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{currentUser?.username}</span>
                      {currentUser?.is_superuser && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded">
                          ADMIN
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">{currentUser?.username}</p>
                      <p className="text-xs text-gray-500">{currentUser?.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {currentUser?.is_superuser ? 'Administrator' : 'Regular User'}
                      </p>
                    </div>
                    <div className="px-2 py-1">
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Upload - Only for Admin */}
                {currentUser?.is_superuser && (
                  <button
                    onClick={() => setShowUpload(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
                  >
                    <Upload size={18} />
                    <span className="font-medium">Upload Data</span>
                  </button>
                )}
                
                {/* Export CSV */}
                <button 
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm"
                >
                  <Download size={18} />
                  <span className="font-medium">Export CSV</span>
                </button>
                
                {/* Print */}
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition shadow-sm"
                >
                  <Printer size={18} />
                  <span className="font-medium">Print</span>
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Dashboard */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Total Records</p>
                    <p className="text-3xl font-bold text-blue-900 mt-1">{statistics.total_passengers.toLocaleString()}</p>
                  </div>
                  <Users className="text-blue-600" size={28} />
                </div>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-indigo-700 uppercase tracking-wide">Laborers</p>
                    <p className="text-3xl font-bold text-indigo-900 mt-1">{statistics.by_category.laborer.toLocaleString()}</p>
                  </div>
                  <div className="w-10 h-10 bg-indigo-200 rounded-full flex items-center justify-center">
                    <span className="text-indigo-700 font-bold text-sm">L</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Merchants</p>
                    <p className="text-3xl font-bold text-green-900 mt-1">{statistics.by_category.merchant.toLocaleString()}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                    <span className="text-green-700 font-bold text-sm">M</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-purple-700 uppercase tracking-wide">Transit</p>
                    <p className="text-3xl font-bold text-purple-900 mt-1">{statistics.by_category.transit.toLocaleString()}</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
                    <span className="text-purple-700 font-bold text-sm">T</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 border border-pink-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-pink-700 uppercase tracking-wide">Other</p>
                    <p className="text-3xl font-bold text-pink-900 mt-1">
                      {(statistics.by_category.wifechild + statistics.by_category.exempt).toLocaleString()}
                    </p>
                  </div>
                  <BarChart3 className="text-pink-600" size={28} />
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Advanced Filters */}
          <div className={`${showFilters ? 'col-span-3' : 'col-span-0'} print:hidden transition-all`}>
            {showFilters && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <SlidersHorizontal size={20} />
                    Advanced Filters
                  </h3>
                  {activeFiltersCount > 0 && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Categories */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Categories</label>
                    <div className="space-y-2">
                      {categoryOptions.map(cat => (
                        <label key={cat.value} className="flex items-center gap-2 cursor-pointer group">
                          <div 
                            onClick={() => handleCategoryToggle(cat.value)}
                            className="cursor-pointer"
                          >
                            {filters.categories.includes(cat.value) ? (
                              <CheckSquare size={18} className="text-blue-600" />
                            ) : (
                              <Square size={18} className="text-gray-400 group-hover:text-gray-600" />
                            )}
                          </div>
                          <span className="text-sm text-gray-700 group-hover:text-gray-900">{cat.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Sex */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sex</label>
                    <select
                      value={filters.sex}
                      onChange={(e) => setFilters({...filters, sex: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">All</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                    </select>
                  </div>

                  {/* Arrival Port */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Arrival Port</label>
                    <select
                      value={filters.arrival_port}
                      onChange={(e) => setFilters({...filters, arrival_port: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">All Ports</option>
                      {availableFilters.ports.map(port => (
                        <option key={port} value={port}>{port}</option>
                      ))}
                    </select>
                  </div>

                  {/* Departure Port */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Departure Port</label>
                    <select
                      value={filters.departure_port}
                      onChange={(e) => setFilters({...filters, departure_port: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">All Ports</option>
                      {availableFilters.departurePorts.map(port => (
                        <option key={port} value={port}>{port}</option>
                      ))}
                    </select>
                  </div>

                  {/* Country of Birth */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Country of Birth</label>
                    <select
                      value={filters.pob_country}
                      onChange={(e) => setFilters({...filters, pob_country: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">All Countries</option>
                      {availableFilters.countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>

                  {/* Class */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Passenger Class</label>
                    <select
                      value={filters.passenger_class}
                      onChange={(e) => setFilters({...filters, passenger_class: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">All Classes</option>
                      {availableFilters.classes.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date Range */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Arrival Date Range</label>
                    <div className="space-y-2">
                      <input
                        type="date"
                        value={filters.start_date}
                        onChange={(e) => setFilters({...filters, start_date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="From"
                      />
                      <input
                        type="date"
                        value={filters.end_date}
                        onChange={(e) => setFilters({...filters, end_date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="To"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-gray-200 space-y-2">
                    <button
                      onClick={clearAllFilters}
                      className="w-full px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={16} />
                      Clear All Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className={`${showFilters ? 'col-span-9' : 'col-span-12'} transition-all`}>
            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 print:hidden">
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <Filter size={18} />
                  {showFilters ? 'Hide' : 'Show'} Filters
                </button>
                <button
                  onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <Search size={18} />
                  Advanced Search
                </button>
                <div className="flex-1"></div>
                <span className="text-sm text-gray-600">
                  {passengers.length} records found
                </span>
              </div>

              {/* Quick Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Quick search: passenger name, NAID, ship name, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Advanced Search Panel */}
              {showAdvancedSearch && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Advanced Search Fields</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Individual Name"
                      value={advancedSearch.name_individual}
                      onChange={(e) => setAdvancedSearch({...advancedSearch, name_individual: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Family Name"
                      value={advancedSearch.name_family}
                      onChange={(e) => setAdvancedSearch({...advancedSearch, name_family: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="NAID"
                      value={advancedSearch.naid}
                      onChange={(e) => setAdvancedSearch({...advancedSearch, naid: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Ship Name"
                      value={advancedSearch.ship_name}
                      onChange={(e) => setAdvancedSearch({...advancedSearch, ship_name: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Passenger ID"
                      value={advancedSearch.passenger_id}
                      onChange={(e) => setAdvancedSearch({...advancedSearch, passenger_id: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm col-span-2"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Passenger ID</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">NAID</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Sex</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Ship</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Route</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Arrival</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Class</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Country</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Categories</th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider print:hidden">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan="11" className="px-6 py-12 text-center text-gray-500">
                          <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
                          Loading records...
                        </td>
                      </tr>
                    ) : passengers.length === 0 ? (
                      <tr>
                        <td colSpan="11" className="px-6 py-12 text-center text-gray-500">
                          <Database className="mx-auto mb-2 text-gray-400" size={32} />
                          <p className="font-medium">No records found</p>
                          <p className="text-xs mt-1">Try adjusting your filters or search terms</p>
                        </td>
                      </tr>
                    ) : (
                      passengers.map((passenger, idx) => (
                        <tr key={passenger.id} className={`hover:bg-blue-50 transition ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="px-4 py-3 text-xs font-mono text-gray-900">{passenger.passenger_id}</td>
                          <td className="px-4 py-3 text-xs text-gray-700">{passenger.naid}</td>
                          <td className="px-4 py-3">
                            <div className="text-xs font-medium text-gray-900">{passenger.name_individual || '-'}</div>
                            <div className="text-xs text-gray-500">{passenger.name_family || '-'}</div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-700">{passenger.sex || '-'}</td>
                          <td className="px-4 py-3 text-xs text-gray-700">{passenger.ship_name || '-'}</td>
                          <td className="px-4 py-3">
                            <div className="text-xs text-gray-700">{passenger.departure_port || '-'}</div>
                            <div className="text-xs text-gray-500">→ {passenger.arrival_port || '-'}</div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-700">{passenger.arrival_date || '-'}</td>
                          <td className="px-4 py-3 text-xs text-gray-700">{passenger.passenger_class || '-'}</td>
                          <td className="px-4 py-3 text-xs text-gray-700">{passenger.pob_country || '-'}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {passenger.categories && passenger.categories.length > 0 ? (
                                passenger.categories.map((cat) => (
                                  <span
                                    key={cat}
                                    className={`px-2 py-1 text-xs font-medium rounded-md border ${categoryColors[cat]}`}
                                  >
                                    {cat}
                                  </span>
                                ))
                              ) : (
                                <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-600 border border-gray-200">
                                  none
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 print:hidden">
                            <button
                              onClick={() => setSelectedPassenger(passenger)}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1 hover:underline"
                            >
                              View Details
                              <ChevronRight size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Info */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Displaying <span className="font-semibold">{passengers.length}</span> records
                  {activeFiltersCount > 0 && (
                    <span> with <span className="font-semibold">{activeFiltersCount}</span> active filter{activeFiltersCount !== 1 ? 's' : ''}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed">
                    Previous
                  </button>
                  <button className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Upload className="text-blue-600" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Upload Excel File</h3>
                  <p className="text-xs text-gray-500">Import passenger records from spreadsheet</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowUpload(false);
                  setUploadProgress('');
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition">
                <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-sm text-gray-700 mb-2 font-medium">
                  Drop your Excel file here or click to browse
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Supports .xlsx and .xls formats
                </p>
                {uploadProgress ? (
                  <div className="mt-4">
                    <p className={`text-sm font-medium ${uploadProgress.includes('Error') ? 'text-red-600' : 'text-blue-600'}`}>
                      {uploadProgress}
                    </p>
                  </div>
                ) : (
                  <label className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 cursor-pointer transition shadow-md hover:shadow-lg">
                    Select File
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-blue-900 mb-2">File Requirements:</p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Must contain columns: NAID, line_no, image_no, name_individual</li>
                  <li>• Supported formats: Excel 2007+ (.xlsx) or Excel 97-2003 (.xls)</li>
                  <li>• Maximum file size: 50MB</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Passenger Modal */}
      {selectedPassenger && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 sticky top-0 z-10">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedPassenger.name_individual} {selectedPassenger.name_family}
                </h3>
                <p className="text-sm text-gray-600 mt-1">Passenger ID: {selectedPassenger.passenger_id}</p>
              </div>
              <button
                onClick={() => setSelectedPassenger(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={28} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-blue-600" />
                  Basic Information
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <InfoCard label="Passenger ID" value={selectedPassenger.passenger_id} />
                  <InfoCard label="NAID" value={selectedPassenger.naid} />
                  <InfoCard label="Individual Name" value={selectedPassenger.name_individual} />
                  <InfoCard label="Family Name" value={selectedPassenger.name_family} />
                  <InfoCard label="Tribal Name" value={selectedPassenger.name_tribal} />
                  <InfoCard label="Chinese Signature" value={selectedPassenger.chinese_signature} />
                  <InfoCard label="Sex" value={selectedPassenger.sex} />
                  <InfoCard label="Date of Birth" value={selectedPassenger.date_of_birth} />
                  <InfoCard label="Passenger Class" value={selectedPassenger.passenger_class} />
                </div>
              </div>

              {/* Travel Information */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Ship size={20} className="text-green-600" />
                  Travel Information
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <InfoCard label="Ship Name" value={selectedPassenger.ship_name} />
                  <InfoCard label="Departure Port" value={selectedPassenger.departure_port} />
                  <InfoCard label="Arrival Port" value={selectedPassenger.arrival_port} />
                  <InfoCard label="Arrival Date" value={selectedPassenger.arrival_date} />
                  <InfoCard label="Destination" value={selectedPassenger.destination} />
                  <InfoCard label="Country of Birth" value={selectedPassenger.pob_country} />
                  <InfoCard label="City of Birth (Std)" value={selectedPassenger.pob_city_std} />
                  <InfoCard label="District of Birth (Std)" value={selectedPassenger.pob_district_std} />
                  <InfoCard label="Image Number" value={selectedPassenger.image_no} />
                  <InfoCard label="Line Number" value={selectedPassenger.line_no} />
                </div>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4">Categories</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedPassenger.categories && selectedPassenger.categories.length > 0 ? (
                    selectedPassenger.categories.map((cat) => (
                      <span
                        key={cat}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg border-2 ${categoryColors[cat]}`}
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </span>
                    ))
                  ) : (
                    <span className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-600 border-2 border-gray-200">
                      No categories assigned
                    </span>
                  )}
                </div>
              </div>

              {/* Category Details - Will load when modal opens */}
              <PassengerCategoryDetails passengerId={selectedPassenger.id} />
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0">
              <button
                onClick={() => setSelectedPassenger(null)}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          table, table * {
            visibility: visible;
          }
          table {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            font-size: 9px;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PassengerDatabase;