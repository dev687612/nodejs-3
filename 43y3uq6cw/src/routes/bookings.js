const express = require('express');
const router = express.Router();

const LOCK_TIMEOUT = 60 * 1000;

const seats = {
    '1': { status: 'available' },
    '2': { status: 'available' },
    '3': { status: 'available' },
    '4': { status: 'available' },
    '5': { status: 'available' }
};

router.get('/seats', (req, res) => {
    res.status(200).json(seats);
});

router.post('/lock/:seatId', (req, res) => {
    const { seatId } = req.params;
    const seat = seats[seatId];

    if (!seat) {
        return res.status(404).json({ message: 'Seat not found' });
    }

    const isLockedAndValid = seat.status === 'locked' && seat.lockExpiresAt > Date.now();

    if (seat.status === 'booked' || isLockedAndValid) {
        return res.status(400).json({ message: 'Seat is not available for locking' });
    }

    seat.status = 'locked';
    seat.lockExpiresAt = Date.now() + LOCK_TIMEOUT;

    setTimeout(() => {
        if (seats[seatId].status === 'locked' && seats[seatId].lockExpiresAt <= Date.now()) {
            seats[seatId].status = 'available';
            delete seats[seatId].lockExpiresAt;
        }
    }, LOCK_TIMEOUT);

    res.status(200).json({ message: `Seat ${seatId} locked successfully. Confirm within 1 minute.` });
});

router.post('/confirm/:seatId', (req, res) => {
    const { seatId } = req.params;
    const seat = seats[seatId];

    if (!seat) {
        return res.status(404).json({ message: 'Seat not found' });
    }

    if (seat.status !== 'locked' || seat.lockExpiresAt <= Date.now()) {
        if (seat.lockExpiresAt <= Date.now()) {
             seat.status = 'available';
             delete seat.lockExpiresAt;
        }
        return res.status(400).json({ message: 'Seat is not locked and cannot be booked' });
    }

    seat.status = 'booked';
    delete seat.lockExpiresAt;

    res.status(200).json({ message: `Seat ${seatId} booked successfully!` });
});

module.exports = router;