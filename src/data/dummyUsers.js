import { format, subDays } from 'date-fns';

const today = new Date();

export const dummyUsers = [
  {
    id: 'u1',
    name: 'Rajesh Sharma',
    mobile: '+91 9876543210',
    location: 'Biaora, Madhya Pradesh 465674',
    flat: 'Flat 101, Om Sai Residency',
    orders: {
      [format(today, 'yyyy-MM-dd')]: { milk: 2, ghee: 0, chach: 1 },
      [format(subDays(today, 1), 'yyyy-MM-dd')]: { milk: 1, ghee: 1, chach: 0 },
      [format(subDays(today, 3), 'yyyy-MM-dd')]: { milk: 2, ghee: 0, chach: 2 },
    }
  },
  {
    id: 'u2',
    name: 'Suresh Verma',
    mobile: '+91 8765432109',
    location: 'Biaora, Madhya Pradesh 465674',
    flat: 'House No 45, Rajgarh Road',
    orders: {
      [format(today, 'yyyy-MM-dd')]: { milk: 1, ghee: 0, chach: 0 },
      [format(subDays(today, 2), 'yyyy-MM-dd')]: { milk: 3, ghee: 0, chach: 1 },
    }
  },
  {
    id: 'u3',
    name: 'Amit Patel',
    mobile: '+91 7654321098',
    location: 'Biaora, Madhya Pradesh 465674',
    flat: 'Flat 304, Green View Apartments',
    orders: {
      [format(subDays(today, 1), 'yyyy-MM-dd')]: { milk: 0, ghee: 2, chach: 0 },
      [format(subDays(today, 4), 'yyyy-MM-dd')]: { milk: 1, ghee: 0, chach: 0 },
    }
  },
  {
    id: 'u4',
    name: 'Vikram Singh',
    mobile: '+91 6543210987',
    location: 'Biaora, Madhya Pradesh 465674',
    flat: 'Bungalow 7, Civil Lines',
    orders: {
      [format(today, 'yyyy-MM-dd')]: { milk: 5, ghee: 1, chach: 5 },
      [format(subDays(today, 5), 'yyyy-MM-dd')]: { milk: 4, ghee: 0, chach: 2 },
    }
  }
];
