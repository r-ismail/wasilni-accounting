import { useState, useEffect } from 'react';
import { useCompanySettings } from './useCompanySettings';

export function usePagination() {
  const { settings } = useCompanySettings();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(settings.defaultPageSize);

  // Update rowsPerPage when settings change
  useEffect(() => {
    setRowsPerPage(settings.defaultPageSize);
  }, [settings.defaultPageSize]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginateData = <T,>(data: T[] | undefined): T[] => {
    if (!data) return [];
    return data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  };

  return {
    page,
    rowsPerPage,
    setPage,
    setRowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    paginateData,
  };
}
