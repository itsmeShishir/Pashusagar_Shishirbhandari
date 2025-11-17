import { useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '../redux/cartSlice';
import { handlePaymentReturn, isPaymentSuccessUrl } from '../utils/paymentUtils';

const PaymentStatusHandler = () => {
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();

    useEffect(() => {
        // Check if this is a payment success scenario
        if (isPaymentSuccessUrl(location.pathname, searchParams)) {
            handlePaymentReturn(searchParams, dispatch, clearCart);
        }
    }, [location.pathname, searchParams, dispatch]);

    // This component doesn't render anything
    return null;
};

export default PaymentStatusHandler;