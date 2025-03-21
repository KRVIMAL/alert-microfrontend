import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight, FiSearch } from 'react-icons/fi';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((data: T) => React.ReactNode);
  className?: string;
}

interface CustomTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  loading?: boolean;
  pagination?: boolean;
  itemsPerPageOptions?: number[];
  defaultItemsPerPage?: number;
  currentPage?: number;
  totalRecords?: number;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (searchTerm: string) => void;
  emptyMessage?: string;
  loadingMessage?: string;
  className?: string;
}

const CustomTable = <T extends object>({
  data,
  columns,
  keyExtractor,
  loading = false,
  pagination = true,
  itemsPerPageOptions = [10, 25, 50, 100],
  defaultItemsPerPage = 10,
  currentPage: externalCurrentPage,
  totalRecords,
  onPageChange,
  onItemsPerPageChange,
  searchable = false,
  searchPlaceholder = 'Search...',
  onSearch,
  emptyMessage = 'No data available',
  loadingMessage = 'Loading data...',
  className = '',
}: CustomTableProps<T>) => {
  // Use internal state if external control is not provided
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [internalItemsPerPage, setInternalItemsPerPage] = useState(defaultItemsPerPage);
  const [searchTerm, setSearchTerm] = useState('');
  const [jumpToPage, setJumpToPage] = useState('');

  // Use either controlled or uncontrolled state
  const currentPageValue = externalCurrentPage !== undefined ? externalCurrentPage : internalCurrentPage;
  const itemsPerPageValue = defaultItemsPerPage;

  // Calculate pagination values
  const calculatedTotalRecords = totalRecords !== undefined ? totalRecords : data.length;
  const totalPages = Math.ceil(calculatedTotalRecords / itemsPerPageValue);
  
  // Only slice the data if we're handling pagination client-side (no external control)
  const currentItems = onPageChange ? data : data.slice(
    (currentPageValue - 1) * itemsPerPageValue, 
    currentPageValue * itemsPerPageValue
  );
  
  const indexOfFirstItem = (currentPageValue - 1) * itemsPerPageValue + 1;
  const indexOfLastItem = Math.min(currentPageValue * itemsPerPageValue, calculatedTotalRecords);

  // Reset to first page when data changes or items per page changes
  useEffect(() => {
    if (!onPageChange) {
      setInternalCurrentPage(1);
    }
  }, [data.length, defaultItemsPerPage, onPageChange]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch && onSearch(term);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      if (onPageChange) {
        onPageChange(page);
      } else {
        setInternalCurrentPage(page);
      }
    }
  };

  const handleJumpToPage = () => {
    const pageNumber = parseInt(jumpToPage);
    if (!isNaN(pageNumber)) {
      goToPage(pageNumber);
      setJumpToPage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleJumpToPage();
    }
  };

  // Calculate visible page numbers for pagination
  const getPageNumbers = () => {
    const maxVisiblePages = 5;
    const pageNumbers = [];
    
    if (totalPages <= maxVisiblePages) {
      // If total pages is less than max visible, show all
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first and last page
      const leftOffset = Math.floor(maxVisiblePages / 2);
      const rightOffset = Math.ceil(maxVisiblePages / 2) - 1;
      
      let startPage = Math.max(currentPageValue - leftOffset, 1);
      let endPage = Math.min(currentPageValue + rightOffset, totalPages);
      
      // Adjust if we're near the beginning or end
      if (startPage === 1) {
        endPage = maxVisiblePages;
      }
      if (endPage === totalPages) {
        startPage = Math.max(totalPages - maxVisiblePages + 1, 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  return (
    <div className={`w-full bg-white shadow-md rounded-lg overflow-hidden ${className}`}>
      {/* Search */}
      {searchable && (
        <div className="p-4 border-b bg-gray-50">
          <div className="relative">
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearch}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto max-h-[calc(100vh-300px)]">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">{loadingMessage}</p>
          </div>
        ) : (
          <>
            {data.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    {columns.map((column, index) => (
                      <th 
                        key={index}
                        scope="col" 
                        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                      >
                        {column.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.map((item) => (
                    <tr key={keyExtractor(item)} className="hover:bg-gray-50">
                      {columns.map((column, index) => (
                        <td 
                          key={index} 
                          className={`px-6 py-4 text-sm text-gray-500 ${column.className || ''}`}
                        >
                          {typeof column.accessor === 'function'
                            ? column.accessor(item)
                            : String(item[column.accessor])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">{emptyMessage}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Pagination */}
      {pagination && data.length > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstItem}</span> to{" "}
                <span className="font-medium">
                  {indexOfLastItem}
                </span>{" "}
                of <span className="font-medium">{calculatedTotalRecords}</span> results
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                className="text-sm border-gray-300 rounded-md"
                value={itemsPerPageValue}
                onChange={(e) => {
                  const newValue = Number(e.target.value);
                  if (onItemsPerPageChange) {
                    onItemsPerPageChange(newValue);
                  } else {
                    setInternalItemsPerPage(newValue);
                  }
                }}
              >
                {itemsPerPageOptions.map(option => (
                  <option key={option} value={option}>{option} per page</option>
                ))}
              </select>
              
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                {/* First Page */}
                <button
                  onClick={() => goToPage(1)}
                  disabled={currentPageValue === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPageValue === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">First Page</span>
                  <FiChevronsLeft className="h-5 w-5" />
                </button>
                
                {/* Previous Page */}
                <button
                  onClick={() => goToPage(currentPageValue - 1)}
                  disabled={currentPageValue === 1}
                  className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                    currentPageValue === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <FiChevronLeft className="h-5 w-5" />
                </button>
                
                {/* Page numbers */}
                {getPageNumbers().map(pageNumber => (
                  <button
                    key={pageNumber}
                    onClick={() => goToPage(pageNumber)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                      currentPageValue === pageNumber 
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
                
                {/* Next Page */}
                <button
                  onClick={() => goToPage(currentPageValue + 1)}
                  disabled={currentPageValue === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                    currentPageValue === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <FiChevronRight className="h-5 w-5" />
                </button>
                
                {/* Last Page */}
                <button
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPageValue === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPageValue === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Last Page</span>
                  <FiChevronsRight className="h-5 w-5" />
                </button>
                
                {/* Jump to page */}
                <div className="relative inline-flex items-center px-2 py-2 ml-2 border border-gray-300 bg-white text-sm rounded-md">
                  <input
                    type="text"
                    placeholder="Go to"
                    className="w-16 py-1 px-2 border-0 focus:ring-0 text-xs"
                    value={jumpToPage}
                    onChange={(e) => setJumpToPage(e.target.value.replace(/[^0-9]/g, ''))}
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    onClick={handleJumpToPage}
                    className="text-xs px-1 text-gray-700 hover:text-gray-900"
                  >
                    Go
                  </button>
                </div>
              </nav>
            </div>
          </div>
          
          {/* Mobile pagination */}
          <div className="flex sm:hidden justify-between w-full">
            <button
              onClick={() => goToPage(1)}
              disabled={currentPageValue === 1}
              className={`relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPageValue === 1 ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              First
            </button>
            <button
              onClick={() => goToPage(currentPageValue - 1)}
              disabled={currentPageValue === 1}
              className={`relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPageValue === 1 ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              Prev
            </button>
            <span className="text-sm text-gray-700 py-2">
              {currentPageValue} / {totalPages}
            </span>
            <button
              onClick={() => goToPage(currentPageValue + 1)}
              disabled={currentPageValue === totalPages}
              className={`relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPageValue === totalPages ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              Next
            </button>
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPageValue === totalPages}
              className={`relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPageValue === totalPages ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTable;