import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

import {
  useDoctor,
  useBookAppointment,
  usePayAppointment,
} from '../hooks/useApi';

import BookingCalendar from '../components/BookingCalendar';
import {
  GlassCard,
  Button,
  InfoRow,
  FormInput,
  Spinner,
  Modal,
} from '../components/ui/ui';

import toast from 'react-hot-toast';

export default function BookingPage() {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const { data: doctor, isLoading } = useDoctor(doctorId);
  const { mutateAsync: bookAppt } = useBookAppointment();
  const { mutateAsync: payAppt } = usePayAppointment();

  const [step, setStep] = useState(2);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [patientName, setPatientName] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmedAppt, setConfirmedAppt] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const formatCard = (v) =>
    v.replace(/\D/g, '').substring(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const goNext = () => {
    if (step === 2 && (!selectedDate || !selectedSlot)) {
      toast.error('Select date & time');
      return;
    }
    setStep((s) => s + 1);
  };

  const handlePay = async () => {
    const digits = cardNum.replace(/\s/g, '');
    if (digits.length !== 16) {
      toast.error('Invalid card');
      return;
    }

    try {
      setLoading(true);

      const appt = await bookAppt({
        doctorId: doctor._id,
        appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
        timeSlot: { start: selectedSlot },
      });

      const paid = await payAppt({
        appointmentId: appt._id,
      });

      setConfirmedAppt(paid);
      setShowConfirmModal(true);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-40">
        <Spinner />
      </div>
    );

  return (
    <div className="p-6">

      {/* STEP 2 */}
      {step === 2 && doctor && (
        <>
          <BookingCalendar
            doctorId={doctor._id}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
          />

          <Button onClick={goNext} className="w-full mt-4">
            Continue
          </Button>
        </>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <>
          <GlassCard className="p-4">
            <FormInput
              label="Name"
              value={patientName}
              onChange={setPatientName}
            />

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason"
              className="w-full mt-2 bg-white/5"
            />
          </GlassCard>

          <Button onClick={goNext} className="mt-4">
            Payment →
          </Button>
        </>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <>
          <GlassCard className="p-4">
            <FormInput
              label="Card"
              value={cardNum}
              onChange={(v) => setCardNum(formatCard(v))}
            />
          </GlassCard>

          <Button onClick={handlePay} loading={loading}>
            Pay & Confirm
          </Button>
        </>
      )}

      {/* MODAL */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => navigate('/dashboard')}
      >
        <h2>✅ Booked!</h2>
        <Button onClick={() => navigate('/dashboard')}>
          Go Dashboard
        </Button>
      </Modal>
    </div>
  );
}