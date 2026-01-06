export interface Holiday {
  date: string; // YYYY-MM-DD
  name: { [key: string]: string };
}

export type CountryCode = 'France' | 'Tunisia' | 'Egypt';

const HOLIDAYS: Record<CountryCode, Holiday[]> = {
  France: [
    { date: '2025-01-01', name: { en: 'New Year', fr: 'Jour de l’an' } },
    {
      date: '2025-04-21',
      name: { en: 'Easter Monday', fr: 'Lundi de Pâques' },
    },
    { date: '2025-05-01', name: { en: 'Labor Day', fr: 'Fête du Travail' } },
    { date: '2025-05-08', name: { en: 'Victory Day', fr: 'Victoire 1945' } },
    { date: '2025-05-29', name: { en: 'Ascension Day', fr: 'Ascension' } },
    {
      date: '2025-06-09',
      name: { en: 'Whit Monday', fr: 'Lundi de Pentecôte' },
    },
    { date: '2025-07-14', name: { en: 'Bastille Day', fr: 'Fête Nationale' } },
    { date: '2025-08-15', name: { en: 'Assumption Day', fr: 'Assomption' } },
    { date: '2025-11-01', name: { en: 'All Saints Day', fr: 'Toussaint' } },
    { date: '2025-11-11', name: { en: 'Armistice Day', fr: 'Armistice' } },
    { date: '2025-12-25', name: { en: 'Christmas', fr: 'Noël' } },
  ],
  Tunisia: [
    { date: '2025-01-01', name: { en: 'New Year', fr: 'Jour de l’an' } },
    {
      date: '2025-01-14',
      name: { en: 'Revolution Day', fr: 'Fête de la Révolution' },
    },
    {
      date: '2025-03-20',
      name: { en: 'Independence Day', fr: 'Fête de l’Indépendance' },
    },
    { date: '2025-03-30', name: { en: 'Eid al-Fitr', fr: 'Aïd al-Fitr' } },
    {
      date: '2025-03-31',
      name: { en: 'Eid al-Fitr Holiday', fr: 'Congé Aïd al-Fitr' },
    },
    { date: '2025-04-09', name: { en: 'Martyrs Day', fr: 'Fête des Martyrs' } },
    { date: '2025-05-01', name: { en: 'Labor Day', fr: 'Fête du Travail' } },
    { date: '2025-06-06', name: { en: 'Eid al-Adha', fr: 'Aïd al-Adha' } },
    {
      date: '2025-06-07',
      name: { en: 'Eid al-Adha Holiday', fr: 'Congé Aïd al-Adha' },
    },
    {
      date: '2025-07-25',
      name: { en: 'Republic Day', fr: 'Fête de la République' },
    },
    { date: '2025-08-13', name: { en: 'Women Day', fr: 'Fête de la Femme' } },
    {
      date: '2025-10-15',
      name: { en: 'Evacuation Day', fr: 'Fête de l’Évacuation' },
    },
    {
      date: '2025-12-17',
      name: { en: 'Revolution Day (Dec)', fr: 'Fête de la Révolution' },
    },
  ],
  Egypt: [
    { date: '2025-01-07', name: { en: 'Coptic Christmas', fr: 'Noël Copte' } },
    {
      date: '2025-01-25',
      name: { en: 'Revolution Day', fr: 'Fête de la Révolution' },
    },
    { date: '2025-03-31', name: { en: 'Eid al-Fitr', fr: 'Aïd al-Fitr' } },
    { date: '2025-04-20', name: { en: 'Easter (Coptic)', fr: 'Pâques Copte' } },
    {
      date: '2025-04-21',
      name: { en: 'Sham El Nessim', fr: 'Cham El Nessim' },
    },
    {
      date: '2025-04-25',
      name: { en: 'Sinai Liberation Day', fr: 'Libération du Sinaï' },
    },
    { date: '2025-05-01', name: { en: 'Labor Day', fr: 'Fête du Travail' } },
    { date: '2025-06-07', name: { en: 'Eid al-Adha', fr: 'Aïd al-Adha' } },
    {
      date: '2025-06-30',
      name: { en: 'June 30 Revolution', fr: 'Révolution du 30 juin' },
    },
    {
      date: '2025-07-23',
      name: { en: 'Revolution Day', fr: 'Fête de la Révolution' },
    },
    {
      date: '2025-10-06',
      name: { en: 'Armed Forces Day', fr: 'Fête des Forces Armées' },
    },
  ],
};

export const holidaysService = {
  getHolidaysForCountry: (country: string): Holiday[] => {
    return HOLIDAYS[country as CountryCode] || [];
  },

  isWeekend: (date: Date, country?: string): boolean => {
    const day = date.getDay(); // 0 (Sun) to 6 (Sat)
    if (country === 'Egypt') {
      // User specifically asked for Thursday/Friday for Egypt
      return day === 4 || day === 5;
    }
    // Default: Saturday (6) and Sunday (0)
    return day === 0 || day === 6;
  },

  getHolidayOnDate: (dateStr: string, country: string): Holiday | undefined => {
    const holidays = HOLIDAYS[country as CountryCode] || [];
    return holidays.find(h => h.date === dateStr);
  },
};
