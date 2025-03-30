import { InputProps } from '@/views/components/ui/input';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/views/components/ui/form';

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/views/components/ui/input-otp';

interface InputFormItemProps extends InputProps {
  control: any;
  name: string;
  label: string;
  description?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}

export function InputOTPFormItem({
  control,
  name,
  label,
  description,
  children,
  actions,
  ...props
}: InputFormItemProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }: any) => (
        <FormItem>
          <FormLabel
            className={`text-slate-900 dark:text-slate-100 ${
              children && 'flex justify-between items-center'
            }`}>
            <div>
              {label}
              {props.required && <span className="!text-red-500">*</span>}
            </div>

            {children}
          </FormLabel>
          <FormControl>
            <div className="relative">
              {actions}
              <InputOTP className="w-full" maxLength={6} {...field} {...props}>
                <InputOTPGroup className="w-full">
                  <InputOTPSlot className="w-full" index={0} />
                  <InputOTPSlot className="w-full" index={1} />
                  <InputOTPSlot className="w-full" index={2} />
                </InputOTPGroup>

                <InputOTPSeparator />

                <InputOTPGroup className="w-full">
                  <InputOTPSlot className="w-full" index={3} />
                  <InputOTPSlot className="w-full" index={4} />
                  <InputOTPSlot className="w-full" index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </FormControl>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
