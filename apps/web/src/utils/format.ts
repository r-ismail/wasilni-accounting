export const formatCurrency = (value: number | undefined): string => {
    return (value || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};
