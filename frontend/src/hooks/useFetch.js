import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Custom hook for fetching data with loading and error states
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options (method, body, headers, dependencies)
 * @returns {Object} Data, loading, error, refetch
 */
const useFetch = (url, options = {}) => {
    const {
        method = 'GET',
        body = null,
        headers = {},
        immediate = true,
        dependencies = [],
        transformData = (data) => data
    } = options;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [status, setStatus] = useState(null);

    const fetchData = useCallback(async (overrideUrl = null, overrideBody = null) => {
        const requestUrl = overrideUrl || url;
        const requestBody = overrideBody !== undefined ? overrideBody : body;

        if (!requestUrl) return;

        setLoading(true);
        setError(null);

        try {
            let response;

            switch (method.toUpperCase()) {
                case 'GET':
                    response = await api.get(requestUrl);
                    break;
                case 'POST':
                    response = await api.post(requestUrl, requestBody, { headers });
                    break;
                case 'PUT':
                    response = await api.put(requestUrl, requestBody, { headers });
                    break;
                case 'PATCH':
                    response = await api.patch(requestUrl, requestBody, { headers });
                    break;
                case 'DELETE':
                    response = await api.delete(requestUrl, { headers });
                    break;
                default:
                    response = await api({
                        method,
                        url: requestUrl,
                        data: requestBody,
                        headers
                    });
            }

            setStatus(response.status);
            const transformedData = transformData(response.data);
            setData(transformedData);
            return transformedData;
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.response?.data?.message || err.message || 'An error occurred');
            setStatus(err.response?.status);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [url, method, body, headers, transformData]);

    useEffect(() => {
        if (immediate && url) {
            fetchData();
        }
    }, [url, ...dependencies]);

    return {
        data,
        loading,
        error,
        status,
        refetch: fetchData,
        setData
    };
};

/**
 * Custom hook for paginated data fetching
 */
export const usePaginatedFetch = (url, options = {}) => {
    const {
        itemsPerPage = 10,
        initialPage = 1,
        ...restOptions
    } = options;

    const [page, setPage] = useState(initialPage);
    const [hasMore, setHasMore] = useState(true);
    const [allData, setAllData] = useState([]);

    const { data, loading, error, refetch } = useFetch(
        `${url}?page=${page}&limit=${itemsPerPage}`,
        { ...restOptions, immediate: false }
    );

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;

        const result = await refetch();
        if (result?.data) {
            const newItems = result.data;
            setAllData(prev => [...prev, ...newItems]);
            setHasMore(newItems.length === itemsPerPage);
        }
    }, [loading, hasMore, refetch, itemsPerPage]);

    const resetAndFetch = useCallback(async () => {
        setPage(initialPage);
        setAllData([]);
        setHasMore(true);
        const result = await refetch();
        if (result?.data) {
            setAllData(result.data);
            setHasMore(result.data.length === itemsPerPage);
        }
    }, [initialPage, refetch, itemsPerPage]);

    useEffect(() => {
        resetAndFetch();
    }, [url]);

    return {
        data: allData,
        loading,
        error,
        hasMore,
        loadMore,
        resetAndFetch,
        page,
        setPage
    };
};

export default useFetch;