import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_0_20px_rgba(0,245,255,0.3)] font-semibold',
        secondary:
          'bg-[#141A2E] text-slate-100 hover:bg-[#1C243E] border border-white/10 hover:border-cyan-500/40',
        outline:
          'border border-white/15 bg-transparent hover:bg-white/5 text-slate-200 hover:text-white hover:border-cyan-400/50',
        ghost:
          'hover:bg-white/5 text-slate-300 hover:text-white',
        destructive:
          'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30',
        cyber:
          'bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-semibold hover:opacity-90 shadow-[0_0_25px_rgba(0,245,255,0.4)]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-lg px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export { Button, buttonVariants };
