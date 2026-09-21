// src/components/common/FilterPanel/FilterPanel.tsx

import React from 'react';
import './FilterPanel.css';

export interface FilterField {
  key: string;
  label: string;
  type: 'select' | 'text' | 'number' | 'date' | 'custom' | 'fieldset';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
  customComponent?: React.ReactNode;
  // ✅ جدید: برای fieldset
  fieldsetTitle?: string;
  fieldsetFields?: FilterField[];
}

interface FilterPanelProps {
  fields: FilterField[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  className?: string;
  title?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  fields,
  values,
  onChange,
  className = '',
  title,
}) => {
  const handleChange = (key: string, value: any, type?: string) => {
    if (type === 'number' && value) {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue > 0) {
        onChange(key, numValue);
        return;
      }
      onChange(key, undefined);
      return;
    }
    onChange(key, value || undefined);
  };

  const renderField = (field: FilterField) => (
    <div key={field.key} className={`filter-group ${field.className || ''}`}>
      <label htmlFor={`filter-${field.key}`}>{field.label}</label>

      {field.type === 'select' ? (
        <select
          id={`filter-${field.key}`}
          value={values[field.key] || ''}
          onChange={(e) => handleChange(field.key, e.target.value)}
        >
          <option value="">همه</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : field.type === 'custom' ? (
        <div id={`filter-${field.key}`} className="filter-custom-wrapper">
          {field.customComponent || null}
        </div>
      ) : (
        <input
          id={`filter-${field.key}`}
          type={field.type === 'number' ? 'text' : field.type}
          placeholder={field.placeholder}
          value={values[field.key] || ''}
          onChange={(e) => handleChange(field.key, e.target.value, field.type)}
        />
      )}
    </div>
  );

  return (
    <div className={`filter-panel ${className}`}>
      {title && <h4 className="filter-panel-title">{title}</h4>}
      <div className="filter-grid">
        {fields.map((field) => {
          // ✅ اگه fieldset بود، کادر ساده بکش
          if (field.type === 'fieldset') {
            return (
              <div key={field.key} className="filter-fieldset">
                {field.fieldsetTitle && (
                  <div className="filter-fieldset-title">{field.fieldsetTitle}</div>
                )}
                <div className="filter-fieldset-grid">
                  {field.fieldsetFields?.map(renderField)}
                </div>
              </div>
            );
          }

          return renderField(field);
        })}
      </div>
    </div>
  );
};

export default FilterPanel;

// // src/components/common/FilterPanel/FilterPanel.tsx

// import React from 'react';
// import './FilterPanel.css';

// export interface FilterField {
//   key: string;
//   label: string;
//   type: 'select' | 'text' | 'number' | 'date';
//   options?: Array<{ value: string; label: string }>;
//   placeholder?: string;
//   defaultValue?: any;
//   className?: string;
// }

// interface FilterPanelProps {
//   fields: FilterField[];
//   values: Record<string, any>;
//   onChange: (key: string, value: any) => void;
//   className?: string;
//   title?: string;
// }

// export const FilterPanel: React.FC<FilterPanelProps> = ({
//   fields,
//   values,
//   onChange,
//   className = '',
//   title,
// }) => {
//   const handleChange = (key: string, value: any) => {
//     // ✅ اگر فیلد از نوع number است، مقدار را به عدد تبدیل کن
//     const field = fields.find(f => f.key === key);
//     if (field?.type === 'number' && value) {
//       const numValue = Number(value);
//       if (!isNaN(numValue) && numValue > 0) {
//         onChange(key, numValue);
//         return;
//       }
//       onChange(key, undefined);
//       return;
//     }
//     onChange(key, value || undefined);
//   };

//   return (
//     <div className={`filter-panel ${className}`}>
//       {title && <h4 className="filter-panel-title">{title}</h4>}
//       <div className="filter-grid">
//         {fields.map((field) => (
//           <div key={field.key} className={`filter-group ${field.className || ''}`}>
//             <label htmlFor={`filter-${field.key}`}>{field.label}</label>
//             {field.type === 'select' ? (
//               <select
//                 id={`filter-${field.key}`}
//                 value={values[field.key] || ''}
//                 onChange={(e) => handleChange(field.key, e.target.value)}
//               >
//                 <option value="">همه</option>
//                 {field.options?.map((opt) => (
//                   <option key={opt.value} value={opt.value}>
//                     {opt.label}
//                   </option>
//                 ))}
//               </select>
//             ) : (
//               <input
//                 id={`filter-${field.key}`}
//                 type={field.type === 'number' ? 'text' : field.type}
//                 placeholder={field.placeholder}
//                 value={values[field.key] || ''}
//                 onChange={(e) => handleChange(field.key, e.target.value)}
//               />
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default FilterPanel;