import React from 'react';
import { cn } from '@/lib/utils';

const Tabs = ({ value, onValueChange, children, className, ...props }) => {
  return (
    <div className={cn("w-full", className)} {...props}>
      {React.Children.map(children, child => 
        React.cloneElement(child, { value, onValueChange })
      )}
    </div>
  );
};

const TabsList = React.forwardRef(({ className, children, value, onValueChange, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500",
      className
    )}
    {...props}
  >
    {React.Children.map(children, child => 
      React.cloneElement(child, { value, onValueChange })
    )}
  </div>
));
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef(({ className, children, value: triggerValue, value: currentValue, onValueChange, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      currentValue === triggerValue ? "bg-white text-gray-950 shadow-sm" : "text-gray-600 hover:text-gray-900",
      className
    )}
    onClick={() => onValueChange(triggerValue)}
    {...props}
  >
    {children}
  </button>
));
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = ({ className, children, value: contentValue, value: currentValue, ...props }) => {
  if (currentValue !== contentValue) return null;
  
  return (
    <div
      className={cn(
        "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };