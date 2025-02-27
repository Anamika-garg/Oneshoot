"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Pagination({ currentPage, totalPages, onPageChange }) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate start and end of visible pages
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're at the beginning
      if (currentPage <= 2) {
        end = Math.min(totalPages - 1, maxVisiblePages - 1);
      }

      // Adjust if we're at the end
      if (currentPage >= totalPages - 1) {
        start = Math.max(2, totalPages - maxVisiblePages + 2);
      }

      // Add ellipsis if needed
      if (start > 2) {
        pages.push("...");
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push("...");
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className='flex justify-center items-center mt-8 gap-2'>
      <Button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        variant='outline'
        size='icon'
        className='bg-transparent border-gray-700 hover:bg-gray-800 hover:text-white/80 text-white'
        aria-label='Previous page'
      >
        <ChevronLeft className='h-4 w-4' />
      </Button>

      {getPageNumbers().map((page, index) =>
        page === "..." ? (
          <span key={`ellipsis-${index}`} className='px-3 py-2 text-gray-400'>
            ...
          </span>
        ) : (
          <Button
            key={page}
            onClick={() => onPageChange(page)}
            variant={currentPage === page ? "default" : "outline"}
            className={`min-w-[40px] ${
              currentPage === page
                ? "bg-gradient-to-r from-gradientStart via-gradientMid to-gradientStart text-black"
                : "bg-transparent border-gray-700 hover:bg-gray-800 hover:text-white/80 text-white"
            }`}
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </Button>
        )
      )}

      <Button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        variant='outline'
        size='icon'
        className='bg-transparent border-gray-700 hover:bg-gray-800 hover:text-white/80 text-white'
        aria-label='Next page'
      >
        <ChevronRight className='h-4 w-4' />
      </Button>
    </div>
  );
}
