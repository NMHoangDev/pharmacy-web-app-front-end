import React from "react";

const TableCellText = ({ value, className = "", as = "span" }) => {
  const Component = as;
  const text = value == null || value === "" ? "-" : String(value);

  return (
    <Component
      title={text}
      className={`block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap ${className}`.trim()}
    >
      {text}
    </Component>
  );
};

export default TableCellText;
