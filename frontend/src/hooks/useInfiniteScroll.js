import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for infinite scrolling
 * @param {Function} fetchMore - Function to fetch more data
 * @param {boolean} hasMore - Whether there's more data to load
 * @param {boolean} loading - Whether data is currently loading
 * @param {number} threshold - Intersection threshold (default: 0.1)
 * @returns {Object} Ref to attach to the last element
 */
const useInfiniteScroll = (fetchMore, hasMore, loading, threshold = 0.1) => {
    const observerRef = useRef();
    const lastElementRef = useCallback(
        (node) => {
            if (loading) return;
            if (observerRef.current) observerRef.current.disconnect();

            observerRef.current = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting && hasMore && !loading) {
                        fetchMore();
                    }
                },
                { threshold }
            );

            if (node) observerRef.current.observe(node);
        },
        [loading, hasMore, fetchMore, threshold]
    );

    useEffect(() => {
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    return lastElementRef;
};

export default useInfiniteScroll;