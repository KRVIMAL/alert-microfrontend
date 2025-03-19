import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((data: T) => React.ReactNode);
  cell?: (data: T) => React.ReactNode;
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
  searchable = false,
  searchPlaceholder = 'Search...',
  onSearch,
  emptyMessage = 'No data available',
  loadingMessage = 'Loading data...',
  className = '',
}: CustomTableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [searchTerm, setSearchTerm] = useState('');
  const [jumpToPage, setJumpToPage] = useState('');

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  // Reset to first page when data changes or items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length, itemsPerPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch && onSearch(term);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
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

  return (
    <div className={`w-full bg-white shadow-md rounded-lg overflow-hidden ${className}`}>
      {/* Search */}
      {searchable && (
        <div className="p-4 border-b bg-gray-50">
          <div className="relative">
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearch}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">{loadingMessage}</p>
          </div>
        ) : (
          <>
            {data.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
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
                          {column.cell 
                            ? column.cell(item) 
                            : typeof column.accessor === 'function'
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
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, data.length)}
                </span>{" "}
                of <span className="font-medium">{data.length}</span> results
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                className="text-sm border-gray-300 rounded-md"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                {itemsPerPageOptions.map(option => (
                  <option key={option} value={option}>{option} per page</option>
                ))}
              </select>
              
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                {/* First Page */}
                <button
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">First Page</span>
                  <FiChevronsLeft className="h-5 w-5" />
                </button>
                
                {/* Previous Page */}
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <FiChevronLeft className="h-5 w-5" />
                </button>
                
                {/* Page numbers */}
                <div className="flex items-center">
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
                
                {/* Jump to page */}
                <div className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm">
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
                
                {/* Next Page */}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <FiChevronRight className="h-5 w-5" />
                </button>
                
                {/* Last Page */}
                <button
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Last Page</span>
                  <FiChevronsRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
          
          {/* Mobile pagination */}
          <div className="flex sm:hidden justify-between w-full">
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === 1 ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              First
            </button>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === 1 ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              Prev
            </button>
            <span className="text-sm text-gray-700 py-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === totalPages ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              Next
            </button>
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === totalPages ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 'text-gray-700 bg-white hover:bg-gray-50'
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