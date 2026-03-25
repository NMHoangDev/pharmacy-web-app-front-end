import React from 'react';
import { getAppointmentStatusLabel, getAppointmentStatusVariant } from '../../utils/appointmentStatus';

const StatusBadge = ({ status, className = "" }) => {
    const label = getAppointmentStatusLabel(status);
    const variant = getAppointmentStatusVariant(status);

    const baseClasses = "px-3 py-1 rounded-full text-xs font-bold border transition-colors duration-300";
    
    const variantStyles = {
        info: "bg-blue-50 text-blue-700 border-blue-200",
        success: "bg-emerald-50 text-emerald-700 border-emerald-200", // Using emerald for green
        danger: "bg-red-50 text-red-700 border-red-200",
        neutral: "bg-slate-100 text-slate-600 border-slate-200",
        warning: "bg-amber-50 text-amber-700 border-amber-200"
    };

    return (
        <span className={`${baseClasses} ${variantStyles[variant] || variantStyles.neutral} ${className}`}>
            {label}
        </span>
    );
};

export default StatusBadge;
