// Lunar to Gregorian conversion logic
class LunarCalendar {
    constructor() {
        // Lunar calendar data from 1900 to 2100
        // Each number encodes: leap month, leap month days, and days for each month
        this.lunarInfo = [
            0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
            0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
            0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
            0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
            0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
            0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
            0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
            0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
            0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
            0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
            0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
            0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
            0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
            0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
            0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
            0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
            0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
            0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
            0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
            0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,
            0x0d520
        ];
        
        this.solarMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        this.minYear = 1900;
        this.maxYear = 2100;
    }
    
    // Get leap month for a lunar year (0 means no leap month)
    leapMonth(year) {
        return this.lunarInfo[year - this.minYear] & 0xf;
    }
    
    // Get days in leap month for a lunar year
    leapDays(year) {
        if (this.leapMonth(year)) {
            return (this.lunarInfo[year - this.minYear] & 0x10000) ? 30 : 29;
        }
        return 0;
    }
    
    // Get total days in a lunar year
    yearDays(year) {
        let sum = 348;
        for (let i = 0x8000; i > 0x8; i >>= 1) {
            sum += (this.lunarInfo[year - this.minYear] & i) ? 1 : 0;
        }
        return sum + this.leapDays(year);
    }
    
    // Get days in a lunar month
    monthDays(year, month) {
        if (month > 12 || month < 1) return -1;
        return (this.lunarInfo[year - this.minYear] & (0x10000 >> month)) ? 30 : 29;
    }
    
    // Convert lunar date to solar date
    toSolar(year, month, day, isLeapMonth) {
        if (year < this.minYear || year > this.maxYear) {
            throw new Error(`Year must be between ${this.minYear} and ${this.maxYear}`);
        }
        
        const leapMonthNum = this.leapMonth(year);
        
        if (isLeapMonth && leapMonthNum !== month) {
            throw new Error('This year does not have a leap month for the specified month');
        }
        
        // Calculate offset days from 1900/1/31 (Lunar New Year of 1900)
        let offset = 0;
        
        // Add days for years
        for (let i = this.minYear; i < year; i++) {
            offset += this.yearDays(i);
        }
        
        // Add days for months
        for (let i = 1; i < month; i++) {
            offset += this.monthDays(year, i);
            if (i === leapMonthNum) {
                offset += this.leapDays(year);
            }
        }
        
        // If it's a leap month, add days of the regular month
        if (isLeapMonth && month === leapMonthNum) {
            offset += this.monthDays(year, month);
        }
        
        // Add the day
        offset += day - 1;
        
        // Solar date of 1900/1/31 is the base
        const baseDate = new Date(1900, 0, 31);
        const solarDate = new Date(baseDate.getTime() + offset * 24 * 60 * 60 * 1000);
        
        return solarDate;
    }
}

// ICS file generation
class ICSGenerator {
    constructor() {
        this.events = [];
    }
    
    addEvent(eventName, date) {
        const event = {
            name: eventName,
            date: date
        };
        this.events.push(event);
    }
    
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    }
    
    generateUID() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    generate() {
        let icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Lunar Calendar Converter//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH'
        ];
        
        this.events.forEach(event => {
            const uid = this.generateUID();
            const dateStr = this.formatDate(event.date);
            
            icsContent.push('BEGIN:VEVENT');
            icsContent.push(`UID:${uid}@lunar-converter`);
            icsContent.push(`DTSTART;VALUE=DATE:${dateStr}`);
            icsContent.push(`DTEND;VALUE=DATE:${dateStr}`);
            icsContent.push(`SUMMARY:${event.name}`);
            icsContent.push(`DESCRIPTION:Lunar calendar event`);
            icsContent.push('END:VEVENT');
        });
        
        icsContent.push('END:VCALENDAR');
        
        return icsContent.join('\r\n');
    }
    
    download(filename) {
        const icsContent = this.generate();
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }
}

// Main application logic
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('lunarForm');
    const repeatTypeSelect = document.getElementById('repeatType');
    const repeatYearsGroup = document.getElementById('repeatYearsGroup');
    
    // Show/hide repeat years input based on repeat type
    repeatTypeSelect.addEventListener('change', function() {
        if (this.value === 'yearly') {
            repeatYearsGroup.style.display = 'block';
        } else {
            repeatYearsGroup.style.display = 'none';
        }
    });
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const eventName = document.getElementById('eventName').value;
        const lunarYear = parseInt(document.getElementById('lunarYear').value);
        const lunarMonth = parseInt(document.getElementById('lunarMonth').value);
        const lunarDay = parseInt(document.getElementById('lunarDay').value);
        const isLeapMonth = document.getElementById('isLeapMonth').checked;
        const repeatType = document.getElementById('repeatType').value;
        const repeatYears = parseInt(document.getElementById('repeatYears').value) || 1;
        
        const lunar = new LunarCalendar();
        const icsGen = new ICSGenerator();
        
        try {
            if (repeatType === 'yearly') {
                for (let i = 0; i < repeatYears; i++) {
                    const targetYear = lunarYear + i;
                    if (targetYear <= lunar.maxYear) {
                        // Check if the leap month exists for this year
                        const hasLeapMonth = isLeapMonth && lunar.leapMonth(targetYear) === lunarMonth;
                        const solarDate = lunar.toSolar(targetYear, lunarMonth, lunarDay, hasLeapMonth);
                        icsGen.addEvent(eventName, solarDate);
                    }
                }
            } else {
                const solarDate = lunar.toSolar(lunarYear, lunarMonth, lunarDay, isLeapMonth);
                icsGen.addEvent(eventName, solarDate);
            }
            
            const filename = `${eventName.replace(/[^a-z0-9]/gi, '_')}_lunar_dates.ics`;
            icsGen.download(filename);
            
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
});