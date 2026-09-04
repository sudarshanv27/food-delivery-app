// src/hooks/useOrder.js
import { useContext } from 'react';
import OrderContext from '../contexts/OrderContext';

const useOrder = () => {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error('useOrder must be used within an OrderProvider');
    }
    return context;
};

export default useOrder;