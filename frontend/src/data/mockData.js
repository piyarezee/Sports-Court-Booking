// Temporary mock data (Phase 3 mein Google Sheets se aayega)

export const courts = [
  {
    id: '1',
    name: 'Court A - Indoor',
    type: 'Badminton',
    location: 'Main Building, 1st Floor',
    pricePerHour: 800,
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&h=400&fit=crop',
    description: 'Premium indoor badminton court with wooden flooring and LED lighting.',
    amenities: ['AC', 'Wooden Floor', 'LED Lights', 'Changing Room'],
    isActive: true
  },
  {
    id: '2',
    name: 'Court B - Outdoor',
    type: 'Tennis',
    location: 'Outdoor Area',
    pricePerHour: 1200,
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&h=400&fit=crop',
    description: 'Professional outdoor tennis court with synthetic surface.',
    amenities: ['Synthetic Surface', 'Flood Lights', 'Seating Area'],
    isActive: true
  },
  {
    id: '3',
    name: 'Court C - Indoor',
    type: 'Squash',
    location: 'Main Building, 2nd Floor',
    pricePerHour: 600,
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&h=400&fit=crop',
    description: 'Standard squash court with glass back wall.',
    amenities: ['Glass Wall', 'AC', 'Locker'],
    isActive: true
  },
  {
    id: '4',
    name: 'Court D - Multi',
    type: 'Basketball',
    location: 'Sports Complex',
    pricePerHour: 1500,
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=400&fit=crop',
    description: 'Full-size basketball court with professional flooring.',
    amenities: ['Wooden Floor', 'Scoreboard', 'Bleachers', 'AC'],
    isActive: true
  }
];

// Generate time slots (8 AM to 10 PM)
export const generateSlots = (date) => {
  const slots = [];
  for (let hour = 8; hour <= 21; hour++) {
    const start = `${hour.toString().padStart(2, '0')}:00`;
    const end = `${(hour + 1).toString().padStart(2, '0')}:00`;
    // Randomly mark some as booked for demo
    const isBooked = Math.random() > 0.7;
    slots.push({
      id: `${date}-${start}`,
      start,
      end,
      label: `${start} - ${end}`,
      isBooked,
      price: null // will be set from court
    });
  }
  return slots;
};
