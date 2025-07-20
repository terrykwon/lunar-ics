// Korean Government Lunar Calendar API
class LunarCalendarAPI {
    constructor() {
        this.serviceKey = 'yCYozLG75Hl0heyv1gwFtgPgmlDbbcoz8DQVkFslC0GmemGO5UodPqgA05jtAV3q0zF%2FuOhfKnyN1smUKvHWpg%3D%3D';
        this.baseUrl = 'https://apis.data.go.kr/B090041/openapi/service/LrsrCldInfoService/getSolCalInfo';
        // CORS proxy - you can use any public CORS proxy or run your own
        this.corsProxy = 'https://cors-anywhere.herokuapp.com/';
    }
    
    async toSolar(year, month, day) {
        const params = new URLSearchParams({
            lunYear: year.toString().padStart(4, '0'),
            lunMonth: month.toString().padStart(2, '0'),
            lunDay: day.toString().padStart(2, '0'),
            ServiceKey: decodeURIComponent(this.serviceKey)
        });
        
        const url = `${this.baseUrl}?${params}`;
        
        try {
            // Try direct API call first
            let response = await fetch(url);
            
            // If CORS fails, try with proxy
            if (!response.ok && response.status === 0) {
                console.log('Direct API call failed, trying with CORS proxy...');
                response = await fetch(this.corsProxy + url);
            }
            
            const text = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, "text/xml");
            
            // Extract solar date from XML response
            const solYear = xmlDoc.querySelector('solYear')?.textContent;
            const solMonth = xmlDoc.querySelector('solMonth')?.textContent;
            const solDay = xmlDoc.querySelector('solDay')?.textContent;
            
            if (!solYear || !solMonth || !solDay) {
                throw new Error('Invalid response from API');
            }
            
            return new Date(
                parseInt(solYear),
                parseInt(solMonth) - 1,
                parseInt(solDay)
            );
            
        } catch (error) {
            console.error('API Error:', error);
            // Fallback to local calculation
            console.log('Falling back to local lunar calendar calculation...');
            return this.localLunarToSolar(year, month, day);
        }
    }
    
    // Simplified local calculation as fallback
    localLunarToSolar(year, month, day) {
        // Basic lunar to solar conversion (simplified)
        // This is an approximation when API fails
        const lunarMonthDays = [29, 30]; // Alternating 29/30 days
        const daysInMonth = lunarMonthDays[month % 2];
        
        // Approximate offset (lunar new year usually falls between Jan 21 - Feb 20)
        const baseDate = new Date(year, 0, 21); // Approximate lunar new year
        
        let dayOffset = 0;
        for (let m = 1; m < month; m++) {
            dayOffset += lunarMonthDays[m % 2];
        }
        dayOffset += day - 1;
        
        const resultDate = new Date(baseDate);
        resultDate.setDate(resultDate.getDate() + dayOffset);
        
        return resultDate;
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
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Show/hide repeat years input based on repeat type
    repeatTypeSelect.addEventListener('change', function() {
        if (this.value === 'yearly') {
            repeatYearsGroup.style.display = 'block';
        } else {
            repeatYearsGroup.style.display = 'none';
        }
    });
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const eventName = document.getElementById('eventName').value;
        const lunarYear = parseInt(document.getElementById('lunarYear').value);
        const lunarMonth = parseInt(document.getElementById('lunarMonth').value);
        const lunarDay = parseInt(document.getElementById('lunarDay').value);
        const isLeapMonth = document.getElementById('isLeapMonth').checked;
        const repeatType = document.getElementById('repeatType').value;
        const repeatYears = parseInt(document.getElementById('repeatYears').value) || 1;
        
        // Note: The API doesn't handle leap months, so we'll ignore that parameter
        if (isLeapMonth) {
            alert('Note: The Korean government API does not distinguish leap months. Proceeding with regular month calculation.');
        }
        
        const lunar = new LunarCalendarAPI();
        const icsGen = new ICSGenerator();
        
        // Disable button during processing
        submitButton.disabled = true;
        submitButton.textContent = 'Generating...';
        
        try {
            if (repeatType === 'yearly') {
                for (let i = 0; i < repeatYears; i++) {
                    const targetYear = lunarYear + i;
                    if (targetYear <= 2100) {
                        const solarDate = await lunar.toSolar(targetYear, lunarMonth, lunarDay);
                        icsGen.addEvent(eventName, solarDate);
                    }
                }
            } else {
                const solarDate = await lunar.toSolar(lunarYear, lunarMonth, lunarDay);
                icsGen.addEvent(eventName, solarDate);
            }
            
            const filename = `${eventName.replace(/[^a-z0-9]/gi, '_')}_lunar_dates.ics`;
            icsGen.download(filename);
            
        } catch (error) {
            alert('Error: ' + error.message + '\n\nPlease check the browser console for more details.');
            console.error('Full error:', error);
        } finally {
            // Re-enable button
            submitButton.disabled = false;
            submitButton.textContent = 'Generate ICS File';
        }
    });
});