import React, { useState, useMemo } from 'react';
import {
    LuChevronLeft,
    LuChevronRight,
    LuCalendar,
    LuMusic,
    LuBookOpen,
    LuMonitor,
    LuUsers,
    LuHeartHandshake,
    LuMegaphone,
    LuFlag,
    LuPartyPopper,
    LuCoffee,
    LuClock,
    LuInfo,
    LuLayoutList
} from "react-icons/lu";

// --- Types ---

export interface ActivityRaw {
    mes: string;
    semana: string;
    dia: string;
    horario: string;
    actividad: string;
    categoria: string;
    metaDetalle: string;
}

interface CalendarEvent extends ActivityRaw {
    id: string;
    dateObj?: Date; // If it has a specific date
    isFloat: boolean; // If it's a floating/async task for the month
}

// --- Helpers ---

const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEKDAYS_MAP: Record<string, number> = {
    'domingo': 0,
    'lunes': 1,
    'martes': 2,
    'miércoles': 3,
    'miercoles': 3,
    'jueves': 4,
    'viernes': 5,
    'sábado': 6,
    'sabado': 6,
};

// Helper: Get icon and color based on category
const getCategoryStyle = (category: string) => {
    const normCat = (category || '').toLowerCase();

    if (normCat.includes('formación'))
        return { color: 'text-blue-600', bg: 'bg-blue-100', dot: 'bg-blue-500', border: 'border-blue-200', icon: LuBookOpen };
    if (normCat.includes('ensayo'))
        return { color: 'text-purple-600', bg: 'bg-purple-100', dot: 'bg-purple-500', border: 'border-purple-200', icon: LuMusic };
    if (normCat.includes('digitalización'))
        return { color: 'text-emerald-600', bg: 'bg-emerald-100', dot: 'bg-emerald-500', border: 'border-emerald-200', icon: LuMonitor };
    if (normCat.includes('evento'))
        return { color: 'text-amber-600', bg: 'bg-amber-100', dot: 'bg-amber-500', border: 'border-amber-200', icon: LuCalendar };
    if (normCat.includes('ministerios'))
        return { color: 'text-slate-600', bg: 'bg-slate-100', dot: 'bg-slate-500', border: 'border-slate-200', icon: LuUsers };
    if (normCat.includes('recaudación'))
        return { color: 'text-orange-600', bg: 'bg-orange-100', dot: 'bg-orange-500', border: 'border-orange-200', icon: LuHeartHandshake };
    if (normCat.includes('evangelismo'))
        return { color: 'text-rose-600', bg: 'bg-rose-100', dot: 'bg-rose-500', border: 'border-rose-200', icon: LuMegaphone };
    if (normCat.includes('hito'))
        return { color: 'text-indigo-600', bg: 'bg-indigo-100', dot: 'bg-indigo-500', border: 'border-indigo-200', icon: LuFlag };
    if (normCat.includes('celebración'))
        return { color: 'text-pink-600', bg: 'bg-pink-100', dot: 'bg-pink-500', border: 'border-pink-200', icon: LuPartyPopper };
    if (normCat.includes('descanso') || normCat.includes('vacaciones'))
        return { color: 'text-teal-600', bg: 'bg-teal-100', dot: 'bg-teal-500', border: 'border-teal-200', icon: LuCoffee };

    return { color: 'text-gray-600', bg: 'bg-gray-100', dot: 'bg-gray-500', border: 'border-gray-200', icon: LuCalendar };
};

// Helper: Calculate date from "Enero, Semana 1, Jueves"
// Year default 2025
const calculateDate = (monthName: string, weekStr: string, dayStr: string, year = 2025): Date | null => {
    const monthIdx = MONTHS.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
    if (monthIdx === -1) return null;

    // If day is "Variable" or "-", it's floating
    if (!dayStr || dayStr === '-' || dayStr.toLowerCase().includes('variable') || dayStr.toLowerCase().includes('asíncrono')) {
        return null;
    }

    // Handle "Sábado/Dom" - tricky, but let's just pick Saturday for the anchor
    let targetDayName = dayStr.split('/')[0].trim().toLowerCase();

    const targetDayIdx = WEEKDAYS_MAP[targetDayName];
    if (targetDayIdx === undefined) return null; // Can't parse day

    const weekNum = parseInt(weekStr);
    if (isNaN(weekNum)) return null;

    // Algorithm: Find the Nth occurrence of Weekday in Month
    const date = new Date(year, monthIdx, 1);
    let count = 0;

    // Advance to the end of the month
    while (date.getMonth() === monthIdx) {
        if (date.getDay() === targetDayIdx) {
            count++;
            if (count === weekNum) {
                return new Date(date); // Found it
            }
        }
        date.setDate(date.getDate() + 1);
    }

    return null; // Week number out of range for this month
};

// --- Component ---

