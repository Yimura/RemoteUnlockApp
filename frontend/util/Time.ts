import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');

export function GetTimeAgo(date: Date): string {
    return timeAgo.format(date, 'round-minute');
}
