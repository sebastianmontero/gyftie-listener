const DateDiff = require('date-diff');

const baseDate = new Date('1970-01-01');

class TimeUtil {

    static dayDiff(date1, date2) {
        const diff = new DateDiff(date1, date2);
        return diff.days();
    }

    static daysInYear(year) {
        return TimeUtil.dayDiff(new Date(year + 1, 0, 1), new Date(year, 0, 1));
    }

    static quarterId(year, quarter) {
        return parseInt(`${year}${quarter}`);
    }

    static quarterIdFromDate(date) {
        return TimeUtil.quarterId(date.getUTCFullYear(), Math.ceil((date.getUTCMonth() + 1) / 3));
    }
    static toUTCDate(dayDate) {
        return new Date(Date.UTC(dayDate.getUTCFullYear(), dayDate.getUTCMonth(), dayDate.getUTCDate()));
    }

    static fromUnixTimestamp(timestamp) {
        return new Date(timestamp * 1000);
    }

    static toUnixTimestamp(date) {
        date = date || new Date();
        return Math.floor(date / 1000);
    }

    static secondsDiff(date1, date2) {
        return TimeUtil.toUnixTimestamp(date1) - TimeUtil.toUnixTimestamp(date2);
    }

    static addDays(date, days) {
        let newDate = new Date(date);
        newDate.setDate(newDate.getDate() + days);
        return newDate;
    }

    static dayId(dayDate) {
        if (!dayDate) {
            dayDate = new Date();
        }
        return TimeUtil.dayDiff(this.toUTCDate(dayDate), baseDate);
    }

    static lmDayId(date) {
        const ldPrevMonth = new Date(date.getUTCFullYear(), date.getUTCMonth(), 0);
        const lmDate = ldPrevMonth.getUTCDate() <= date.getUTCDate() ? ldPrevMonth : new Date(date.getUTCFullYear(), date.getUTCMonth() - 1, date.getUTCDate());
        return TimeUtil.dayId(lmDate);
    }

    static lyDayId(date) {
        const ldPrevYear = new Date(date.getUTCFullYear() - 1, date.getUTCMonth() + 1, 0);
        const lmDate = ldPrevYear.getUTCDate() <= date.getUTCDate() ? ldPrevYear : new Date(date.getUTCFullYear() - 1, date.getUTCMonth(), date.getUTCDate());
        return TimeUtil.dayId(lmDate);
    }

    static monthId(year, month) {
        return parseInt(`${year}${month < 10 ? '0' : ''}${month}`);
    }

    static monthIdFromDate(date) {
        return TimeUtil.monthId(date.getUTCFullYear(), date.getUTCMonth() + 1);
    }

    static _zeroPad(value) {
        return (value < 10 ? '0' : '') + value;
    }

    static toUTCDateString(date) {
        return `${this._zeroPad(date.getUTCFullYear())}-${this._zeroPad(date.getUTCMonth() + 1)}-${this._zeroPad(date.getUTCDate())}`;
    }

    static toUTCDateTimeNTZString(date) {
        return this.toUTCDateString(date) + ` ${this._zeroPad(date.getUTCHours())}:${this._zeroPad(date.getUTCMinutes())}:${this._zeroPad(date.getUTCSeconds())}.${date.getUTCMilliseconds()}`
    }

    static toUTCDateFromNTZString(dateString) {
        return new Date(dateString + 'Z');
    }

    static toUTCMidday(date) {
        let newDate = new Date(date);
        newDate.setUTCHours(12, 0, 0, 0);
        return newDate;
    }
}

module.exports = TimeUtil;