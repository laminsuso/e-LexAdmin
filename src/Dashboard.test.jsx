import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Dashboard from './Dashboard';
import axios from 'axios';
import { toast } from 'react-toastify';


vi.mock('axios');

vi.mock('react-router-dom', () => ({
  Link: ({ children }) => <a>{children}</a>, 
  useLocation: () => ({ search: '' }),
}));
vi.mock('react-toastify', () => ({
  ToastContainer: () => <div data-testid="toast-container"></div>,
  toast: { error: vi.fn(), success: vi.fn() },
}));


const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Dashboard Component', () => {
  const mockSchedules = [
    {
      _id: '1',
      eventName: 'Community Cleanup',
      date: '2024-03-07 10:00 AM',
      location: 'City Park',
      maxVolunteers: '20'
    },
    {
      _id: '2',
      eventName: 'Library Assistant',
      date: '2024-03-08 02:00 PM',
      location: 'Public Library',
      maxVolunteers: '15'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('mock-token');
    axios.get.mockResolvedValue({ data: { schedules: mockSchedules } });
  });

  test('renders dashboard with schedules', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Volunteer Schedule Manager')).toBeInTheDocument();
      expect(screen.getByText('Community Cleanup')).toBeInTheDocument();
      expect(screen.getByText('Library Assistant')).toBeInTheDocument();
    });
  });

  test('opens and closes event creation modal', async () => {
    render(<Dashboard />);
    
    fireEvent.click(screen.getByText('Create New Event'));
    expect(screen.getByText('New Volunteer Event')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Close modal'));
    await waitFor(() => {
      expect(screen.queryByText('New Volunteer Event')).not.toBeInTheDocument();
    });
  });

  test('creates new event successfully', async () => {
    const newEvent = {
      _id: '3',
      eventName: 'New Event',
      date: '2024-03-09 09:00 AM',
      location: 'Test Location',
      maxVolunteers: '10'
    };
    
    axios.post.mockResolvedValue({ 
      data: { 
        message: 'Event created',
        scheduleId: '3' 
      } 
    });

    render(<Dashboard />);
    
    fireEvent.click(screen.getByText('Create New Event'));
    

    fireEvent.change(screen.getByLabelText('Event Name'), { 
      target: { value: 'New Event' } 
    });
    fireEvent.change(screen.getByLabelText('Date & Time'), {
      target: { value: '2024-03-09T09:00' }
    });
    fireEvent.change(screen.getByLabelText('Max Volunteers'), {
      target: { value: '10' }
    });
    fireEvent.change(screen.getByLabelText('Location'), {
      target: { value: 'Test Location' }
    });


    fireEvent.click(screen.getByText('Create Event'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Event created', { containerId: 'dashboard' });
    });
  });

  test('deletes schedule successfully', async () => {
    axios.delete.mockResolvedValue({});
    
    render(<Dashboard />);
    
   
    await waitFor(async () => {
      const deleteButtons = await screen.findAllByLabelText('Delete schedule');
      fireEvent.click(deleteButtons[0]);
    });
  
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        expect.stringContaining('/api/schedules/1'),
        expect.any(Object)
      );
      expect(toast.success).toHaveBeenCalledWith(
        'Schedule deleted successfully',
        { containerId: 'dashboard' }
      );
    });
  });

  test('handles API errors', async () => {
    const errorMessage = 'Network Error';
    axios.get.mockRejectedValue({ 
      response: { 
        data: { 
          error: errorMessage 
        } 
      } 
    });
    
    render(<Dashboard />);
  
  
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        errorMessage, 
        { containerId: 'dashboard' }
      );
    }, { timeout: 2000 }); 
  });

  test('paginates schedules correctly', async () => {
    const manySchedules = Array.from({ length: 10 }, (_, i) => ({
      _id: String(i),
      eventName: `Event ${i + 1}`,
      date: '2024-03-07 10:00 AM',
      location: 'Location',
      maxVolunteers: '10'
    }));
  
    axios.get.mockResolvedValue({ data: { schedules: manySchedules }});
  
    render(<Dashboard />);
  
   
    await waitFor(() => {
      expect(screen.getByText('Event 1')).toBeInTheDocument();
    });
  
   
    const paginationText = await screen.findByTestId('pagination-text');
    expect(paginationText).toHaveTextContent('Showing 1 to 2 of 10 events');
  
  
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);
  
   
    await waitFor(() => {
      expect(paginationText).toHaveTextContent('Showing 3 to 4 of 10 events');
    });
  });
});