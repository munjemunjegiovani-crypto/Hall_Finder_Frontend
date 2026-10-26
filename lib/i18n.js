// Small dictionary for English / French. Falls back to English for any missing key.
const dict = {
  en: {
    home: 'Home', map: 'Map', timetable: 'Timetable', halls: 'Halls', profile: 'Profile', admin: 'Admin',
    navigate: 'Navigate', hallInfo: 'Hall info', search: 'Search halls, labs, teachers',
    quickLinks: 'Campus quick links', todaySchedule: "Today's schedule", studyHalls: 'Free study spaces',
    fullTimetable: 'Full timetable', signOut: 'Sign out', language: 'Language', theme: 'Appearance',
    nextClass: 'Next class', inProgress: 'In progress', notifications: 'Notifications',
  },
  fr: {
    home: 'Accueil', map: 'Carte', timetable: 'Emploi du temps', halls: 'Salles', profile: 'Profil', admin: 'Admin',
    navigate: 'Naviguer', hallInfo: 'Infos salle', search: 'Chercher salles, labos, enseignants',
    quickLinks: 'Accès rapides', todaySchedule: "Programme d'aujourd'hui", studyHalls: 'Salles libres pour étudier',
    fullTimetable: 'Emploi du temps complet', signOut: 'Se déconnecter', language: 'Langue', theme: 'Apparence',
    nextClass: 'Prochain cours', inProgress: 'En cours', notifications: 'Notifications',
  },
};
export const t = (lang, key) => dict[lang]?.[key] ?? dict.en[key] ?? key;
