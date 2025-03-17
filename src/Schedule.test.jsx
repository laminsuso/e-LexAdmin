import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Schedule from './Schedule';
import axios from 'axios';
import { toast } from 'react-toastify';


vi.mock('react-router-dom', () => ({
  useLocation: () => ({
    search: '?id=123'
  }),
  MemoryRouter: ({ children }) => <div>{children}</div>,
  Link: () => null,
}));


vi.mock('react-toastify', () => ({
  ToastContainer: () => <div data-testid="toast-container"></div>,
  toast: { error: vi.fn() },
}));


vi.mock('axios');

describe('Schedule Component', () => {
  const mockSchedule = {
    _id: '123',
    eventName: 'Community Cleanup',
    date: '2024-03-07T10:00:00Z',
    registeredBy: ['user1', 'user2'],
    location: 'City Park',
    maxVolunteers: '20',
  };

  beforeEach(() => {

    vi.clearAllMocks();
    vi.spyOn(localStorage, 'getItem').mockReturnValue('mock-token');


  });

  test('renders schedule data correctly', async () => {
    axios.get.mockResolvedValueOnce({ data: { schedule: mockSchedule } });
  
    render(<Schedule />);
  
    await waitFor(() => {
      expect(screen.getByText('Volunteer Assignments')).toBeInTheDocument();
      expect(screen.getByText('Community Cleanup')).toBeInTheDocument();
  
      expect(screen.getByText(/Registered By:/i).closest('div')).toHaveTextContent('2');
      const formattedDate = new Date(mockSchedule.date).toDateString(); 
      expect(screen.getByTestId('schedule-date')).toHaveTextContent(formattedDate);
    });
  });
  

  test('handles API error', async () => {
    axios.get.mockRejectedValueOnce({
      response: { data: { error: 'Not found' } },
    });
  
    render(<Schedule />);
  
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Not found', { containerId: 'schedule' });
    });
  });
});