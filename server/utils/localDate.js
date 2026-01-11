export function getLocalDateISO(timeZone = "Asia/Jerusalem", date = new Date()){
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone, 
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(date);

    const y = parts.find(p => p.type === "year").value;
    const m = parts.find(p => p.type === "month").value;
    const d = parts.find(p => p.type === "day").value;
    
    
    return `${y}-${m}-${d}`;
}

export function dayBetweenISO(a, b){
    const [ay, am, ad] = a.split("-").map(Number);
    const [by, bm, bd] = b.split("-").map(Number);
    const utcA = Date.UTC(ay, am - 1, ad);
    const utcB = Date.UTC(by, bm - 1, bd);
    return Math.round((utcB - utcA) / (24 * 60 * 60 * 1000));
}