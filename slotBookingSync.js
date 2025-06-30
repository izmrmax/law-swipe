import React, { useState, useEffect, useCallback } from 'react';
import apiClient from './apiclient';

const getAvailability = async (lawyerId, signal) => {
  const response = await apiClient.get(`/booking/availability/${lawyerId}`, { signal });
  return response.data;
};

const bookSlot = async (slotId, paymentInfo) => {
  const response = await apiClient.post('/booking', { slotId, paymentInfo });
  return response.data;
};

const SlotBookingSync = ({ lawyerId }) => {
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState(null);

  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiry: '',
    cvc: ''
  });

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    if (!lawyerId) return;
    const controller = new AbortController();
    setLoadingSlots(true);
    setSlotsError(null);
    getAvailability(lawyerId, controller.signal)
      .then(data => setSlots(data))
      .catch(err => {
        if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
          setSlotsError(err.message || 'Failed to load slots');
        }
      })
      .finally(() => setLoadingSlots(false));
    return () => {
      controller.abort();
    };
  }, [lawyerId]);

  const handleSlotSelect = useCallback(e => {
    setSelectedSlotId(e.target.value);
    setBookingError(null);
    setBookingSuccess(false);
  }, []);

  const handlePaymentChange = useCallback(e => {
    const { name, value } = e.target;
    setPaymentInfo(prev => ({ ...prev, [name]: value }));
    setBookingError(null);
    setBookingSuccess(false);
  }, []);

  const handleBooking = useCallback(
    async e => {
      e.preventDefault();
      if (!selectedSlotId) {
        setBookingError('Please select a slot');
        return;
      }
      const { cardNumber, expiry, cvc } = paymentInfo;
      if (!cardNumber || !expiry || !cvc) {
        setBookingError('Fill all payment fields');
        return;
      }
      const cardNumberRegex = /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/;
      const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
      const cvcRegex = /^\d{3,4}$/;
      if (!cardNumberRegex.test(cardNumber)) {
        setBookingError('Invalid card number format');
        return;
      }
      if (!expiryRegex.test(expiry)) {
        setBookingError('Invalid expiry format');
        return;
      }
      if (!cvcRegex.test(cvc)) {
        setBookingError('Invalid CVC format');
        return;
      }
      setBookingLoading(true);
      setBookingError(null);
      try {
        await bookSlot(selectedSlotId, paymentInfo);
        setBookingSuccess(true);
        setSelectedSlotId('');
        setPaymentInfo({ cardNumber: '', expiry: '', cvc: '' });
      } catch (err) {
        setBookingError(err.response?.data?.message || err.message || 'Booking failed');
      } finally {
        setBookingLoading(false);
      }
    },
    [selectedSlotId, paymentInfo]
  );

  return (
    <div className="slot-booking-sync">
      {loadingSlots && <p>Loading available slots...</p>}
      {slotsError && <p className="error">{slotsError}</p>}
      {!loadingSlots && !slotsError && (
        <form onSubmit={handleBooking}>
          <fieldset disabled={bookingLoading}>
            <legend>Select a slot</legend>
            {slots.length === 0 && <p>No slots available</p>}
            {slots.map(slot => (
              <label key={slot.id}>
                <input
                  type="radio"
                  name="slot"
                  value={String(slot.id)}
                  checked={selectedSlotId === String(slot.id)}
                  onChange={handleSlotSelect}
                />
                {slot.startTime} - {slot.endTime}
              </label>
            ))}
          </fieldset>
          <fieldset disabled={bookingLoading}>
            <legend>Payment Information</legend>
            <div>
              <label htmlFor="cardNumber">Card Number</label>
              <input
                type="tel"
                id="cardNumber"
                name="cardNumber"
                value={paymentInfo.cardNumber}
                onChange={handlePaymentChange}
                placeholder="1234 5678 9012 3456"
                pattern="\d{4}\s?\d{4}\s?\d{4}\s?\d{4}"
                title="Enter a valid 16-digit card number"
                maxLength={19}
                required
              />
            </div>
            <div>
              <label htmlFor="expiry">Expiry (MM/YY)</label>
              <input
                type="tel"
                id="expiry"
                name="expiry"
                value={paymentInfo.expiry}
                onChange={handlePaymentChange}
                placeholder="MM/YY"
                pattern="^(0[1-9]|1[0-2])\/\d{2}$"
                title="Enter expiry in MM/YY format"
                maxLength={5}
                required
              />
            </div>
            <div>
              <label htmlFor="cvc">CVC</label>
              <input
                type="tel"
                id="cvc"
                name="cvc"
                value={paymentInfo.cvc}
                onChange={handlePaymentChange}
                placeholder="123"
                pattern="\d{3,4}"
                title="Enter a 3 or 4 digit CVC"
                maxLength={4}
                required
              />
            </div>
          </fieldset>
          {bookingError && <p className="error">{bookingError}</p>}
          {bookingSuccess && <p className="success">Booking successful!</p>}
          <button type="submit" disabled={bookingLoading}>
            {bookingLoading ? 'Booking...' : 'Book Slot'}
          </button>
        </form>
      )}
    </div>
  );
};

export default SlotBookingSync;