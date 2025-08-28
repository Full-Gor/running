export interface Record {
  distance: string;
  athlete: string;
  country: string;
  time: string;
  location: string;
  year: string;
}

export interface PersonalRecord {
  distance: string;
  time: string;
  date: string;
  location?: string;
}

// Records du monde masculins
export const worldRecordsMen: Record[] = [
  {
    distance: "100m",
    athlete: "Usain Bolt",
    country: "Jamaïque",
    time: "9.58",
    location: "Berlin",
    year: "2009"
  },
  {
    distance: "400m",
    athlete: "Wayde van Niekerk",
    country: "Afrique du Sud",
    time: "43.03",
    location: "Rio de Janeiro",
    year: "2016"
  },
  {
    distance: "800m",
    athlete: "David Rudisha",
    country: "Kenya",
    time: "1:40.91",
    location: "Londres",
    year: "2012"
  }
];

// Records du monde féminins
export const worldRecordsWomen: Record[] = [
  {
    distance: "100m",
    athlete: "Florence Griffith-Joyner",
    country: "USA",
    time: "10.49",
    location: "Indianapolis",
    year: "1988"
  },
  {
    distance: "400m",
    athlete: "Marita Koch",
    country: "Allemagne de l'Est",
    time: "47.60",
    location: "Canberra",
    year: "1985"
  },
  {
    distance: "800m",
    athlete: "Jarmila Kratochvílová",
    country: "Tchécoslovaquie",
    time: "1:53.28",
    location: "Munich",
    year: "1983"
  }
];

// Records d'Europe masculins
export const europeanRecordsMen: Record[] = [
  {
    distance: "100m",
    athlete: "Marcell Jacobs",
    country: "Italie",
    time: "9.80",
    location: "Tokyo",
    year: "2021"
  },
  {
    distance: "400m",
    athlete: "Matthew Hudson-Smith",
    country: "Grande-Bretagne",
    time: "43.44",
    location: "Paris",
    year: "2024"
  },
  {
    distance: "800m",
    athlete: "Wilson Kipketer",
    country: "Danemark",
    time: "1:41.11",
    location: "Cologne",
    year: "1997"
  }
];

// Records d'Europe féminins
export const europeanRecordsWomen: Record[] = [
  {
    distance: "100m",
    athlete: "Christine Arron",
    country: "France",
    time: "10.73",
    location: "Budapest",
    year: "1998"
  },
  {
    distance: "400m",
    athlete: "Marita Koch",
    country: "Allemagne de l'Est",
    time: "47.60",
    location: "Canberra",
    year: "1985"
  },
  {
    distance: "800m",
    athlete: "Jarmila Kratochvílová",
    country: "Tchécoslovaquie",
    time: "1:53.28",
    location: "Munich",
    year: "1983"
  }
];

// Records de France masculins
export const frenchRecordsMen: Record[] = [
  {
    distance: "100m",
    athlete: "Jimmy Vicaut",
    country: "France",
    time: "9.86",
    location: "Montreuil / Saint-Denis",
    year: "2016 / 2015"
  },
  {
    distance: "400m",
    athlete: "Leslie Djhone",
    country: "France",
    time: "44.46",
    location: "Osaka",
    year: "2007"
  },
  {
    distance: "800m",
    athlete: "Gabriel Tual",
    country: "France",
    time: "1:41.61",
    location: "Paris",
    year: "2024"
  }
];

// Records de France féminins
export const frenchRecordsWomen: Record[] = [
  {
    distance: "100m",
    athlete: "Christine Arron",
    country: "France",
    time: "10.73",
    location: "Budapest",
    year: "1998"
  },
  {
    distance: "400m",
    athlete: "Marie-José Pérec",
    country: "France",
    time: "48.25",
    location: "Atlanta",
    year: "1996"
  },
  {
    distance: "800m",
    athlete: "Patricia Djate-Taillard",
    country: "France",
    time: "1:56.53",
    location: "Monte-Carlo",
    year: "1995"
  }
];

export const recordCategories = [
  { key: 'world', label: 'Monde', men: worldRecordsMen, women: worldRecordsWomen },
  { key: 'europe', label: 'Europe', men: europeanRecordsMen, women: europeanRecordsWomen },
  { key: 'france', label: 'France', men: frenchRecordsMen, women: frenchRecordsWomen },
];

// Fonction pour formater le temps d'affichage
export const formatTime = (time: string): string => {
  return time;
};

// Fonction pour convertir un temps en secondes pour comparaison
export const timeToSeconds = (time: string): number => {
  if (time.includes(':')) {
    const [minutes, seconds] = time.split(':');
    return parseInt(minutes) * 60 + parseFloat(seconds);
  }
  return parseFloat(time);
};

// Fonction pour formater un temps en secondes vers un affichage lisible
export const secondsToTime = (seconds: number): string => {
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(2);
    return `${minutes}:${remainingSeconds.padStart(5, '0')}`;
  }
  return seconds.toFixed(2);
};