export default function CalendarApp({ data }: { data: ActivityRaw[] }) {
    // Initialize with Jan 2025
    const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1));
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

    // Process data into events with real dates
    const events = useMemo(() => {
        const processed: CalendarEvent[] = [];
        data.forEach((item, idx) => {
            // Clean inputs
            const m = item.mes.trim();
            const w = item.semana.trim();
            const d = item.dia.trim();

            // Handle "Sábado/Dom" special case: create two events
            if (d.toLowerCase().includes('sábado/dom')) {
                const dateSat = calculateDate(m, w, 'Sábado');
                if (dateSat) processed.push({ ...item, id: `sat-${idx}`, dateObj: dateSat, isFloat: false, dia: 'Sábado' });

                const dateSun = calculateDate(m, w, 'Domingo');
                if (dateSun) processed.push({ ...item, id: `sun-${idx}`, dateObj: dateSun, isFloat: false, dia: 'Domingo' });

                return;
            }

            const calculatedDate = calculateDate(m, w, d);

            processed.push({
                ...item,
                id: `evt-${idx}`,
                dateObj: calculatedDate || undefined,
                isFloat: !calculatedDate
            });
        });
        return processed;
    }, [data]);

    // Derived state for calendar grid
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun

    // Generate grid cells
    // We want to start from the previous month's days to fill the first row
    const daysArray = [];

    // Previous month fill
    for (let i = 0; i < firstDayOfMonth; i++) {
        daysArray.push({ type: 'empty', id: `prev-${i}` });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(year, month, i);
        // Find events for this day
        const dayEvents = events.filter(e =>
            e.dateObj &&
            e.dateObj.getDate() === i &&
            e.dateObj.getMonth() === month &&
            e.dateObj.getFullYear() === year
        );
        daysArray.push({ type: 'day', day: i, date: d, events: dayEvents, id: `day-${i}` });
    }

    // Floating events for SIDEBAR (events in this month but no specific date)
    const floatingEvents = events.filter(e =>
        e.isFloat &&
        e.mes.toLowerCase() === MONTHS[month].toLowerCase()
    );

    // Handlers
    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const weekHeaders = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    return (
        <div className="flex flex-col lg:flex-row gap-8 min-h-[800px]">

            {/* --- Main Calendar Area --- */}
            <div className="flex-1 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white">
                    <h2 className="text-2xl font-bold text-slate-800 capitalize flex items-center gap-2">
                        <LuCalendar className="text-blue-600" />
                        {MONTHS[month]} <span className="text-slate-400 font-normal">{year}</span>
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
                            <LuChevronLeft size={24} />
                        </button>
                        <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
                            <LuChevronRight size={24} />
                        </button>
                    </div>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
                    {weekHeaders.map(h => (
                        <div key={h} className="py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            {h}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 flex-1 auto-rows-[minmax(120px,1fr)] bg-slate-50 gap-px border-b border-slate-200">
                    {daysArray.map((cell) => {
                        if (cell.type === 'empty') {
                            return <div key={cell.id} className="bg-white/50" />;
                        }

                        const hasEvents = cell.events && cell.events.length > 0;
                        const isToday = new Date().toDateString() === cell.date?.toDateString();

                        return (
                            <div key={cell.id} className={`bg-white p-2 flex flex-col transition-colors hover:bg-slate-50 relative group ${isToday ? 'bg-blue-50/30' : ''}`}>
                                <span className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-slate-700'}`}>
                                    {cell.day}
                                </span>

                                <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[120px] scrollbar-hide">
                                    {cell.events?.map(evt => {
                                        const style = getCategoryStyle(evt.categoria);
                                        return (
                                            <div
                                                key={evt.id}
                                                onClick={() => setSelectedEvent(evt)}
                                                className={`text-[10px] px-2 py-1 rounded border-l-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 shadow-sm truncate font-medium ${style.bg} ${style.color} ${style.border} border-l-[${style.dot}]`}
                                            >
                                                {evt.actividad}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* --- Sidebar (Floating Tasks & Details) --- */}
            <div className="lg:w-80 flex flex-col gap-6">

                {/* Selected Event Detail Card */}
                {selectedEvent ? (
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${getCategoryStyle(selectedEvent.categoria).bg} ${getCategoryStyle(selectedEvent.categoria).color}`}>
                                {selectedEvent.categoria}
                            </span>
                            <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-slate-600">×</button>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">{selectedEvent.actividad}</h3>

                        <div className="space-y-3 mt-4">
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <LuCalendar size={16} className="text-slate-400" />
                                <span>
                                    {selectedEvent.dateObj
                                        ? selectedEvent.dateObj.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
                                        : `${selectedEvent.mes} (Fecha variable)`}
                                </span>
                            </div>
                            {selectedEvent.horario !== '-' && (
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <LuClock size={16} className="text-slate-400" />
                                    <span>{selectedEvent.horario}</span>
                                </div>
                            )}
                            {selectedEvent.metaDetalle && (
                                <div className="flex items-start gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <LuInfo size={16} className="text-blue-400 mt-0.5 shrink-0" />
                                    <span className="italic">"{selectedEvent.metaDetalle}"</span>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center text-slate-400">
                        <p>Selecciona un evento para ver detalles</p>
                    </div>
                )}

                {/* Monthly Goals / Floating Tasks */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 flex-1">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <LuLayoutList className="text-emerald-500" />
                        Metas del Mes
                    </h3>

                    {floatingEvents.length === 0 ? (
                        <p className="text-sm text-slate-400 italic">No hay metas asíncronas para este mes.</p>
                    ) : (
                        <ul className="space-y-3">
                            {floatingEvents.map(evt => {
                                const style = getCategoryStyle(evt.categoria);
                                const Icon = style.icon;
                                return (
                                    <li key={evt.id} className="group p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 cursor-pointer" onClick={() => setSelectedEvent(evt)}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Icon size={14} className={style.color} />
                                            <span className={`text-[10px] font-bold uppercase ${style.color}`}>{evt.categoria}</span>
                                        </div>
                                        <p className="font-medium text-slate-700 text-sm">{evt.actividad}</p>
                                        {evt.metaDetalle && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{evt.metaDetalle}</p>}
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </div>

            </div>
        </div>
    );
}
