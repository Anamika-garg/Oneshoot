export function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className='flex justify-center items-center space-x-2 mt-20'>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className='px-4 py-2 bg-orange text-black rounded disabled:opacity-50'
      >
        Prev 
      </button>
      <span className='text-white'>
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className='px-4 py-2 bg-orange text-black rounded disabled:opacity-50'
      >
        Next
      </button>
    </div>
  );
}
