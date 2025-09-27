import React from 'react';
import { cn } from '@/lib/utils';

const Select = ({ value, onValueChange, children }) => {
  return (
    <div className="relative">
      {React.Children.map(children, child => 
        React.cloneElement(child, { value, onValueChange })
      )}
    </div>
  );
};

const SelectTrigger = React.forwardRef(({ className, children, value, onValueChange, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
  </button>
));
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = ({ placeholder }) => (
  <span className="text-gray-500">{placeholder}</span>
);

const SelectContent = ({ children, value, onValueChange }) => (
  <div className="relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white text-gray-950 shadow-md">
    {React.Children.map(children, child => 
      React.cloneElement(child, { value, onValueChange })
    )}
  </div>
);

const SelectItem = ({ value: itemValue, children, value, onValueChange }) => (
  <div
    className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
    onClick={() => onValueChange(itemValue)}
  >
    {children}
  </div>
);

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };