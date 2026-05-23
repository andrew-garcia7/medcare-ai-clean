import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';


// ================= DOCTORS =================
export const useDoctors = (filters = {}) =>
  useQuery({
    queryKey: ['doctors', filters],
    queryFn: async () => {
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
      );
      const { data } = await api.get(`/doctors?${params}`);
      return data;
    },
  });

export const useDoctor = (id) =>
  useQuery({
    queryKey: ['doctor', id],
    queryFn: async () => {
      const { data } = await api.get(`/doctors/${id}`);
      return data.data;
    },
    enabled: !!id,
  });

export const useDoctorAvailability = (doctorId, date) =>
  useQuery({
    queryKey: ['availability', doctorId, date],
    queryFn: async () => {
      const { data } = await api.get(`/doctors/${doctorId}/availability?date=${date}`);
      return data.data;
    },
    enabled: !!doctorId && !!date,
  });

export const useAddReview = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ doctorId, rating, comment }) => {
      const { data } = await api.post(`/doctors/${doctorId}/reviews`, {
        rating,
        comment,
      });
      return data;
    },

    onSuccess: (_, { doctorId }) => {
      qc.invalidateQueries({ queryKey: ['doctor', doctorId] });
      toast.success('Review submitted!');
    },

    onError: (err) => toast.error(err.message),
  });
};


// ================= APPOINTMENTS =================
export const useMyAppointments = (filters = {}) =>
  useQuery({
    queryKey: ['my-appointments', filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.status) params.set('status', filters.status);
      if (filters.upcoming) params.set('upcoming', 'true');

      const { data } = await api.get(`/appointments/my?${params}`);
      return data.data;
    },
  });

export const useBookAppointment = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/appointments', payload);
      return data.data;
    },

    onSuccess: (appt) => {
      qc.invalidateQueries({ queryKey: ['my-appointments'] });
      toast.success(`Appointment booked! Ref: ${appt.referenceNumber}`);
    },

    onError: (err) => toast.error(err.message),
  });
};

export const usePayAppointment = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ appointmentId, method }) => {
      const { data } = await api.post(`/appointments/${appointmentId}/pay`, {
        method,
      });
      return data.data;
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-appointments'] });
      toast.success('Payment successful!');
    },

    onError: (err) => toast.error(err.message),
  });
};

export const useCancelAppointment = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }) => {
      const { data } = await api.put(`/appointments/${id}/cancel`, {
        reason,
      });
      return data;
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-appointments'] });
      toast.success('Appointment cancelled');
    },

    onError: (err) => toast.error(err.message),
  });
};


// ================= DASHBOARD =================
export const useDashboard = () =>
  useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/patients/dashboard');
      return data.data;
    },
  });

export const usePrescriptions = () =>
  useQuery({
    queryKey: ['prescriptions'],
    queryFn: async () => {
      const { data } = await api.get('/patients/prescriptions');
      return data.data;
    },
  });

export const useMedicalRecords = (type) =>
  useQuery({
    queryKey: ['records', type],
    queryFn: async () => {
      const { data } = await api.get(`/patients/records${type ? `?type=${type}` : ''}`);
      return data.data;
    },
  });


// ================= AMBULANCE =================
export const useRequestAmbulance = () =>
  useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/ambulance/request', payload);
      return data.data;
    },
    onError: (err) => toast.error(err.message),
  });

export const useTrackAmbulance = (referenceId, enabled) =>
  useQuery({
    queryKey: ['ambulance-track', referenceId],
    queryFn: async () => {
      const { data } = await api.get(`/ambulance/${referenceId}/track`);
      return data.data;
    },
    enabled: enabled && !!referenceId,
    refetchInterval: 15000,
  });

export const useNearestHospitals = (lat, lng) =>
  useQuery({
    queryKey: ['nearest-hospitals', lat, lng],
    queryFn: async () => {
      const { data } = await api.get(`/ambulance/hospitals/nearest?lat=${lat}&lng=${lng}`);
      return data.data;
    },
    enabled: !!lat && !!lng,
  });


// ================= PROFILE =================
export const useUpdateProfile = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (updates) => {
      const { data } = await api.put('/auth/me', updates);
      return data.data;
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
      toast.success('Profile updated!');
    },

    onError: (err) => toast.error(err.message),
  });
};

export const useUploadAvatar = () =>
  useMutation({
    mutationFn: async (file) => {
      const form = new FormData();
      form.append('avatar', file);

      const { data } = await api.post('/upload/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return data.data;
    },

    onSuccess: () => toast.success('Photo updated!'),
    onError: (err) => toast.error(err.message),
  });