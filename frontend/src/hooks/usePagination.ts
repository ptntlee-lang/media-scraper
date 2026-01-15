'use client';

import { useState } from 'react';

export const usePagination = (initialPage: number = 1) => {
  const [page, setPage] = useState(initialPage);

  const nextPage = () => setPage(prev => prev + 1);
  const previousPage = () => setPage(prev => Math.max(1, prev - 1));
  const goToPage = (newPage: number) => setPage(Math.max(1, newPage));
  const reset = () => setPage(initialPage);

  return {
    page,
    setPage: goToPage,
    nextPage,
    previousPage,
    reset,
  };
};
