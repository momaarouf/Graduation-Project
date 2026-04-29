/**
 * Returns a time-appropriate greeting based on the current local hour.
 * 
 * 5:00 - 11:59: Good Morning
 * 12:00 - 17:59: Good Afternoon
 * 18:00 - 04:59: Good Evening
 */
export const getGreeting = (): string => {
 const hour = new Date().getHours();
 
 if (hour >= 5 && hour < 12) {
 return 'Good Morning';
 } else if (hour >= 12 && hour < 18) {
 return 'Good Afternoon';
 } else {
 return 'Good Evening';
 }
};
