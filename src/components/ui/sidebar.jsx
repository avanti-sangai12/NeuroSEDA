import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../utils/cn';
import { Menu } from 'lucide-react';

const SidebarContext = createContext();

const SidebarProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

const Sidebar = React.forwardRef(({ className, children, ...props }, ref) => (
  <aside
    ref={ref}
    className={cn("fixed left-0 top-0 z-40 h-screen w-64 transform transition-transform duration-300 ease-in-out", className)}
    {...props}
  >
    {children}
  </aside>
));
Sidebar.displayName = "Sidebar";

const SidebarHeader = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props}>
    {children}
  </div>
));
SidebarHeader.displayName = "SidebarHeader";

const SidebarContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props}>
    {children}
  </div>
));
SidebarContent.displayName = "SidebarContent";

const SidebarGroup = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props}>
    {children}
  </div>
));
SidebarGroup.displayName = "SidebarGroup";

const SidebarGroupContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props}>
    {children}
  </div>
));
SidebarGroupContent.displayName = "SidebarGroupContent";

const SidebarMenu = React.forwardRef(({ className, children, ...props }, ref) => (
  <nav ref={ref} className={cn("", className)} {...props}>
    {children}
  </nav>
));
SidebarMenu.displayName = "SidebarMenu";

const SidebarMenuItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props}>
    {children}
  </div>
));
SidebarMenuItem.displayName = "SidebarMenuItem";

const SidebarMenuButton = React.forwardRef(({ className, asChild, children, ...props }, ref) => {
  if (asChild) {
    return React.cloneElement(children, { ref, className: cn(className, children.props.className), ...props });
  }
  
  return (
    <button ref={ref} className={cn("", className)} {...props}>
      {children}
    </button>
  );
});
SidebarMenuButton.displayName = "SidebarMenuButton";

const SidebarTrigger = React.forwardRef(({ className, ...props }, ref) => {
  const { setIsOpen } = useSidebar();
  
  return (
    <button
      ref={ref}
      className={cn("", className)}
      onClick={() => setIsOpen(!useSidebar().isOpen)}
      {...props}
    >
      <Menu className="h-6 w-6" />
    </button>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

export {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar
};
