import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, Plus, AlertTriangle, X, Check, Eye } from 'lucide-react';

export default function ResourceBooking() {
  const { user } = useAuth();
  const { assets, bookings, bookResource, cancelBooking } = useData();

  // Find shared bookable resources
  const sharedResources = assets.filter(a => a.shared);

  // States
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [selectedDate, setSelectedDate] = useState('2026-07-12'); // Mock today

  // Form State
  const [bookingForm, setBookingForm] = useState({
    date: '2026-07-12',
    startTime: '09:00',
    endTime: '10:00',
    purpose: '',
  });

  const [formError, setFormError] = useState('');
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelMessage, setCancelMessage] = useState('');

  // Timeline Hour list
  const hoursList = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  // Helper to retrieve active bookings for selected resource on selected date
  const resourceIdForTimeline = selectedResourceId || (sharedResources[0]?.id || '');
  const activeBookingsForDate = bookings.filter(b =>
    b.resourceId === resourceIdForTimeline &&
    b.date === selectedDate &&
    b.status !== 'Cancelled'
  );

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!resourceIdForTimeline) {
      setFormError('Please select a resource to book.');
      return;
    }

    const startVal = parseInt(bookingForm.startTime.replace(':', ''));
    const endVal = parseInt(bookingForm.endTime.replace(':', ''));

    if (startVal >= endVal) {
      setFormError('End Time must be strictly after Start Time.');
      return;
    }

    // Call state engine with conflict overlap validation
    const result = await bookResource(
      resourceIdForTimeline,
      bookingForm.date,
      bookingForm.startTime,
      bookingForm.endTime,
      bookingForm.purpose,
      user.email,
      user
    );

    if (result && result.success) {
      setBookingForm({
        date: '2026-07-12',
        startTime: '09:00',
        endTime: '10:00',
        purpose: '',
      });
      alert('Resource booked successfully!');
    } else {
      setFormError(result?.message || 'Failed to book resource.');
    }
  };

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!cancelModalBooking) return;
    await cancelBooking(cancelModalBooking.id, cancelMessage, user);
    setCancelModalBooking(null);
    setCancelMessage('');
  };

  // Find resource details
  const currentResourceDetails = assets.find(a => a.id === resourceIdForTimeline);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Resource <span className="heading-gradient">Booking</span></h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Time-slot reservation for shared spaces, vehicles, and team equipment</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', marginBottom: '2rem' }}>
        {/* Reservation Form */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 850, marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Calendar size={20} color="#a78bfa" />
            <span>Book a Time Slot</span>
          </h3>

          {formError && (
            <div
              style={{
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.35)',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                fontSize: '0.85rem',
                color: '#fda4af',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
              }}
            >
              <AlertTriangle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleBookingSubmit}>
            <div className="form-group">
              <label className="form-label">Select Resource</label>
              <select
                className="form-input"
                value={resourceIdForTimeline}
                onChange={(e) => setSelectedResourceId(e.target.value)}
              >
                {sharedResources.map((res) => (
                  <option key={res.id} value={res.id}>
                    {res.name} ({res.tag} - {res.location})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Booking Date</label>
              <input
                type="date"
                required
                className="form-input"
                value={bookingForm.date}
                onChange={(e) => {
                  setBookingForm({ ...bookingForm, date: e.target.value });
                  setSelectedDate(e.target.value);
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <select
                  className="form-input"
                  value={bookingForm.startTime}
                  onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                >
                  {hoursList.slice(0, -1).map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">End Time</label>
                <select
                  className="form-input"
                  value={bookingForm.endTime}
                  onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                >
                  {hoursList.slice(1).map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Reservation Purpose</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Design review session / HR transport"
                value={bookingForm.purpose}
                onChange={(e) => setBookingForm({ ...bookingForm, purpose: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              Confirm Booking Slot
            </button>
          </form>
        </div>

        {/* Daily Schedule Timeline View */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 850 }}>Daily Reservation Grid</h3>
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <input
                type="date"
                className="form-input"
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', width: '140px' }}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Viewing schedule for: <strong>{currentResourceDetails?.name} ({currentResourceDetails?.tag})</strong>
            </div>
          </div>

          {/* Vertical Hourly Grid */}
          <div className="timeline-grid">
            {hoursList.slice(0, -1).map((hour, idx) => {
              const nextHour = hoursList[idx + 1];

              // Check if any booking is in this hour range
              const hourNum = parseInt(hour.replace(':', ''));
              const nextHourNum = parseInt(nextHour.replace(':', ''));

              const bookingFound = activeBookingsForDate.find(b => {
                const s = parseInt(b.startTime.replace(':', ''));
                const e = parseInt(b.endTime.replace(':', ''));
                return s < nextHourNum && nextHourNum <= e;
              });

              return (
                <div key={hour} className="timeline-row">
                  <div className="timeline-label">{hour} - {nextHour}</div>
                  <div
                    className="timeline-content"
                    style={{
                      background: bookingFound ? 'rgba(139, 92, 246, 0.12)' : 'transparent',
                    }}
                  >
                    {bookingFound ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
                        <div>
                          <strong style={{ fontSize: '0.85rem', color: '#c4b5fd' }}>{bookingFound.purpose}</strong>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            Reserved by {bookingFound.user} ({bookingFound.userEmail})
                          </div>
                        </div>
                        <span style={{ fontSize: '0.68rem', background: 'rgba(139, 92, 246, 0.25)', color: '#c4b5fd', padding: '0.15rem 0.35rem', borderRadius: '4px', fontWeight: 700 }}>
                          OCCUPIED
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', display: 'flex', alignItems: 'center', height: '100%' }}>
                        Available
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bookings List Table */}
      <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 850, marginBottom: '1rem' }}>Your Active Reservations</h3>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Resource Name</th>
                <th>Reserved Date</th>
                <th>Time Window</th>
                <th>Purpose / Description</th>
                <th>Requestor</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No bookings found.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} style={{ opacity: b.status === 'Cancelled' ? 0.5 : 1 }}>
                    <td>
                      <span style={{ fontWeight: 700 }}>{b.resourceName}</span>
                    </td>
                    <td>{b.date}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                        <Clock size={13} color="var(--text-muted)" />
                        <span>{b.startTime} - {b.endTime}</span>
                      </div>
                    </td>
                    <td>"{b.purpose}"</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{b.user}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{b.userEmail}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          textTransform: 'uppercase',
                          background: b.status === 'Cancelled' ? 'rgba(239, 68, 68, 0.15)' : b.status === 'Ongoing' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                          color: b.status === 'Cancelled' ? '#fca5a5' : b.status === 'Ongoing' ? '#6ee7b7' : '#c4b5fd'
                        }}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {b.status !== 'Cancelled' && (b.userEmail === user.email || user.role === 'Admin' || user.role === 'Asset Manager') ? (
                        <button
                          onClick={() => {
                            setCancelModalBooking(b);
                            setCancelMessage('');
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', borderColor: 'rgba(244, 63, 94, 0.3)', color: '#fda4af' }}
                        >
                          Cancel Slot
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Locked</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancellation Warning & Message Modal */}
      {cancelModalBooking && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '460px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <AlertTriangle size={22} color="#f43f5e" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Cancel Reservation</h3>
              </div>
              <button
                onClick={() => setCancelModalBooking(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.35)',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                fontSize: '0.88rem',
                color: '#fca5a5'
              }}
            >
              Are you sure you want to cancel the reservation for{' '}
              <strong>{cancelModalBooking.resourceName}</strong> ({cancelModalBooking.purpose}) booked by{' '}
              <strong>{cancelModalBooking.user}</strong>?
            </div>

            <form onSubmit={handleConfirmCancel}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Reason / Message to User (Optional)</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '80px' }}
                  placeholder="e.g. Urgent executive meeting scheduled in this space. Please reschedule."
                  value={cancelMessage}
                  onChange={(e) => setCancelMessage(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setCancelModalBooking(null)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Keep Reservation
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, background: '#f43f5e', borderColor: '#f43f5e' }}
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
